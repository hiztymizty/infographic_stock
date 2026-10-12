"""Cut the Hakabot outro clips from the raw screen recordings into public/outro/.

Usage: python -I scripts/outro_clips.py [clip-name ...]     (no names: cut every clip)

The cut list (CLIPS: which recording, start/end seconds) lives in src/core/brand/outroClips.json,
shared with src/core/brand/outroConfig.ts, which decides how each clip is played (segments, speed,
camera, highlights, blur). Shot log and EDL: docs/outro-recordings.md.

Clips are re-encoded without audio, at high quality (the outro zooms in up to ~2.5x) and with a
short keyframe interval, because the outro time-remaps them frame by frame (jump cuts, speed changes).
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "src" / "core" / "brand" / "outroClips.json").read_text(encoding="utf-8"))
RECORDINGS: dict[str, str] = CONFIG["recordings"]
CLIPS: dict[str, dict] = CONFIG["clips"]
OUT = ROOT / "public" / "outro"


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    names = sys.argv[1:] or list(CLIPS)
    unknown = [n for n in names if n not in CLIPS]
    if unknown:
        sys.exit(f"unknown clip(s): {', '.join(unknown)}. Known: {', '.join(CLIPS)}")
    OUT.mkdir(parents=True, exist_ok=True)
    for name in names:
        clip = CLIPS[name]
        src = ROOT / RECORDINGS[clip["rec"]]
        start, length = clip["start"], round(clip["end"] - clip["start"], 3)
        dest = OUT / f"{name}.mp4"
        cmd = [
            "npx", "remotion", "ffmpeg", "-v", "error", "-y",
            "-ss", str(start), "-t", str(length), "-i", str(src),
            "-an", "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-g", "10", "-pix_fmt", "yuv420p",
            str(dest),
        ]
        subprocess.run(cmd, check=True, cwd=ROOT, shell=sys.platform == "win32")
        print(f"{dest.relative_to(ROOT)}  ({clip['rec']} {start}s +{length}s)")
    # Clips no longer in the cut list (e.g. after a re-edit) are stale: remove them.
    for old in OUT.glob("*.mp4"):
        if old.stem not in CLIPS:
            old.unlink()
            print(f"removed stale {old.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
