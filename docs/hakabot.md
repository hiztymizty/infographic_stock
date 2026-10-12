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
   It runs about 19,5 s and is paced to feel calm (few shots, near real-time footage, slow camera):
   - App tour, three beat groups, one per voice line, each with a headline and plain-language chips:
     **Chart & Indikator** (the Flow menu toggle close up, then the same click replayed on the chart as
     the investor-asing and pemain-besar-lokal lines appear), **Broker Activity** (one line per broker
     over the price chart), **Screener** (pick the Uptrend pattern, switch on chart mode, the result
     cards with their charts). Each group's first shot holds 1 s so the headline can be read; one
     highlight at a time. Every ticker, company name/logo and the account name is blurred.
   - End card on the **last** outro line: logo, "Tools analisis saham", a big **hakabot.com** pill and
     7 feature chips. It always gets at least 3 s.
   - The edit (shot log, EDL, identifier boxes) is documented in `docs/outro-recordings.md`.
   - Preview it on its own: composition `hakabot-outro-preview` (synthetic timing from the standard
     script below, no voice): `npx remotion render hakabot-outro-preview episodes/_outro/preview.mp4 --concurrency=2`.

The tone is a soft, useful nudge, never a hard sell. Don't claim accuracy, returns or "pasti cuan".

## Standard outro script (four lines)

The outro is timed to its voice lines: `outro-1…outro-3` each start one beat group, the **last line
must be the URL line** (the end card lands on it). Use these lines as they are: they say in plain words
what the footage shows (rule: `docs/bahasa-guide.md` → Clarity first), and their lengths give each beat
its room. Scene settings: `"minSec": 12, "leadSec": 0.3, "tailSec": 1.8`, and `"pauseBefore": 0.3` on
`outro-2`, `outro-3` and `outro-4` (a breath before each new feature).

| Line | Text (script.json markup) | Chars spoken | Est. at 15,5 ch/s | Plays under |
|---|---|---|---|---|
| `outro-1` | Di chart Hakabot, tinggal klik dan garis aliran dana investor asing langsung muncul. | 84 | 5,4 s | Chart & Indikator |
| `outro-2` | Broker activity nunjukin broker mana yang lagi banyak beli atau jual. | 69 | 4,5 s | Broker Activity |
| `outro-3` | Screener otomatis nyaring saham, misalnya yang lagi naik, lengkap sama chart. | 77 | 5,0 s | Screener |
| `outro-4` | Cek di {hakabot.com\|hakabot dot com}. | 23 | 1,5 s | End card |

Total ≈ 16,3 s of speech; the scene runs ≈ 20 s with lead, the pauses between takes and the 1,8 s tail
(estimated at `speed` 1.0).

Plain words, on purpose: "aliran dana investor asing" for the Foreign flow line, "broker mana yang lagi
banyak beli atau jual" for broker activity, "otomatis nyaring saham … yang lagi naik" for the screener
and its Uptrend pattern. The on-screen labels do the same ("Investor asing", "Pemain besar lokal" for
SM Local, "Tiap garis = 1 broker", "Uptrend = lagi naik", "Tampilkan chart").

Variations (same four slots; keep each line within ±10 characters of the standard so the beats keep
their room):

| Slot | Alternatives |
|---|---|
| `outro-1` | Di chart Hakabot, sekali klik, aliran dana investor asing langsung kelihatan. |
| `outro-2` | Di broker activity, kelihatan broker mana yang lagi banyak beli atau jual. |
| `outro-3` | Screener bantu nyaring saham otomatis, misalnya yang lagi naik, lengkap sama chart. |
| `outro-4` | Coba di {hakabot.com\|hakabot dot com}. · Langsung ke {hakabot.com\|hakabot dot com}. |

An episode may tie `outro-1` to its topic as long as it still describes clicking a line onto the chart,
because that's what's on screen.

Outros with a different number of lines (e.g. an older 3-line script) still render: the tour then splits
by design length instead of following each line, and the end card still lands on the last line.

## Assets

| File | Use |
|---|---|
| `public/brand/hakabot-lockup-white.png` | watermark, outro kicker, end card |
| `public/brand/hakabot-icon-white.png`, `hakabot-icon-blue.png` | icon-only placements |
| `public/brand/hakabot-wordmark-white.png` | wordmark-only placements |
| `public/outro/<clip>.mp4` | outro app-tour clips (no audio), cut by `npm run brand:outro` from `outro_raw/` |

These are generated from the originals in `brand_logo/` by `npm run brand:assets`. Brand blue is
`#1212F9` (`C.brand`). Use it for fills like the URL pill. Never use it for small text on the dark
background, where it is too low-contrast.

## Re-recording or re-cutting the outro

1. Put the new screen recording (1280×720, 16:9) in `outro_raw/` and add it to `recordings` in
   `src/core/brand/outroClips.json`.
2. Watch it properly before editing: step through it at ≤ 1 s, and ≤ 0,25 s around every click
   (`python -I scripts/contact_sheet.py <rec> <out.jpg> --at <secs…> --size 320x180 --cols 5`, full-res
   frames via `npx remotion ffmpeg -ss <sec> -i <rec> -frames:v 1 -update 1 f.png`). Log what each
   stretch shows, which clicks change what (to the frame), the idle/scroll stretches to cut, and every
   identifier with its box in `docs/outro-recordings.md`.
3. Add or change clips in `outroClips.json` (`rec`, `start`, `end`: a little wider than the segments you
   play) and run `npm run brand:outro` (re-cuts every clip, removes stale ones; `-- <name>` for one).
4. Edit `OUTRO_GROUPS` in `src/core/brand/outroConfig.ts`: per shot the `segs` to play (recording
   seconds; gaps are jump cuts), its designed `dur` and window height `h`, camera keys (`t` on the
   shot's edited timeline, centre + zoom in recording px; two keys at the same `t` = a hard cut),
   `marks` (rings, click ripples, labels, at recording seconds) and `blur` boxes. Blur boxes take
   `from`/`to` (recording seconds) when content appears or scrolls, and `track` keyframes to follow a
   scroll. Per-recording `bounds` keep browser chrome out of frame; per-recording `blur` holds what is
   always on screen (account name).
5. Check: `npm run typecheck`, render stills of `hakabot-outro-preview` at every shot's start, middle
   and end, and look at **every blur box at full size** (tickers, company names/logos, account name,
   avatar, investor names). Then render the preview video and watch it.
