"""Read exact positions and times off a raw screen recording (for tutorial beats). Output images go where you say.

  python -I scripts/tutorial_probe.py grid  <video> <t> <x> <y> <w> <h> <out.png> [step]
      1:1 crop of the frame at second t (raw px) with a labelled pixel grid every `step` px (default 50), so rects
      can be read exactly. Keep crops ≲ 2000 px wide so the image is viewed at full size.
  python -I scripts/tutorial_probe.py diff  <video> <t0> <t1> [<x> <y> <w> <h>] [--min 0.5]
      per-frame mean difference inside the region: prints the frame/second of every change above --min
      (clicks that change the page, tooltips appearing, typing, scroll). Region default: the whole frame.
  python -I scripts/tutorial_probe.py sheet <video> <t0> <t1> <step> <out-prefix> [<x> <y> <w> <h>] [--cols 4] [--width 640]
      contact sheet(s) of frames t0..t1 every `step` s (optionally cropped), stamped with the second.
  python -I scripts/tutorial_probe.py scroll <video> <t_ref> <t...>
      vertical scroll offset (raw px, content moved up) of each frame vs t_ref, for blur `track`s.

Uses the system ffmpeg, numpy and Pillow. Times are raw-recording seconds (frame n = n/30).
"""
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def probe_size(video: str) -> tuple[int, int]:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", video], capture_output=True, text=True, check=True).stdout.strip()
    w, h = out.split(",")[:2]
    return int(w), int(h)


def frames(video: str, t0: float, dur: float | None, vf: str, w: int, h: int, fmt: str = "rgb24", fps: float | None = None):
    args = ["ffmpeg", "-v", "error", "-ss", f"{t0}", "-i", video]
    if dur is not None:
        args += ["-t", f"{dur}"]
    else:
        args += ["-frames:v", "1"]
    if fps:
        vf = f"fps={fps}," + vf
    args += ["-vf", vf, "-f", "rawvideo", "-pix_fmt", fmt, "-"]
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    ch = 3 if fmt == "rgb24" else 1
    n = len(raw) // (w * h * ch)
    return np.frombuffer(raw[: n * w * h * ch], np.uint8).reshape((n, h, w, ch) if ch == 3 else (n, h, w))


def font(size: int):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def opt(args: list[str], name: str, default: float) -> float:
    if name in args:
        i = args.index(name)
        v = float(args[i + 1])
        del args[i : i + 2]
        return v
    return default


def grid(a: list[str]) -> None:
    video, t = a[0], float(a[1])
    x, y, w, h = map(int, a[2:6])
    out = a[6]
    step = int(a[7]) if len(a) > 7 else 50
    im = Image.fromarray(frames(video, t, None, f"crop={w}:{h}:{x}:{y}", w, h)[0])
    d = ImageDraw.Draw(im, "RGBA")
    f = font(max(14, min(22, w // 80)))
    for gx in range((x // step + 1) * step, x + w, step):
        d.line([(gx - x, 0), (gx - x, h)], fill=(0, 255, 255, 90), width=1)
        d.text((gx - x + 2, 2), str(gx), fill=(0, 255, 255, 255), font=f)
    for gy in range((y // step + 1) * step, y + h, step):
        d.line([(0, gy - y), (w, gy - y)], fill=(255, 0, 255, 90), width=1)
        d.text((2, gy - y + 2), str(gy), fill=(255, 0, 255, 255), font=f)
    im.save(out)
    print(out)


def diff(a: list[str]) -> None:
    th = opt(a, "--min", 0.5)
    video, t0, t1 = a[0], float(a[1]), float(a[2])
    if len(a) >= 7:
        x, y, w, h = map(int, a[3:7])
    else:
        (w, h), x, y = probe_size(video), 0, 0
    s = 4 if w * h > 2_000_000 else 1
    sw, sh = w // s, h // s
    fr = frames(video, t0, t1 - t0, f"crop={w}:{h}:{x}:{y},scale={sw}:{sh}", sw, sh, "gray").astype(np.int16)
    f0 = round(t0 * 30)
    for i in range(1, len(fr)):
        dv = np.abs(fr[i] - fr[i - 1]).mean()
        if dv > th:
            print(f"frame {f0 + i}  t={(f0 + i) / 30:.3f}  diff={dv:.2f}")


def sheet(a: list[str]) -> None:
    cols = int(opt(a, "--cols", 4))
    width = int(opt(a, "--width", 640))
    video, t0, t1, step, out = a[0], float(a[1]), float(a[2]), float(a[3]), a[4]
    if len(a) >= 9:
        x, y, cw, ch = map(int, a[5:9])
    else:
        (cw, ch), x, y = probe_size(video), 0, 0
    h = round(width * ch / cw)
    fr = frames(video, t0, t1 - t0 + step / 2, f"crop={cw}:{ch}:{x}:{y},scale={width}:{h}", width, h, fps=1 / step)
    f = font(22)
    per = cols * 5
    for p in range(0, len(fr), per):
        chunk = fr[p : p + per]
        rows = (len(chunk) + cols - 1) // cols
        im = Image.new("RGB", (cols * width, rows * h), "black")
        d = ImageDraw.Draw(im)
        for i, fa in enumerate(chunk):
            px, py = (i % cols) * width, (i // cols) * h
            im.paste(Image.fromarray(fa), (px, py))
            d.rectangle([px, py, px + 100, py + 28], fill="black")
            d.text((px + 4, py + 2), f"{t0 + (p + i) * step:.2f}", fill="yellow", font=f)
        path = f"{out}-{p // per:02d}.jpg"
        im.save(path, quality=85)
        print(path)


def scroll(a: list[str]) -> None:
    video = a[0]
    w, h = probe_size(video)
    cx, cy, cw, chh = w // 5, h // 8, w * 3 // 5, h * 3 // 4
    sw, sh = cw // 2, chh // 2

    def grab(t: float):
        return frames(video, t, None, f"crop={cw}:{chh}:{cx}:{cy},scale={sw}:{sh}", sw, sh, "gray")[0].astype(np.float32)

    ref = grab(float(a[1]))
    for t in a[2:]:
        im = grab(float(t))
        best = (1e9, 0)
        for dd in range(-sh // 2, sh // 2 + 1):
            b = im[max(0, -dd) : sh - max(0, dd)]
            r = ref[max(0, dd) : max(0, dd) + b.shape[0]]
            if b.shape[0] < sh // 4:
                continue
            e = float(np.abs(r - b).mean())
            if e < best[0]:
                best = (e, dd)
        print(f"t={t}  content moved up {best[1] * 2} px  (match error {best[0]:.2f})")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 3 or sys.argv[1] not in ("grid", "diff", "sheet", "scroll"):
        sys.exit(__doc__)
    {"grid": grid, "diff": diff, "sheet": sheet, "scroll": scroll}[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    main()
