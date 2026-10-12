"""Pronunciation check: transcribe every voiceover line and compare it with the script.

Usage: python -I scripts/vo_check.py <episode-id> [--all]

Agents can't listen to audio, so this is how a bad reading gets caught (a ticker read as a
word, a number read in English, a skipped word). Each line's audio is sent to ElevenLabs
speech-to-text (scribe_v2); lines whose transcript doesn't match the spoken or displayed text
closely enough are flagged. Results are cached per audio version, so re-runs only check new audio.
Writes episodes/<id>/qa/vo-check.md.
"""
import difflib
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from voiceover import load_env  # noqa: E402

THRESHOLD = 0.82


def norm(s: str) -> str:
    s = s.lower().replace(" ", " ")
    s = re.sub(r"[^\w\s%]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def transcribe(path: Path) -> str:
    boundary = uuid.uuid4().hex
    parts = []
    for name, value in [("model_id", "scribe_v2"), ("language_code", "id")]:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode()
        + path.read_bytes()
        + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode())
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=b"".join(parts),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)["text"]
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs STT error {e.code}: {e.read().decode(errors='replace')[:300]}")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    load_env()
    if not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("Put ELEVENLABS_API_KEY in .env first.")
    ep = sys.argv[1]
    timing = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    if timing["estimated"]:
        sys.exit("timing.json is estimated: generate the voiceover first (scripts/voiceover.py).")
    cache_path = ROOT / "episodes" / ep / "vo-cache.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8"))

    rows, flagged = [], 0
    # Takes when the episode was voiced by take; per-line audio for older timings.
    for line in timing.get("voice") or [ln for ln in timing["lines"] if ln.get("audio")]:
        entry = cache.get(line["id"], {})
        audio = ROOT / "public" / line["audio"]
        # Tie the transcript to the exact audio bytes, so a --force re-take is always re-checked.
        audio_hash = hashlib.sha256(audio.read_bytes()).hexdigest()[:16]
        if "stt" not in entry or entry.get("stt_key") != audio_hash or "--all" in sys.argv:
            print(f"  transcribing {line['id']}")
            entry["stt"] = transcribe(audio)
            entry["stt_key"] = audio_hash
            cache[line["id"]] = entry
        heard = norm(entry["stt"])
        score = max(
            difflib.SequenceMatcher(None, heard, norm(line["spoken"])).ratio(),
            difflib.SequenceMatcher(None, heard, norm(line["display"])).ratio(),
        )
        ok = score >= THRESHOLD
        flagged += not ok
        rows.append(f"| {'✅' if ok else '⚠️'} | `{line['id']}` | {score:.2f} | {line['spoken']} | {entry['stt']} |")

    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    report = ROOT / "episodes" / ep / "qa" / "vo-check.md"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(
        "# Voiceover pronunciation check\n\n"
        f"{flagged} of {len(rows)} lines below {THRESHOLD} similarity. Flagged lines: fix the spoken half of "
        "the {display|spoken} markup in script.json, then re-run voiceover.py (only changed lines are re-billed).\n\n"
        "| | line | match | script (spoken) | transcript |\n|---|---|---|---|---|\n" + "\n".join(rows) + "\n",
        encoding="utf-8",
    )
    print(f"{flagged} flagged of {len(rows)} → {report.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
