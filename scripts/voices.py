"""ElevenLabs voice helper: list, search the Indonesian library, add a voice, audition.

Usage:
  python -I scripts/voices.py                         voices on this account (id, name, labels)
  python -I scripts/voices.py --library [male|female] Indonesian voices in the public Voice Library,
                                                      with free preview mp3s saved to out/voice-previews/
  python -I scripts/voices.py --add <voice_id>        add a library voice to this account (needed before use)
  python -I scripts/voices.py <voice_id> [text] [--model <id>] [--timestamps]
                                                      write out/voice-sample-<id>-<model>.mp3 (bills the characters);
                                                      --timestamps uses the with-timestamps endpoint the pipeline needs

Needs ELEVENLABS_API_KEY in .env. After choosing, set ELEVENLABS_VOICE_ID in .env.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from voiceover import DEFAULT_MODEL, DEFAULT_SETTINGS, load_env  # noqa: E402

SAMPLE = "Gimana kalau dari tahun dua ribu sepuluh, kamu rutin DCA lima juta rupiah tiap bulan ke I-Ha-Es-Ge? Sekarang duitnya jadi berapa?"
API = "https://api.elevenlabs.io/v1"


def call(url: str, body: dict | None = None) -> bytes:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
        method="POST" if body is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def library(gender: str) -> list[dict]:
    url = f"{API}/shared-voices?page_size=40&language=id&gender={gender}&sort=usage_character_count_1y"
    return json.loads(call(url))["voices"]


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    load_env()
    if not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("Put ELEVENLABS_API_KEY=... in .env first.")
    args = sys.argv[1:]

    if not args:
        for v in json.loads(call(f"{API}/voices"))["voices"]:
            labels = ", ".join(f"{k}={val}" for k, val in (v.get("labels") or {}).items())
            print(f"{v['voice_id']}  {v['name']:<36} {labels}")
        return

    if args[0] == "--library":
        gender = args[1] if len(args) > 1 else "male"
        out = ROOT / "out" / "voice-previews"
        out.mkdir(parents=True, exist_ok=True)
        for v in library(gender):
            paid = "" if v.get("free_users_allowed") else "  [paid plans only]"
            print(f"{v['voice_id']}  {v['name']:<44} {v.get('age')}, {v.get('use_case')}, {v.get('descriptive')}{paid}")
            if v.get("preview_url"):
                slug = v["name"].split(" - ")[0].strip().lower().replace(" ", "-")
                urllib.request.urlretrieve(v["preview_url"], out / f"{slug}-{v['voice_id']}.mp3")
        print(f"previews → {out.relative_to(ROOT)}")
        return

    if args[0] == "--add":
        voice_id = args[1]
        match = next((v for g in ("male", "female") for v in library(g) if v["voice_id"] == voice_id), None)
        if not match:
            sys.exit("Voice not found in the Indonesian library listing.")
        name = match["name"].split(" - ")[0].strip()
        res = json.loads(call(f"{API}/voices/add/{match['public_owner_id']}/{voice_id}", {"new_name": f"{name} (Hakabot)"}))
        print(f"added {name}: voice_id {res.get('voice_id', voice_id)}. Set ELEVENLABS_VOICE_ID to this in .env")
        return

    model = os.environ.get("ELEVENLABS_MODEL_ID", DEFAULT_MODEL)
    if "--model" in args:
        i = args.index("--model")
        model = args[i + 1]
        del args[i:i + 2]
    timestamps = "--timestamps" in args
    args = [a for a in args if a != "--timestamps"]
    voice, text = args[0], " ".join(args[1:]) or SAMPLE
    body = {"text": text, "model_id": model, "voice_settings": DEFAULT_SETTINGS}
    out = ROOT / "out" / f"voice-sample-{voice}-{model}.mp3"
    out.parent.mkdir(exist_ok=True)
    if timestamps:
        import base64
        res = json.loads(call(f"{API}/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128", body))
        out.write_bytes(base64.b64decode(res["audio_base64"]))
        al = res.get("alignment") or {}
        ok = len(al.get("characters", [])) == len(text)
        print(f"alignment: {'OK' if ok else 'MISSING/MISMATCH'} ({len(al.get('characters', []))} chars for {len(text)})")
    else:
        out.write_bytes(call(f"{API}/text-to-speech/{voice}?output_format=mp3_44100_128", body))
    print(f"wrote {out.relative_to(ROOT)} ({len(text)} characters billed)")


if __name__ == "__main__":
    main()
