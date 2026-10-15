"""Cut a tutorial's footage clips from the raw screen recordings into public/tutorial/<prefix>/.

Usage:
  python -I scripts/tutorial_clips.py <episode-id>                 cut every clip that is missing or changed
  python -I scripts/tutorial_clips.py <episode-id> dash-a watch-b  (re)cut just these
  python -I scripts/tutorial_clips.py <episode-id> --chapter watch (re)cut every clip of clips/watch.json
  python -I scripts/tutorial_clips.py <episode-id> --force         re-cut everything
  python -I scripts/tutorial_clips.py <episode-id> --prune         also delete clip files no list mentions any more

Inputs (src/episodes/<id>/):
  recordings.json   per recording: raw file, page viewport `bounds` (recording px), `clipWidth`
  clips/<chapter>.json   {"clips": {name: {rec, start, end, note}}}, one file per chapter, so chapters can be
                         built in parallel without editing the same file. Names must be unique across chapters.
Output: public/tutorial/<prefix>/<name>.mp4 (+ <name>.cut.json, the parameters it was cut with, so unchanged
clips are skipped). <prefix> is the id up to the first '-' (tut01-hakabot-tutorial -> tutorial/tut01), the
`clipDir` in the episode's index.tsx. public/tutorial/ is git-ignored: clips are always regenerable.

Every clip is the recording cropped to `bounds` (tabs, taskbar never leave the raw file) and scaled to
`clipWidth` (3840 keeps 4K sharpness for zooms up to ~2x on the 1080p output). The player draws the clip back at
`bounds` in recording px, so beats always use raw-recording coordinates whatever the clip size is.
Encoding: H.264 CRF 16, GOP 15, no B-frames, no audio: the tutorial time-remaps clips frame by frame, and Remotion
mis-seeks long clips, so keep each <= ~16 s. Starts must sit on frame boundaries (multiples of 1/30 s) so a clip's
frame k is recording frame start*30 + k.

Uses the system ffmpeg (on PATH): Remotion's bundled one lacks filters and can be blocked by Smart App Control.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load(ep: str):
    base = ROOT / "src" / "episodes" / ep
    recs = {k: v for k, v in json.loads((base / "recordings.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
    clips: dict[str, dict] = {}
    owner: dict[str, str] = {}
    for f in sorted((base / "clips").glob("*.json")):
        for name, c in json.loads(f.read_text(encoding="utf-8")).get("clips", {}).items():
            if name in clips:
                sys.exit(f"clip name {name} is in both clips/{owner[name]} and clips/{f.name}: names must be unique")
            clips[name] = c
            owner[name] = f.name
    return recs, clips, owner


def params(rec: dict, clip: dict) -> dict:
    b = rec["bounds"]
    w = int(rec.get("clipWidth", b["w"]))
    h = int(round(b["h"] * w / b["w"] / 2) * 2)
    return {"file": rec["file"], "start": clip["start"], "end": clip["end"], "crop": [b["w"], b["h"], b["x"], b["y"]], "size": [w, h]}


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    ep, rest = args[0], args[1:]
    force = "--force" in rest
    prune = "--prune" in rest
    chapter = rest[rest.index("--chapter") + 1] if "--chapter" in rest else None
    names = [a for a in rest if not a.startswith("--") and a != chapter]
    recs, clips, owner = load(ep)
    out = ROOT / "public" / "tutorial" / ep.split("-")[0]
    if chapter:
        names += [n for n, f in owner.items() if f == f"{chapter}.json"]
        force = True
    unknown = [n for n in names if n not in clips]
    if unknown:
        sys.exit(f"unknown clip(s): {', '.join(unknown)}. Known: {', '.join(clips)}")
    explicit = bool(names)
    todo = names or list(clips)
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        sys.exit("ffmpeg not found on PATH (install it, e.g. winget install Gyan.FFmpeg)")
    out.mkdir(parents=True, exist_ok=True)
    for name in todo:
        clip = clips[name]
        rec = recs.get(clip["rec"])
        if rec is None:
            sys.exit(f"{name}: unknown recording {clip['rec']} (recordings.json)")
        src = ROOT / rec["file"]
        if not src.exists():
            sys.exit(f"missing recording {src}")
        start, length = clip["start"], round(clip["end"] - clip["start"], 4)
        if length > 16.5:
            print(f"warning: {name} is {length}s long; keep clips <= ~16 s")
        if abs(start * 30 - round(start * 30)) > 1e-6:
            sys.exit(f"{name}: start {start} is not on a frame boundary (multiple of 1/30 s)")
        p = params(rec, clip)
        dest = out / f"{name}.mp4"
        side = out / f"{name}.cut.json"
        if not force and not explicit and dest.exists() and side.exists() and json.loads(side.read_text(encoding="utf-8")) == p:
            print(f"up to date  {dest.relative_to(ROOT)}")
            continue
        cw, ch, cx, cy = p["crop"]
        w, h = p["size"]
        vf = f"crop={cw}:{ch}:{cx}:{cy}" + ("" if (w, h) == (cw, ch) else f",scale={w}:{h}:flags=lanczos")
        cmd = [
            ffmpeg, "-v", "error", "-y",
            "-ss", f"{start:.4f}", "-i", str(src), "-t", f"{length:.4f}",
            "-vf", vf, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-g", "15", "-bf", "0",
            "-pix_fmt", "yuv420p", "-r", "30", str(dest),
        ]
        subprocess.run(cmd, check=True, cwd=ROOT)
        side.write_text(json.dumps(p), encoding="utf-8")
        print(f"cut         {dest.relative_to(ROOT)}  ({clip['rec']} {start}s +{length}s, {w}x{h}, {dest.stat().st_size / 1e6:.1f} MB)")
    if prune:
        for old in out.glob("*.mp4"):
            if old.stem not in clips:
                old.unlink()
                (out / f"{old.stem}.cut.json").unlink(missing_ok=True)
                print(f"removed stale {old.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
