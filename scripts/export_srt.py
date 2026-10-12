"""Write episodes/<id>/out/captions.srt from the caption chunks in timing.json.

Usage: python -I scripts/export_srt.py <episode-id>

Uses exactly the chunks the burned-in captions show, so both versions match.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def ts(frame: int, fps: int) -> str:
    ms = round(frame * 1000 / fps)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ep = sys.argv[1]
    timing = json.loads((ROOT / "src" / "episodes" / ep / "timing.json").read_text(encoding="utf-8"))
    fps = timing["fps"]
    blocks = []
    for i, c in enumerate(timing["captions"], 1):
        text = " ".join(w["text"] for w in c["words"]).replace(" ", " ")
        blocks.append(f"{i}\n{ts(c['from'], fps)} --> {ts(c['to'], fps)}\n{text}\n")
    out = ROOT / "episodes" / ep / "out" / "captions.srt"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(blocks), encoding="utf-8")
    note = " (ESTIMATED timing)" if timing["estimated"] else ""
    print(f"wrote {len(blocks)} cues to {out.relative_to(ROOT)}{note}")


if __name__ == "__main__":
    main()
