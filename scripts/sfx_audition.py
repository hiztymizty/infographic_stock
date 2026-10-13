"""Audition files for the musical SFX palette (scripts/sfx_synth.py → palette()).

Usage: python -I scripts/sfx_audition.py ep01-ihsg-dca

Writes episodes/<id>/qa/sfx-audition.{wav,mp3,md} (every palette sound twice, ~1 s apart, at its
proposed default volume) and episodes/<id>/qa/sfx-demo.{wav,mp3} (cues placed the way the ep01
scenes use them, over the real voice takes, before the render's final loudness gain).
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
SR = 48_000
FPS = 30

# (name or layered pseudo-name, slot it replaces, default volume, description)
ORDER = [
    ("bloom", "whoosh-soft · scene change (shell)", 0.3, "Soft open D chord swelling in like a reversed bell; peaks ~5 frames in."),
    ("swell", "whoosh · big entrance / bars growing / clip change", 0.4, "Rolled reversed-glass D add9 rising into a mallet D5 + felt low D; peaks ~7 frames in."),
    ("pluck", "pop · chips, labels, callouts", 0.35, "Soft marimba A4 with a wooden body."),
    ("pluck-low", "pop · (variant) heavier label / question", 0.35, "Soft marimba D4, the home note."),
    ("pluck-high", "pop · (variant) light chip / pill", 0.35, "Soft marimba D5, a bit lighter."),
    ("step-run", "tick · counter / grid fill (step-1..step-8)", 0.18, "Kalimba run A4 B4 D5 E5 F#5 A5 B5 D6, one note per fill step (5 frames apart here)."),
    ("chime", "ding · milestone reached", 0.3, "Glass bells A5 → D6 (rising fourth) over a soft D5: the Hakabot motif."),
    ("glint", "coin · money landing", 0.25, "Tiny two-note glass sparkle D6 → A6."),
    ("ascend", "riser · build-up before a reveal", 0.25, "Accelerating pentatonic kalimba arpeggio over a pad whose filter opens; stops on A, unresolved."),
    ("descend", "swoosh-down · a decline starting", 0.25, "Falling D-minor mallet figure A4 F4 D4 A3, each note sagging in pitch."),
    ("sink", "drop · the fall itself", 0.3, "Low D-minor chord on a tape slowing to a stop."),
    ("thud", "impact · the crash lands (max 3 per video)", 0.45, "Felt low-D doom (sub glide + D1) with a dark D/F mallet cluster and a soft noise bloom."),
    ("sour", "glitch · shock accent, paired with the crash", 0.3, "Detuned, wobbling D/Eb/Ab glass cluster (minor second + tritone)."),
    ("thud+sour", "impact + glitch · the pair as Journey fires it", 0.45, "thud at 0.45 with sour at 0.3 on the same frame."),
    ("bell-bloom", "shimmer · peak reveal", 0.4, "Rolled D add9 glass chord up the scale (D5 F#5 A5 E6), bright body front-loaded."),
    ("signature", "shimmer (+ pop) · logo / end card", 0.4, "Hakabot sonic logo: A4 → D5 mallet+glass motif landing on a warm D add9 chord with a felt D2."),
]
STEP_GAP = 5  # frames between steps in the audition run


def load(path: Path) -> np.ndarray:
    sr, x = wavfile.read(path)
    assert sr == SR, path
    x = x.astype(np.float64) / 32767
    return x if x.ndim == 1 else x.mean(axis=1)


def sfx(name: str) -> np.ndarray:
    return load(ROOT / "public" / "sfx" / f"{name}.wav")


def mix(buf: np.ndarray, x: np.ndarray, at_sec: float, gain: float) -> None:
    i = int(round(at_sec * SR))
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i:i + n] += gain * x[:n]


def ffmpeg(*args: str) -> None:
    r = subprocess.run(["npx", "remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args],
                       cwd=ROOT, shell=sys.platform == "win32", capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(r.stderr)


def decode(mp3: Path) -> np.ndarray:
    with tempfile.TemporaryDirectory() as d:
        out = Path(d) / "x.wav"
        ffmpeg("-i", str(mp3), "-ac", "1", "-ar", str(SR), str(out))
        return load(out)


def write(base: Path, x: np.ndarray) -> None:
    wavfile.write(base.with_suffix(".wav"), SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    ffmpeg("-i", str(base.with_suffix(".wav")), "-c:a", "libmp3lame", "-b:a", "192k", str(base.with_suffix(".mp3")))
    print(base.with_suffix(".mp3"), f"{len(x) / SR:.1f}s")


def layer(name: str) -> np.ndarray:
    if name == "step-run":
        out = np.zeros(int(SR * (7 * STEP_GAP / FPS + 0.5)))
        for k in range(8):
            mix(out, sfx(f"step-{k + 1}"), k * STEP_GAP / FPS, 1.0)
        return out
    if name == "thud+sour":
        a, b = sfx("thud"), sfx("sour")
        out = np.zeros(max(len(a), len(b)))
        out[:len(a)] += a
        out[:len(b)] += 0.3 / 0.45 * b
        return out
    return sfx(name)


DEMO_NOTES: list[str] = []


def audition(qa: Path) -> None:
    gap, lead = 1.0, 0.5
    clips = [(n, slot, v, d, layer(n) * v) for n, slot, v, d in ORDER]
    total = lead + sum(2 * len(c) / SR + 2 * gap for *_, c in clips)
    buf = np.zeros(int(SR * total) + SR)
    rows, at = [], lead
    for n, slot, v, d, c in clips:
        starts = []
        for _ in range(2):
            mix(buf, c, at, 1.0)
            starts.append(at)
            at += len(c) / SR + gap
        rows.append((n, slot, v, d, starts))
    buf = buf[: int(SR * (at - gap + 0.5))]
    gain = 0.89 / np.abs(buf).max()  # one gain for the whole file, so relative levels stay as proposed
    write(qa / "sfx-audition", buf * gain)

    def ts(s: float) -> str:
        return f"{int(s // 60)}:{s % 60:04.1f}"

    out = [
        "# SFX audition · musical palette (proposal, not wired in yet)",
        "",
        "Files: `sfx-audition.mp3` (and `.wav`). Every sound plays twice, about 1 s apart, in the order below.",
        f"Each is played at its proposed default `<Sfx volume>`; the whole file then gets one gain (x{gain:.2f}) so the",
        "relative levels are exactly as they would sit in a video. `sfx-demo.mp3` puts them in context over the ep01 voice.",
        "Regenerate: `python -I scripts/sfx_synth.py --palette` then `python -I scripts/sfx_audition.py ep01-ihsg-dca`.",
        "",
        "Key: **D major pentatonic** (D E F# A B). Dark cues borrow D minor (F) and a sour Eb/Ab, but all land on D.",
        "",
        "| # | Time (1st / 2nd) | Sound | Replaces (slot) | Volume | What it is |",
        "|---|---|---|---|---|---|",
    ]
    for i, (n, slot, v, d, starts) in enumerate(rows, 1):
        out.append(f"| {i} | {ts(starts[0])} / {ts(starts[1])} | `{n}` | {slot} | {v} | {d} |")
    out += ["", "## sfx-demo.mp3 (in context, voice from the real ep01 takes)", ""] + DEMO_NOTES
    (qa / "sfx-audition.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(qa / "sfx-audition.md")


def demo(ep: str, qa: Path) -> None:
    timing = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    scenes = {s["id"]: s for s in timing["scenes"]}
    lines = {l["id"]: l for l in timing["lines"]}
    takes = {v["id"]: v for v in timing["voice"]}

    def word(line: str, w: str) -> int:
        for c in timing["captions"]:
            if c["line"] == line:
                for x in c["words"]:
                    if x["text"].replace(" ", " ").startswith(w):
                        return x["from"]
        raise KeyError((line, w))

    segs = []  # (label, duration in frames, voice [(take id, rel frame)], cues [(name, rel frame, volume, note)])

    rs = scenes["rules"]["from"]
    fill_from = lines["rules-1"]["from"] + 20 - rs
    fill_to = max(fill_from + 60, word("rules-2", "Rp") - rs)
    second = lines["rules-2"]["from"] - rs
    cues = [("bloom", 0, 0.3, "scene change"), ("pluck", 8, 0.35, "first chip")]
    cues += [(f"step-{k + 1}", round(fill_from + (fill_to - fill_from) * k / 8), 0.18, "grid fill") for k in range(8)]
    cues += [("pluck-high", second + 2, 0.35, "second chip"), ("chime", fill_to, 0.3, "total lands on the spoken amount")]
    cues.sort(key=lambda c: c[1])
    segs.append(("Rules (DCA grid fill)", scenes["rules"]["dur"], [("take-rules-1", takes["take-rules-1"]["from"] - rs)], cues))

    ts_ = scenes["twist"]["from"]
    juni = max(40, word("twist-1", "Juni") - ts_)
    cues = [("bloom", 0, 0.3, "scene change"), ("pluck", 6, 0.35, "peak card"),
            ("descend", juni - 26, 0.25, "arrow draws (under \"Rp 1,6 miliar\")"),
            ("sink", juni + 6, 0.3, "value falls (\"Juni\")"), ("thud", juni + 56, 0.45, "crash lands"),
            ("sour", juni + 56, 0.3, "shock accent (pair demo; Twist has no glitch today)")]
    segs.append(("Twist (the 2026 drop)", scenes["twist"]["dur"], [("take-twist-1", takes["take-twist-1"]["from"] - ts_)], cues))

    cues = [("bloom", 0, 0.3, "scene change"), ("swell", 12, 0.4, "big entrance"), ("ascend", 45, 0.25, "build-up"),
            ("bell-bloom", 90, 0.4, "peak reveal"), ("glint", 125, 0.25, "money lands"), ("glint", 150, 0.22, "money lands again"),
            ("signature", 195, 0.4, "end card / logo")]
    segs.append(("No voice: entrance, build-up, peak reveal, money, end card", 270, [], cues))

    gap = int(0.6 * FPS)
    total = sum(s[1] for s in segs) + gap * len(segs) + FPS
    buf = np.zeros(int(SR * total / FPS))
    DEMO_NOTES.clear()
    at = 0
    for label, dur, voice, cues in segs:
        DEMO_NOTES.extend([f"**{label}** · starts {at / FPS:.1f} s", ""])
        for take, rel in voice:
            mix(buf, decode(ROOT / "public" / takes[take]["audio"]), (at + rel) / FPS, 1.0)
        for name, rel, vol, note in cues:
            mix(buf, sfx(name), (at + rel) / FPS, vol)
            DEMO_NOTES.append(f"- {(at + rel) / FPS:5.1f} s · `{name}` @ {vol} · {note}")
        DEMO_NOTES.append("")
        at += dur + gap
    buf = buf[: int(SR * at / FPS)]
    DEMO_NOTES.extend(["Voice at its mastered -16 LUFS and SFX at the listed volumes: the mix before the render's final",
                   "linear gain to -14 LUFS, so the balance you hear is the balance in the video."])
    write(qa / "sfx-demo", buf * min(1.0, 0.89 / np.abs(buf).max()))


# ---------------------------------------------------------------------------------------------
# Round 2: alternative palettes (a-/b-/c-/d- in sfx_synth.py), one comparable demo each.
# ---------------------------------------------------------------------------------------------

SLOTS = ["transition", "entrance", "label", "step", "milestone", "money", "buildup", "decline", "crash", "shock", "logo", "click"]
SLOT_OLD = {"transition": "whoosh-soft", "entrance": "whoosh", "label": "pop", "step": "tick", "milestone": "ding", "money": "coin",
            "buildup": "riser", "decline": "drop / swoosh-down", "crash": "impact", "shock": "glitch", "logo": "shimmer on the end card",
            "click": "pop on outro click ripples"}
SLOT_VOL = {"transition": 0.3, "entrance": 0.4, "label": 0.35, "step": 0.18, "milestone": 0.3, "money": 0.25, "buildup": 0.25,
            "decline": 0.3, "crash": 0.45, "shock": 0.3, "logo": 0.4, "click": 0.32}

PALETTES = {
    "a": {
        "title": "Desk (tactile / physical)",
        "character": "Real objects on a wooden desk, close-miked and nearly dry: a mouse switch, a pen tap, paper sliding, a card flicked down, a rubber stamp, coins set on wood.",
        "sounds": {"transition": "a-slide", "entrance": "a-flick", "label": "a-tap", "step": "a-tick", "milestone": "a-stamp", "money": "a-coins",
                   "buildup": "a-wind", "decline": "a-slump", "crash": "a-drop", "shock": "a-rattle", "logo": "a-close", "click": "a-click"},
        "listen": [
            "Whether the paper slide (`a-slide`) reads as a transition or as noise: it is the most speech-band-heavy transition of the four.",
            "`a-stamp` on the milestone ('approved!') and `a-close` (a notebook shut) on the end card: do they feel like a brand or like foley?",
            "`a-slump` (paper dragging down) sits under \"Juni\" in the Twist; it is mostly 1-4 kHz, so in a real cut it would go to ~0.2.",
        ],
    },
    "b": {
        "title": "Premium UI (minimal fintech)",
        "character": "Restraint: very short crisp taps, haptic-like low thumps you feel more than hear, one subtle air puff for transitions, two soft sine pings for success.",
        "sounds": {"transition": "b-air", "entrance": "b-rise", "label": "b-tap", "step": "b-tick", "milestone": "b-confirm", "money": "b-pay",
                   "buildup": "b-build", "decline": "b-dip", "crash": "b-hit", "shock": "b-buzz", "logo": "b-mark", "click": "b-click"},
        "listen": [
            "Is it too quiet / too polite for TikTok? The haptic thumps (`b-hit`, `b-buzz`, the pulses in `b-build`) are 50-170 Hz and thin out on phone speakers.",
            "`b-air` is still a (very short, soft) air movement: check it doesn't read as the generic whoosh.",
            "`b-confirm` / `b-pay` are the closest to 'app notification' sounds: good if that's the vibe, bad if it reminds you of a specific app.",
        ],
    },
    "c": {
        "title": "Terminal (trading desk)",
        "character": "A Bloomberg-style terminal: square-wave blips, relay clicks, short data chatter on counters, a low lock-in on numbers, a tape-stopped drone for the crash.",
        "sounds": {"transition": "c-scan", "entrance": "c-boot", "label": "c-blip", "step": "c-chatter", "milestone": "c-lock", "money": "c-cash",
                   "buildup": "c-charge", "decline": "c-fall", "crash": "c-crash", "shock": "c-alarm", "logo": "c-logo", "click": "c-click"},
        "listen": [
            "Square waves can feel retro-game: check `c-blip` and `c-cash` read as 'terminal', not '8-bit'.",
            "`c-chatter` repeats the same burst on every grid step: varied enough, or does it machine-gun?",
            "`c-crash` = low hit + a short static burst + a drone that winds down (tape-stop): is it dramatic enough for the Covid / 2026 crashes?",
        ],
    },
    "d": {
        "title": "Tape (analog / lo-fi)",
        "character": "A cassette deck: button clunks for clicks, tape rewind for transitions, tape start / slow-down for entrances and declines, muffled e-piano chords, crackle and hiss.",
        "sounds": {"transition": "d-rewind", "entrance": "d-clunk-in", "label": "d-button", "step": "d-tick", "milestone": "d-chord", "money": "d-register",
                   "buildup": "d-speedup", "decline": "d-slow", "crash": "d-thump", "shock": "d-warble", "logo": "d-outro", "click": "d-click"},
        "listen": [
            "Hiss and crackle tails: charming or dirty under the voice? (`d-thump` and `d-outro` carry the most.)",
            "`d-chord` / `d-outro` are muffled Dmaj9 e-piano chords, lo-fi-beats style: still 'musical', so check it doesn't feel like round 1 again.",
            "`d-register` (crank, bell, drawer) is the busiest money cue: fun or too cartoon?",
        ],
    },
}


def compare_demo(ep: str, qa: Path, letter: str, voices: dict) -> list[str]:
    """Same structure for every palette (round-1 demo + an outro part), so files compare 1:1."""
    p = PALETTES[letter]
    S = p["sounds"]
    timing = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    scenes = {s["id"]: s for s in timing["scenes"]}
    lines = {l["id"]: l for l in timing["lines"]}
    takes = {v["id"]: v for v in timing["voice"]}

    def word(line: str, w: str) -> int:
        for c in timing["captions"]:
            if c["line"] == line:
                for x in c["words"]:
                    if x["text"].replace(" ", " ").startswith(w):
                        return x["from"]
        raise KeyError((line, w))

    def cue(slot, rel, note, vol=None):
        return (slot, rel, SLOT_VOL[slot] if vol is None else vol, note)

    segs = []
    rs = scenes["rules"]["from"]
    fill_from = lines["rules-1"]["from"] + 20 - rs
    fill_to = max(fill_from + 60, word("rules-2", "Rp") - rs)
    second = lines["rules-2"]["from"] - rs
    cs = [cue("transition", 0, "scene change"), cue("label", 8, "first chip")]
    cs += [cue("step", round(fill_from + (fill_to - fill_from) * k / 8), f"grid fill {k + 1}/8") for k in range(8)]
    cs += [cue("label", second + 2, "second chip"), cue("milestone", fill_to, "total lands on the spoken amount")]
    segs.append(("Rules (DCA grid fill)", scenes["rules"]["dur"], [("take-rules-1", takes["take-rules-1"]["from"] - rs)], sorted(cs, key=lambda c: c[1])))

    ts_ = scenes["twist"]["from"]
    juni = max(40, word("twist-1", "Juni") - ts_)
    cs = [cue("transition", 0, "scene change"), cue("label", 6, "peak card"), cue("decline", juni + 6, "value starts falling (\"Juni\")"),
          cue("crash", juni + 56, "crash lands"), cue("shock", juni + 56, "shock accent with the crash")]
    segs.append(("Twist (the 2026 drop)", scenes["twist"]["dur"], [("take-twist-1", takes["take-twist-1"]["from"] - ts_)], cs))

    cs = [cue("transition", 0, "scene change"), cue("entrance", 12, "big entrance"), cue("buildup", 45, "build-up (1.5 s)"),
          cue("milestone", 90, "reveal / milestone"), cue("money", 125, "money lands"), cue("money", 150, "money lands again", 0.22)]
    segs.append(("No voice: entrance, build-up, reveal, money", 200, [], cs))

    cs = [cue("transition", 0, "outro starts"), cue("click", 45, "UI click ripple"), cue("click", 80, "UI click ripple"),
          cue("transition", 165, "back to the end card"), cue("logo", 175, "end card / logo")]
    segs.append(("Outro: transition, two UI clicks, transition, end card", 260,
                 [("take-hakabot-outro-1", 9), ("take-hakabot-outro-4", 185)], cs))

    gap = int(0.6 * FPS)
    total = sum(s[1] for s in segs) + gap * len(segs) + FPS
    buf = np.zeros(int(SR * total / FPS))
    notes, at = [], 0
    for label, dur, voice, cues in segs:
        notes += [f"**{label}** · starts {at / FPS:.1f} s", ""]
        for take, rel in voice:
            if take not in voices:
                voices[take] = decode(ROOT / "public" / takes[take]["audio"])
            mix(buf, voices[take], (at + rel) / FPS, 1.0)
        for slot, rel, vol, note in cues:
            mix(buf, sfx(S[slot]), (at + rel) / FPS, vol)
            notes.append(f"- {(at + rel) / FPS:5.1f} s · `{S[slot]}` ({slot}) @ {vol} · {note}")
        notes.append("")
        at += dur + gap
    buf = buf[: int(SR * at / FPS)]
    write(qa / f"sfx-demo-{letter}", buf * min(1.0, 0.89 / np.abs(buf).max()))
    return notes


def compare(ep: str, qa: Path) -> None:
    from scipy.signal import lfilter

    def mmax(x):  # max momentary loudness (BS.1770 K-weighting), same measure as sfx_synth.py
        y = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x)
        y = lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], y)
        w = int(0.4 * SR)
        c = np.concatenate([[0.0], np.cumsum(np.concatenate([y, np.zeros(w)]) ** 2)])
        return -0.691 + 10 * np.log10((c[w:] - c[:-w]).max() / w + 1e-12)

    def speech_share(x):
        X = np.abs(np.fft.rfft(x)) ** 2
        f = np.fft.rfftfreq(len(x), 1 / SR)
        return X[(f >= 1000) & (f < 4000)].sum() / X.sum()

    voices: dict = {}
    out = [
        "# SFX comparison · round 2 (four alternative palettes, not wired in yet)",
        "",
        "Every palette fills the same 12 slots and every demo has the same structure and timings, so the files compare 1:1:",
        "Rules over the real voice (grid fill) · Twist over the real voice (the 2026 drop) · a no-voice run (entrance, build-up,",
        "reveal, money) · a short outro (transition, two UI clicks, transition, end card, \"Cek di hakabot.com\").",
        "Voice at its mastered -16 LUFS, SFX at the listed `<Sfx volume>`; that is the balance a video would have.",
        "Each sound is loudness-matched to the slot it fills (max momentary loudness of the old sound in that slot).",
        "Rebuild: `python -I scripts/sfx_synth.py --alts` then `python -I scripts/sfx_audition.py ep01-ihsg-dca --compare`.",
        "",
    ]
    for letter, p in PALETTES.items():
        notes = compare_demo(ep, qa, letter, voices)
        out += [f"## {letter.upper()} · {p['title']}  (`qa/sfx-demo-{letter}.mp3`)", "", p["character"], "",
                "| Slot (replaces) | Sound | Length | Energy in 1-4 kHz |", "|---|---|---|---|"]
        for slot in SLOTS:
            x = sfx(p["sounds"][slot])
            out.append(f"| {slot} ({SLOT_OLD[slot]}) | `{p['sounds'][slot]}` | {len(x) / SR:.2f} s | {speech_share(x):.0%} |")
        out += ["", "Cue list:", ""] + notes + ["Listen for:", ""] + [f"- {s}" for s in p["listen"]] + [""]
    (qa / "sfx-compare.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(qa / "sfx-compare.md")


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    ep = args[0] if args else "ep01-ihsg-dca"
    qa = ROOT / "episodes" / ep / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    if "--compare" in sys.argv:
        compare(ep, qa)
        return
    demo(ep, qa)
    audition(qa)


if __name__ == "__main__":
    main()
