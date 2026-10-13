# Hakabot brand

**Hakabot** (hakabot.com) is a stock analysis tool for the Indonesian stock market (IDX). Its features:

- **Bandarmology**: broker summary and bandar flow, accumulation vs distribution, broker activity
- **Fundamental**: financials and valuation
- **Technical**: charting with indicators (MA, VWAP, trendlines…)
- **Analisa Kepentingan**: Hakabot's own feature. Name it as-is; don't explain or invent what it does.
- **Screener**, **Signals**, **Custom Indicators**
- **Stock Health**: a diagnostic panel on each stock page (trend, MA, bandar, ATH, RS, VP)

## How every video promotes it

1. **Watermark**: the white Hakabot lockup, top-right on every frame until the outro. Added
   automatically by `EpisodeShell` (`src/core/brand/Watermark.tsx`). Keep scene content clear of it.
2. **Outro**: the last scene of every script is `hakabot-outro` (`src/core/brand/HakabotOutro.tsx`).
   It runs about 20–21,5 s (20,4 s with ep01's real voice; edit v3.3, 13 Okt 2026: the v3.2 edit with its footage at ≈ 1,5×, by the user's request):
   - App tour, four beats, one per voice line, headline only (no chips, no explanatory labels), 7 shots:
     **Indikator** (the Tech menu opens and Trend's lines appear; the Retail flow line appears; Drivers
     shades a range and lists the brokers behind the move), **Bandarmology** (the filled broker-summary
     tables scroll to the **POSITION** table, then a crisp close-up of POSITION: which broker is adding,
     which is exiting and its profit/loss), **Komposisi** (the holder network springs open with the ownership
     donut), **Screener** (pick the Uptrend Fase 2 pattern; the results turn into cards with their charts).
     Every ticker, company name/logo, holder name, unused screener preset and the account name is blurred
     (holder network: a soft blur, bubbles stay, labels don't).
   - **Pacing rules (hard limits, user feedback 10 and 13 Okt):** at most 2 shots per beat (the Indikator
     beat may have 3); footage at **≈ 1,5× (1,4–1,6×)**, the user's request for v3.3 (v3.1/v3.2 played real
     time; spare time becomes a short hold, never slow motion); at most one jump cut per shot, only over dead
     time; **no punch-ins, zoom bounces or drift** (this rule stays), at most one slow eased camera move per
     shot (zoom change ≤ ~10 %); crossfades between shots; at most one highlight (ring or click ripple) per
     shot. Details: `docs/outro-recordings.md` → v3.3 (current edit and voice budgets), v3.1 (the rules).
   - End card on the **last** outro line: logo, "Tools analisis saham", a big **hakabot.com** pill and
     8 feature chips (Bandarmology, Fundamental, Technical, Analisa Kepentingan, **Komposisi**, Screener,
     Signals, Custom Indicators). It always gets at least 3 s.
   - Sources: Recording C `outro_raw/2026-10-12 11-56-49.mp4`, Recording D `outro_raw/2026-10-13 12-16-36.mp4`
     (both 1920×1080) and the screenshot `outro_raw/POSITION.png` (→ `public/outro/position.png`). The edit (shot log, EDL,
     identifier boxes) is documented in `docs/outro-recordings.md`.
   - Preview it on its own: composition `hakabot-outro-preview` (synthetic timing from the standard
     script below, no voice): `npx remotion render hakabot-outro-preview episodes/_outro/preview.mp4 --concurrency=2`.

The tone is a soft, useful nudge, never a hard sell. Don't claim accuracy, returns or "pasti cuan".

## Standard outro script (five lines)

**Status: approved by the user 13 Okt 2026** and first voiced in ep01. These are the standard lines in
`src/core/brand/outroScript.ts` (the outro plays its footage at ≈ 1,5×, so the lines are short instead of the
voice being sped up). Copy them into every new script as-is.

The outro is timed to its voice lines: `outro-1…outro-4` each start one beat, the **last line must be
the URL line** (the end card lands on it). The lines say in plain words what each page is for, not how
it works (rule: `docs/bahasa-guide.md` → Clarity first), and their lengths give each beat its room.
Scene settings: `"minSec": 12, "leadSec": 0.3, "tailSec": 1.6`, and `"pauseBefore": 0.35` on
`outro-2…outro-5` (a short breath before each new feature).

| Line | Text (script.json markup) | Chars spoken | Est. at 15,5 ch/s | Plays under | Fits (min–max) |
|---|---|---|---|---|---|
| `outro-1` | Hakabot punya banyak indikator racikan sendiri, tinggal klik langsung muncul di chart. | 86 | 5,5 s | Indikator (3 shots) | 78–95 |
| `outro-2` | Kelihatan broker mana yang nambah, keluar, sampai untung ruginya. | 65 | 4,2 s | Bandarmology | 54–72 |
| `outro-3` | Pemilik saham tiap perusahaan, tampil rapi. | 43 | 2,8 s | Komposisi | 25–50 |
| `outro-4` | Screener siap pakai, bantu nyaring saham yang jelek. | 52 | 3,4 s | Screener | 39–58 |
| `outro-5` | Cek di {hakabot.com\|hakabot dot com}. | 23 | 1,5 s | End card | 20–30 |

Total ≈ 17,3 s of speech; the scene runs ≈ 21,5 s estimated (20,4 s with ep01's real takes) with lead, the 0,35 s pauses and the 1,6 s tail
(estimated at `speed` 1.0); the end card gets ≈ 3,3 s.

Keep each line inside its "Fits" range: a line much shorter than its beat's footage trims the start of
the footage (it never plays faster than 1,6×); a much longer one adds holds.

Outros with a different number of lines (e.g. the older 4-line script that ep01 was voiced with) still
render: the tour then splits by design length instead of following each line, and the end card still
lands on the last line. Such episodes should get the new lines (re-voice the outro take only).

## Assets

| File | Use |
|---|---|
| `public/brand/hakabot-lockup-white.png` | watermark, outro kicker, end card |
| `public/brand/hakabot-icon-white.png`, `hakabot-icon-blue.png` | icon-only placements |
| `public/brand/hakabot-wordmark-white.png` | wordmark-only placements |
| `public/outro/<clip>.mp4` | outro app-tour clips (no audio), cut by `npm run brand:outro` from `outro_raw/` |
| `public/outro/position.png` | crisp POSITION screenshot (copy of `outro_raw/POSITION.png`), used as a still close-up in the outro |

These are generated from the originals in `brand_logo/` by `npm run brand:assets`. Brand blue is
`#1212F9` (`C.brand`). Use it for fills like the URL pill. Never use it for small text on the dark
background, where it is too low-contrast.

## Re-recording or re-cutting the outro

1. Put the new screen recording in `outro_raw/` and add it to `recordings` in
   `src/core/brand/outroClips.json`. The edit assumes **1920×1080** (`SRC_W/SRC_H` in `outroConfig.ts`;
   zoom 1 = the full 1920 px width in the 960 px window). A recording at another size needs those changed
   (and every zoom re-tuned).
2. Watch it properly before editing: step through it at ≤ 1 s, and ≤ 0,25 s around every click
   (`python -I scripts/contact_sheet.py <rec> <out.jpg> --at <secs…> --size 320x180 --cols 5`, full-res
   frames via `npx remotion ffmpeg -ss <sec> -i <rec> -frames:v 1 -update 1 f.png`). Log what each
   stretch shows, which clicks change what (to the frame), the idle/scroll stretches to cut, and every
   identifier with its box in `docs/outro-recordings.md`.
3. Add or change clips in `outroClips.json` (`rec`, `start`, `end`: a little wider than the segments you
   play) and run `npm run brand:outro` (re-cuts every clip, removes stale ones; `-- <name>` for one).
   Keep each clip **≤ ~16 s**: Remotion's `OffthreadVideo` returned stale frames past ≈ 24 s into a long
   1080p clip. A shot can take single segments from another clip: `[a, b, 'clip-name']`.
4. Edit `OUTRO_GROUPS` in `src/core/brand/outroConfig.ts`: per shot the `segs` to play (recording
   seconds; at most one gap = jump cut, over dead time), its designed `dur` and window height `h`,
   camera keys (`t` in seconds on screen, centre + zoom in recording px; one slow eased move at most),
   `marks` (rings, click ripples, labels, at recording seconds) and `blur` boxes. Blur boxes take
   `from`/`to` (recording seconds) when content appears or scrolls, and `track` keyframes to follow a
   scroll. Per-recording `bounds` keep browser chrome out of frame; per-recording `blur` holds what is
   always on screen (account name).
5. Check: `npm run typecheck`, render stills of `hakabot-outro-preview` at every shot's start, middle
   and end, and look at **every blur box at full size** (tickers, company names/logos, account name,
   avatar, investor names). Then render the preview video and watch it, and make a 1 s contact sheet
   (`npm run sheet -- episodes/_outro/preview.mp4 <out.jpg> --every 1`): a first-time viewer must be able to
   say what each shot shows before it changes. Hold the pacing rules above.
