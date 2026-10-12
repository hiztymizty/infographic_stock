# script.json format

`episodes/<id>/script.json` is the single source for what the voice says, what the captions show,
and how long each scene lasts. The scriptwriter writes it, the user approves it (as `script.md`),
and `scripts/voiceover.py` turns it into audio plus `src/episodes/<id>/timing.json`.

```json
{
  "id": "ep02-bbca-dividen",
  "title": "Working title in Bahasa",
  "fps": 30,
  "voice": {"settings": {"speed": 1.08}},
  "sources": ["Yahoo Finance BBCA.JK monthly, Jan 2015 – 9 Okt 2026 (episodes/ep02-…/data/bbca.json)"],
  "scenes": [
    {
      "id": "hook",
      "minSec": 4.5,
      "visual": "What the motion designer should show: one or two sentences.",
      "lines": [
        {"id": "hook-1", "text": "Kalau kamu beli {BBCA|Be-Be-Ce-A} {Rp 10 juta|sepuluh juta rupiah} tahun {2015|dua ribu lima belas}…"},
        {"id": "hook-2", "text": "Sekarang dividennya udah balikin modal berapa persen?"}
      ]
    },
    {"id": "hakabot-outro", "minSec": 12, "leadSec": 0.3, "tailSec": 1.8, "visual": "Standard Hakabot outro.", "lines": [
      {"id": "outro-1", "text": "…"}, {"id": "outro-2", "text": "…", "pauseBefore": 0.3}, {"id": "outro-3", "text": "…", "pauseBefore": 0.3},
      {"id": "outro-4", "text": "Cek di {hakabot.com|hakabot dot com}.", "pauseBefore": 0.3}
    ]}
  ]
}
```

## Fields

| Field | Meaning |
|---|---|
| `scenes[].id` | Scene key. Must match a component in `src/episodes/<id>/index.tsx` (except `hakabot-outro`). |
| `minSec` | Minimum scene length in seconds, so animation has room even when the voice is short. |
| `leadSec` | Silence before the first line (default 0.35 s). |
| `tailSec` | Hold after the last line (default 0.45 s). Raise it when an animation needs to finish after the voice. |
| `visual` | Brief for the motion designer. Shown in `script.md` for the user too. |
| `lines[].id` | Unique, prefixed by scene (`j-covid`, `result-2`). Animation syncs to these ids, so **don't rename ids after animation exists** without telling the motion designer. |
| `lines[].text` | The line, with `{display|spoken}` markup. |
| `lines[].pauseBefore` | Starts a new take here, with this much extra silence before it in seconds (a deliberate beat). |
| `voice.settings` | Overrides ElevenLabs settings (`speed`, `stability`, `similarity_boost`, `style`). |
| `voice.voiceId`/`modelId` | Per-episode voice override (normally use `.env`). |
| `sources` | Data sources, shown in `script.md`. |

## `{display|spoken}` markup

Captions show `display`; the voice reads `spoken`. Use it for every number, ticker, acronym and URL
(rules in `docs/bahasa-guide.md`). The display part becomes one caption "word", so it stays together
on one line and lights up as a unit while it's spoken. Punctuation right after the braces attaches to it.

## Takes: how the voice is generated

Each scene is voiced as **one continuous take**, so the narrator's pauses and pitch follow whole
sentences. A line with `pauseBefore` starts a new take: a deliberate breath, a new topic, a dramatic beat.
Lines are then placed inside their take from ElevenLabs' character timestamps, so `useLine` and
`useWordAt` still work. Editing one line re-voices its whole take. Write each scene as a spoken
paragraph (`docs/bahasa-guide.md` → "Write for the ear").

## Timing and captions

`voiceover.py` lays scenes end to end: each scene's takes play in order with 0.3 s gaps (plus any
`pauseBefore`), and the scene lasts until its last take ends plus `tailSec`, or `minSec`, whichever is longer. Captions are
split automatically into chunks of at most 6 words or 30 characters, breaking at punctuation. The
same chunks feed the burned-in captions and `captions.srt`.

## Length

Aim for 60–90 s in total, including the ~19,5 s outro. Spelled-out numbers are long, so round them in
speech when precision doesn't matter (the screen can still show the exact figure).
`npm run vo:estimate -- <id>` gives the estimated length before any voice is bought.

## The outro scene

Every script ends with scene `hakabot-outro` (`minSec` 12, `leadSec` 0.3, `tailSec` 1.8) with the four
standard lines `outro-1…outro-4` from `docs/hakabot.md` (`pauseBefore` 0.3 on lines 2–4). `outro-1…outro-3`
each start one beat of the app tour (Chart & Indikator, Broker Activity, Screener); the **last** line must
be the "cek di hakabot.com" line, because the end card (logo + hakabot.com) appears when it starts and
holds ≥ 3 s. Keep the standard lines' lengths: they set the tour's calm pacing. The outro runs about 19,5 s.
