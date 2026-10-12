"""Voiceover + master timing for an episode.

Reads   episodes/<id>/script.json
Writes  public/episodes/<id>/vo/take-<scene>-<n>.mp3   (mastered audio, one file per take)
        episodes/<id>/vo-raw/take-<scene>-<n>.mp3      (untouched ElevenLabs audio, the source for mastering)
        episodes/<id>/vo-cache.json                    (what was generated, so unchanged takes are never re-billed)
        src/episodes/<id>/timing.json                  (scene/line frames + word-timed caption chunks for Remotion)

A scene is voiced as ONE continuous take, the way a narrator reads a paragraph, so pauses and
pitch follow the whole sentence instead of resolving at the end of every line. A line with
`pauseBefore` starts a new take (a deliberate breath). Lines and words are placed inside each take
from ElevenLabs' character timestamps, so animation still syncs to line ids and words.

Usage:
  python -I scripts/voiceover.py <episode-id>             generate missing/changed takes, rebuild timing
  python -I scripts/voiceover.py <episode-id> --estimate  no API calls: estimate durations (for previews before VO)
  python -I scripts/voiceover.py <episode-id> --force hook-2 take-journey-1   regenerate the takes holding these lines/takes
  python -I scripts/voiceover.py <episode-id> --estimate-new  real audio for cached takes, estimates for new/changed
                                                            ones, no API calls (previews of a revised script before approval)

Line text markup: {display|spoken} shows `display` in captions but sends `spoken` to the voice,
e.g. "{Rp 1,61 miliar|satu koma enam satu miliar rupiah}". See docs/script-format.md.

Config comes from .env: ELEVENLABS_API_KEY (required for real VO), ELEVENLABS_VOICE_ID,
ELEVENLABS_MODEL_ID (default eleven_multilingual_v2). script.json "voice" can override settings.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
DEFAULT_MODEL = "eleven_multilingual_v2"
# Calm, natural read: no style exaggeration and normal speed (both bend intonation in odd places).
DEFAULT_SETTINGS = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}

LEAD_SEC = 0.35      # silence at the start of a scene before its first take
GAP_SEC = 0.3        # pause between takes (inside a take, the voice sets its own pauses)
TAIL_SEC = 0.45      # hold after a scene's last take
EST_CPS = 15.5       # estimate mode: spoken characters per second at speed 1.0
CHUNK_MAX_CHARS = 30
CHUNK_MAX_WORDS = 6
# Every take is normalized to this loudness after generation. Library voices arrive at very
# different levels (Pratama ≈ −32 LUFS), and SFX levels in docs/style-guide.md assume a voice here.
VO_LUFS = -16.0
NORM_TAG = f"r128{VO_LUFS:g}+limiter"  # bump to re-master every cached take from vo-raw/

MARKUP = re.compile(r"\{([^{}|]+)\|([^{}]+)\}")


def load_env() -> None:
    env = ROOT / ".env"
    if not env.exists():
        return
    for raw in env.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def parse_line(text: str) -> tuple[str, str, list[tuple[str, int, int]]]:
    """Return (display, spoken, tokens). Each token is (display text, spoken start, spoken end)."""
    display_parts, spoken_parts, tokens = [], [], []
    pos = 0

    def add_plain(chunk: str) -> None:
        offset = sum(len(p) for p in spoken_parts)
        for m in re.finditer(r"\S+", chunk):
            tokens.append((m.group(), offset + m.start(), offset + m.end()))
        display_parts.append(chunk)
        spoken_parts.append(chunk)

    for m in MARKUP.finditer(text):
        add_plain(text[pos:m.start()])
        shown, said = m.group(1), m.group(2)
        offset = sum(len(p) for p in spoken_parts)
        tokens.append((shown.replace(" ", " "), offset, offset + len(said)))
        display_parts.append(shown)
        spoken_parts.append(said)
        pos = m.end()
    add_plain(text[pos:])

    # Punctuation right after a {display|spoken} token belongs to that caption word.
    merged: list[tuple[str, int, int]] = []
    for tok in tokens:
        if merged and re.fullmatch(r"[.,!?:;…%)]+", tok[0]):
            prev = merged.pop()
            merged.append((prev[0] + tok[0], prev[1], tok[2]))
        else:
            merged.append(tok)
    return "".join(display_parts), "".join(spoken_parts), merged


def cache_key(spoken: str, voice: str, model: str, settings: dict) -> str:
    blob = json.dumps([spoken, voice, model, settings], sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode()).hexdigest()[:16]


def eleven(spoken: str, voice: str, model: str, settings: dict, prev: str, nxt: str) -> dict:
    body = {"text": spoken, "model_id": model, "voice_settings": settings}
    if not model.startswith("eleven_v3"):  # v3 has no request stitching; v2 uses neighbours for continuity
        body.update({"previous_text": prev or None, "next_text": nxt or None})
    req = urllib.request.Request(
        API.format(voice=voice),
        data=json.dumps(body).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs error {e.code}: {e.read().decode(errors='replace')[:400]}")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, cwd=ROOT, shell=sys.platform == "win32",
    )
    return float(out.stdout.strip().splitlines()[-1])


def _ff(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["npx", "remotion", "ffmpeg", *args], capture_output=True, text=True, cwd=ROOT, shell=sys.platform == "win32")


FFMPEG_BLOCKED = (
    "Remotion's ffmpeg won't run, so voice takes can't be mastered (and videos can't render). Nothing was sent to\n"
    "ElevenLabs. On Windows this is usually Smart App Control blocking node_modules/@remotion/compositor-win32-x64-msvc/\n"
    "ffmpeg.exe ('An Application Control policy has blocked this file'). The user decides how to resolve it; see CLAUDE.md -> Gotchas."
)


def ffmpeg_ok() -> bool:
    """Pre-flight: does Remotion's ffmpeg actually run? (When blocked, `npx remotion ffmpeg` exits 0 silently.)"""
    res = _ff("-hide_banner", "-version")
    return "ffmpeg version" in (res.stdout + res.stderr)


def _loudness(path: Path, extra: str = "") -> dict:
    res = _ff("-hide_banner", "-nostats", "-i", str(path), "-af", f"loudnorm=I={VO_LUFS}:TP=-1.5:LRA=11{extra}:print_format=json", "-f", "null", "-")
    return json.loads(res.stderr[res.stderr.rindex("{"): res.stderr.rindex("}") + 1])


def _limit(path: Path, gain_db: float, ceiling_db: float = -2.0) -> None:
    """Gain + look-ahead peak limiter (the bundled ffmpeg has none), in place."""
    sr = 44100
    # Decode via a temp file: binary stdout doesn't survive the npx wrapper on Windows.
    src = path.with_suffix(".src.wav")
    _ff("-v", "error", "-y", "-i", str(path), "-ac", "1", "-ar", str(sr), "-c:a", "pcm_s16le", str(src))
    _, pcm = wavfile.read(src)
    src.unlink()
    x = pcm.astype(np.float64) / 32768 * 10 ** (gain_db / 20)
    look = int(0.004 * sr)
    env = maximum_filter1d(np.abs(x), size=2 * look + 1)
    target = np.minimum(1.0, 10 ** (ceiling_db / 20) / np.maximum(env, 1e-9))
    release = 1 - np.exp(-1 / (0.06 * sr))  # gain recovers over ~60 ms
    gain = np.empty_like(target)
    cur = 1.0
    for n, t in enumerate(target):
        cur = t if t < cur else cur + (t - cur) * release
        gain[n] = cur
    wav = path.with_suffix(".lim.wav")
    wavfile.write(wav, sr, (np.clip(x * gain, -1, 1) * 32767).astype(np.int16))
    res = _ff("-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "128k", str(path))
    wav.unlink()
    if res.returncode != 0:
        sys.exit(f"limiter encode failed on {path.name}: {res.stderr[-300:]}")


def master(raw: Path, out: Path) -> None:
    """Raw ElevenLabs take → mastered take at VO_LUFS. Library voices arrive at very different
    levels; linear two-pass loudnorm first, then a limiter for peaky takes it couldn't lift."""
    m = _loudness(raw)
    measured = f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    res = _ff("-v", "error", "-y", "-i", str(raw), "-af", f"loudnorm=I={VO_LUFS}:TP=-1.5:LRA=11{measured}",
              "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", str(out))
    if res.returncode != 0:
        sys.exit(f"loudnorm failed on {raw.name}: {res.stderr[-300:]}")
    short = VO_LUFS - float(_loudness(out)["input_i"])
    added = 0.0
    for _ in range(3):  # limiting shaves loudness off the peaks, so converge in a few passes
        if short <= 1.0:
            break
        _limit(out, short)
        added += short
        short = VO_LUFS - float(_loudness(out)["input_i"])
    if added:
        print(f"    {out.stem}: peaky take, limiter added {added:.1f} dB (now {VO_LUFS - short:.1f} LUFS)")


def word_times(tokens, alignment: dict | None, spoken: str, duration: float) -> list[tuple[str, float, float]]:
    """Seconds (relative to the take start) for each display token."""
    if alignment and len(alignment["characters"]) == len(spoken):
        starts, ends = alignment["character_start_times_seconds"], alignment["character_end_times_seconds"]
        return [(txt, starts[a], ends[b - 1]) for txt, a, b in tokens]
    total = max(1, len(spoken))
    return [(txt, duration * a / total, duration * b / total) for txt, a, b in tokens]


ONSET_DBFS = -40.0   # speech; breaths sit around −50…−60 dBFS in mastered takes
ONSET_WIN = 1 / 120  # analysis window, seconds


def speech_envelope(path: Path) -> np.ndarray:
    """dBFS per ONSET_WIN window of a take (decoded via a temp WAV: the npx wrapper drops binary stdout)."""
    wav = path.with_suffix(".env.wav")
    _ff("-v", "error", "-y", "-i", str(path), "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", str(wav))
    sr, pcm = wavfile.read(wav)
    wav.unlink()
    n = int(sr * ONSET_WIN)
    x = pcm[: len(pcm) // n * n].astype(np.float64).reshape(-1, n) / 32768
    return 20 * np.log10(np.sqrt((x ** 2).mean(axis=1)) + 1e-9)


def snap_onsets(times: list[tuple[str, float, float]], env: np.ndarray, min_shift: float = 0.15) -> list[tuple[str, float, float]]:
    """The aligner gives a pause to the word after it, so words that follow a pause start too early.
    Move such a word's start to the first window that is actually speech (only if ≥ min_shift later
    and still before the word ends); words inside running speech are already loud and stay put."""
    out = []
    for txt, w0, w1 in times:
        i = int(w0 / ONSET_WIN)
        while i < len(env) and env[i] < ONSET_DBFS and (i + 1) * ONSET_WIN < w1:
            i += 1
        onset = i * ONSET_WIN
        out.append((txt, onset if min_shift <= onset - w0 and onset < w1 else w0, w1))
    return out


def chunk_words(words: list[dict]) -> list[list[dict]]:
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        text = " ".join(x["text"] for x in cur)
        breaks = re.search(r"[.,!?:;…]$", w["text"]) is not None
        if len(cur) >= CHUNK_MAX_WORDS or len(text) >= CHUNK_MAX_CHARS or (breaks and len(cur) >= 2):
            chunks.append(cur)
            cur = []
    if cur:
        if chunks and len(cur) == 1 and len(" ".join(x["text"] for x in chunks[-1] + cur)) <= CHUNK_MAX_CHARS + 14:
            chunks[-1].extend(cur)
        else:
            chunks.append(cur)
    return chunks


def takes_of(scene: dict) -> list[list[dict]]:
    """A scene's lines grouped into takes: a new take starts at every line with pauseBefore."""
    takes: list[list[dict]] = []
    for ln in scene["lines"]:
        if not takes or ln.get("pauseBefore", 0) > 0:
            takes.append([])
        takes[-1].append(ln)
    return takes


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--estimate", action="store_true", help="skip the API and estimate durations")
    ap.add_argument("--estimate-new", action="store_true", help="use cached audio, estimate uncached takes, no API calls")
    ap.add_argument("--force", nargs="*", default=[], help="line or take ids whose takes to regenerate")
    args = ap.parse_args()
    load_env()

    ep_dir = ROOT / "episodes" / args.episode
    script = json.loads((ep_dir / "script.json").read_text(encoding="utf-8"))
    fps = script.get("fps", 30)
    voice_cfg = script.get("voice", {})
    voice = voice_cfg.get("voiceId") or os.environ.get("ELEVENLABS_VOICE_ID", "")
    model = voice_cfg.get("modelId") or os.environ.get("ELEVENLABS_MODEL_ID", DEFAULT_MODEL)
    settings = {**DEFAULT_SETTINGS, **voice_cfg.get("settings", {})}
    estimate = args.estimate or not os.environ.get("ELEVENLABS_API_KEY")
    if not estimate and not voice:
        sys.exit("Set ELEVENLABS_VOICE_ID in .env (or voice.voiceId in script.json). List voices: python -I scripts/voices.py")
    if estimate and not args.estimate:
        print("No ELEVENLABS_API_KEY in .env, so durations are ESTIMATED and no audio is made.")
    if not estimate and not args.estimate_new and not ffmpeg_ok():
        sys.exit(FFMPEG_BLOCKED)

    audio_dir = ROOT / "public" / "episodes" / args.episode / "vo"
    audio_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = ep_dir / "vo-raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    cache_path = ep_dir / "vo-cache.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}

    # Every take: its spoken/display text and where each line sits inside it.
    parsed = {ln["id"]: parse_line(ln["text"]) for sc in script["scenes"] for ln in sc["lines"]}
    takes = []
    for sc in script["scenes"]:
        for n, group in enumerate(takes_of(sc), 1):
            spoken_parts, starts, offset = [], [], 0
            for ln in group:
                sp = parsed[ln["id"]][1]
                lead_ws = len(sp) - len(sp.lstrip())
                starts.append(offset - lead_ws)  # where this line's own character 0 lands in the take
                spoken_parts.append(sp.strip())
                offset += len(sp.strip()) + 1
            takes.append({
                "id": f"take-{sc['id']}-{n}", "scene": sc["id"], "lines": group, "starts": starts,
                "spoken": " ".join(spoken_parts),
                "display": " ".join(parsed[ln["id"]][0].strip() for ln in group),
            })
    force = {t["id"] for t in takes if t["id"] in args.force or any(ln["id"] in args.force for ln in t["lines"])}

    partial_estimate = False
    billed = 0
    for k, tk in enumerate(takes):
        guess = (len(tk["spoken"]) / EST_CPS / settings.get("speed", 1), None, None)
        if estimate:
            tk["audio"] = guess
            continue
        key = cache_key(tk["spoken"], voice, model, settings)
        mp3 = audio_dir / f"{tk['id']}.mp3"
        raw = raw_dir / mp3.name
        hit = cache.get(tk["id"])
        cached = bool(hit and hit["key"] == key and (mp3.exists() or raw.exists()))
        if args.estimate_new and not cached:
            tk["audio"] = guess
            partial_estimate = True
            continue
        if cached and tk["id"] not in force:
            if hit.get("norm") != NORM_TAG or not mp3.exists():  # not (or not currently) mastered: no API call
                if not raw.exists():
                    shutil.copyfile(mp3, raw)
                master(raw, mp3)
                hit["duration"], hit["norm"] = probe_duration(mp3), NORM_TAG
                cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
                print(f"  mastered {tk['id']} ({NORM_TAG})")
            tk["audio"] = (hit["duration"], hit["alignment"], mp3.name)
            continue
        prev = takes[k - 1]["spoken"] if k > 0 else ""
        nxt = takes[k + 1]["spoken"] if k + 1 < len(takes) else ""
        print(f"  voicing {tk['id']}: {tk['spoken']}")
        res = eleven(tk["spoken"], voice, model, settings, prev, nxt)
        raw.write_bytes(base64.b64decode(res["audio_base64"]))
        # Record the paid-for take BEFORE mastering, so a mastering failure never causes a re-bill.
        cache[tk["id"]] = {"key": key, "duration": probe_duration(raw), "alignment": res.get("alignment"),
                           "chars": len(tk["spoken"]), "norm": None, "lines": [ln["id"] for ln in tk["lines"]]}
        cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
        billed += len(tk["spoken"])
        master(raw, mp3)
        cache[tk["id"]]["duration"], cache[tk["id"]]["norm"] = probe_duration(mp3), NORM_TAG
        cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
        tk["audio"] = (cache[tk["id"]]["duration"], res.get("alignment"), mp3.name)

    # Lay scenes, takes and lines out on the master timeline.
    f = lambda sec: int(round(sec * fps))  # noqa: E731
    cursor = 0.0
    scenes, voice_track, lines, captions = [], [], [], []
    by_scene: dict[str, list[dict]] = {}
    for tk in takes:
        by_scene.setdefault(tk["scene"], []).append(tk)
    for sc in script["scenes"]:
        start = cursor
        t = start + sc.get("leadSec", LEAD_SEC)
        for tk in by_scene.get(sc["id"], []):
            t += tk["lines"][0].get("pauseBefore", 0)
            dur, alignment, fname = tk["audio"]
            voice_track.append({
                "id": tk["id"], "scene": sc["id"], "from": f(t), "dur": max(1, f(dur)),
                "audio": f"episodes/{args.episode}/vo/{fname}" if fname else None,
                "display": tk["display"], "spoken": tk["spoken"],
            })
            env = speech_envelope(audio_dir / fname) if fname else None
            for ln, base in zip(tk["lines"], tk["starts"]):
                display, spoken, tokens = parsed[ln["id"]]
                times = word_times([(x, a + base, b + base) for x, a, b in tokens], alignment, tk["spoken"], dur)
                if env is not None:
                    times = snap_onsets(times, env)
                words = [{"text": txt, "from": f(t + w0), "to": max(f(t + w0) + 1, f(t + w1))} for txt, w0, w1 in times]
                if not words:
                    continue
                line_from, line_to = words[0]["from"], words[-1]["to"]
                lines.append({
                    "id": ln["id"], "scene": sc["id"], "take": tk["id"], "from": line_from, "dur": max(1, line_to - line_from),
                    "audio": None, "display": display, "spoken": spoken,
                })
                groups = chunk_words(words)
                for g_i, g in enumerate(groups):
                    end = groups[g_i + 1][0]["from"] if g_i + 1 < len(groups) else g[-1]["to"]
                    captions.append({"line": ln["id"], "from": g[0]["from"], "to": end, "words": g})
            t += dur + GAP_SEC
        end = max(start + sc.get("minSec", 0), t - GAP_SEC + sc.get("tailSec", TAIL_SEC))
        scenes.append({"id": sc["id"], "from": f(start), "dur": f(end) - f(start)})
        cursor = end

    # Bridge short gaps between caption cards so they don't blink off between phrases of one take.
    for prev_c, next_c in zip(captions, captions[1:]):
        if 0 < next_c["from"] - prev_c["to"] <= 30:
            prev_c["to"] = next_c["from"]

    timing = {
        "episode": args.episode,
        "fps": fps,
        "estimated": estimate or partial_estimate,
        "totalFrames": scenes[-1]["from"] + scenes[-1]["dur"],
        "scenes": scenes,
        "voice": voice_track,
        "lines": lines,
        "captions": captions,
    }
    out = ROOT / "src" / "episodes" / args.episode / "timing.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding="utf-8")
    total = timing["totalFrames"] / fps
    label = "ESTIMATED " if estimate else ("PARTLY ESTIMATED " if partial_estimate else "")
    print(f"{label}timing: {len(scenes)} scenes, {len(takes)} takes, {len(lines)} lines, {total:.1f}s → {out.relative_to(ROOT)}")
    if billed:
        print(f"ElevenLabs characters billed this run: {billed}")


if __name__ == "__main__":
    main()
