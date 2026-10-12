"""Tile frames from a rendered video into one image for QA review.

Usage:
  python -I scripts/contact_sheet.py <video.mp4> <out.jpg> [--every 3]        a frame every N seconds
  python -I scripts/contact_sheet.py <video.mp4> <out.jpg> --at 1.5 12 40.2   specific seconds

Remotion's bundled ffmpeg has no select/tile filters, so frames are grabbed one by one by
seeking and tiled with Pillow. Each tile is labelled with its timestamp.
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
TILE_W, TILE_H, COLS = 270, 480, 6


def ff(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["npx", "remotion", *args], capture_output=True, text=True, cwd=ROOT, shell=sys.platform == "win32")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("out")
    ap.add_argument("--every", type=float, default=3.0)
    ap.add_argument("--at", type=float, nargs="*")
    ap.add_argument("--size", default=f"{TILE_W}x{TILE_H}", help="tile size, e.g. 320x180 for 16:9 recordings")
    ap.add_argument("--cols", type=int, default=COLS)
    args = ap.parse_args()
    tw, th = (int(v) for v in args.size.lower().split("x"))
    cols = args.cols

    dur = float(ff("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", args.video).stdout.strip().splitlines()[-1])
    times = args.at or [round(t * args.every, 2) for t in range(int(dur // args.every) + 1)]
    times = [min(t, dur - 0.1) for t in times]

    tiles = []
    with tempfile.TemporaryDirectory() as tmp:
        for k, t in enumerate(times):
            f = Path(tmp) / f"{k}.jpg"
            ff("ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", args.video, "-frames:v", "1",
               "-vf", f"scale={tw}:{th}", "-update", "1", str(f))
            if f.exists():
                tiles.append((t, Image.open(f).copy()))

    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 6) + 6, rows * (th + 30) + 6), "white")
    draw = ImageDraw.Draw(sheet)
    for k, (t, im) in enumerate(tiles):
        x, y = 6 + (k % cols) * (tw + 6), 6 + (k // cols) * (th + 30)
        sheet.paste(im, (x, y))
        draw.text((x + 4, y + th + 6), f"{t:.1f}s", fill="black")
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.out, quality=85)
    print(f"{len(tiles)} frames → {args.out}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
