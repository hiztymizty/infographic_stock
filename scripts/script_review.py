"""Render episodes/<id>/script.json as script.md, the document the user approves.

Usage: python -I scripts/script_review.py <episode-id>

Shows what viewers read (captions) and what the voice says, scene by scene, with timing
from timing.json when it exists (estimated or real) and the episode's data sources.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKUP = re.compile(r"\{([^{}|]+)\|([^{}]+)\}")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ep = sys.argv[1]
    ep_dir = ROOT / "episodes" / ep
    script = json.loads((ep_dir / "script.json").read_text(encoding="utf-8"))
    timing_path = ROOT / "src" / "episodes" / ep / "timing.json"
    timing = json.loads(timing_path.read_text(encoding="utf-8")) if timing_path.exists() else None
    fps = script.get("fps", 30)
    scene_t = {s["id"]: s for s in timing["scenes"]} if timing else {}

    out = [f"# {script['title']}", ""]
    if timing:
        kind = "estimated (no voiceover yet)" if timing["estimated"] else "from the real voiceover"
        out += [f"Durasi: **{timing['totalFrames'] / fps:.0f} detik**, {kind}.", ""]
    for s in script["scenes"]:
        t = scene_t.get(s["id"])
        when = f" · {t['from'] / fps:.1f}s–{(t['from'] + t['dur']) / fps:.1f}s" if t else ""
        out += [f"## {s['id']}{when}", ""]
        if s.get("visual"):
            out += [f"_Visual: {s['visual']}_", ""]
        for ln in s["lines"]:
            shown = MARKUP.sub(lambda m: m.group(1), ln["text"])
            said = MARKUP.sub(lambda m: m.group(2), ln["text"])
            out.append(f"- **{shown}**")
            if said != shown:
                out.append(f"  - dibaca: _{said}_")
        out.append("")
    if script.get("sources"):
        out += ["## Sumber data", ""] + [f"- {src}" for src in script["sources"]] + [""]
    (ep_dir / "script.md").write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {(ep_dir / 'script.md').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
