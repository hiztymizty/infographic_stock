# Style guide

The look: **dark editorial finance**. A night-navy backdrop with drifting glows and film grain,
bold Plus Jakarta Sans headlines, honest charts, one gold accent for rupiah. Motion is After
Effects-style: masked text reveals, spring pops, line draws with a glowing head, camera zooms,
impact moments. The reference implementation is `src/episodes/ep01-ihsg-dca/`. Read it before
building a new episode.

## Format

1080×1920 (9:16), 30 fps, H.264, 60–90 s. Built for TikTok, Reels and Shorts.

## Layout safe zones (pixels)

| Zone | Rule |
|---|---|
| y 0–180 | App UI at top. Keep empty except the watermark (top-right, ~x 830–1020, y 96–150). |
| y 190–1400 | **Content area.** Side margins 90 px (charts may run 60–1000). |
| x > 980, y 700–1500 | TikTok/Reels right-side buttons. No key numbers or labels here. |
| y 1420–1680 | **Caption zone** (box top at 1460). Nothing important behind it. |
| y > 1700 | App UI (description, sound). Background only. |

## Color (`src/core/theme.ts` → `C`)

| Token | Use |
|---|---|
| `bg`, `bgTop`, `panel`, `panelBorder`, `grid` | surfaces, cards, gridlines |
| `text`, `dim`, `mute` | text hierarchy. Text always uses these, never a series color. |
| `gold` | headline rupiah amounts and the active caption word only. Never a chart mark. |
| `invested` (blue) | money put in / primary series |
| `value` (green) | value, gains |
| `loss` (red) | losses, crashes |
| `index` (near-white) | a single neutral series (e.g. the index itself) |
| `brand` (Hakabot blue) | Hakabot fills only (URL pill) |

Chart colors were validated for color-blind safety on the dark surface. Green and red are
close for deuteranopes, so **every gain/loss also carries ▲/▼ and a +/− sign** (`ChangeChip`,
`Triangle`). One y-axis per chart, never dual axes. Faint gridlines, sparing direct labels.

## Type

- **Plus Jakarta Sans** (`SANS`): headlines 96–150 px / 800, numbers 54–80 px / 800 with
  `fontVariantNumeric: 'tabular-nums'`, body 34–50 px.
- **JetBrains Mono** (`MONO`): kickers, labels, axes. 22–28 px, letter-spacing 0.1–0.22em, uppercase.
- Nothing smaller than 22 px. Measure long Bahasa strings: Bahasa runs longer than English,
  so check every headline in a still before moving on.

## Building blocks

| From | What |
|---|---|
| `core/EpisodeShell` | backdrop, scene sequencing with transitions, watermark, captions, voice, music, outro (automatic) |
| `core/timing` | `useScene()`, `useLine(id)` → `{from, dur, end}`, `useWordAt(lineId, word, nth)` (all scene-relative frames) |
| `core/components/ui` | `Kicker`, `Reveal` (mask slide-up), `useIn(delay, bouncy)` spring, `useRamp`, `ChangeChip`, `Triangle`, `Panel`, `CLAMP` |
| `core/components/chart` | `linePath`, `bandPath`, `fadingTicks` (gridlines that fade instead of popping when the axis rescales) |
| `core/audio` | `<Sfx name at volume />` |
| `core/format` | `fmt.rp/num/pct/signedPct/axis/words`, `monthLabel`, `monthShort`, `dateLabel` |

**Sync to the voice, never to guessed frames.** Anything that should land on a spoken word uses
`useLine` or `useWordAt` (e.g. the twist's count-down starts at `useWordAt('twist-1', 'Juni')`).
Fixed frame numbers are fine only for things relative to the scene start (entrance pops in the first 20 frames).
ElevenLabs' timestamps give the pause before a sentence to its first word (up to 0,8 s early in ep01).
`voiceover.py` corrects this automatically: it snaps every word that follows a pause to the real speech onset in
the mastered audio (first 1/120 s window above −40 dBFS), so captions, `useLine(...).from` and the .srt all match
the voice. If an anchor still looks off, re-run `npm run vo -- <id>` (free for cached takes); never hand-edit timing.json.

## Scene patterns (see ep01)

| Pattern | ep01 scene | Use for |
|---|---|---|
| Headline reveal + falling objects + question pill | `Hook` | the opening question |
| Contribution grid filling + counter | `Rules` | counts over time (months, trades, years) |
| Single line draw with start/peak/today labels | `MeetIhsg` | introducing a price series |
| Two-series journey chart, time-warp locked to VO, dynamic axis, event callouts | `Journey` | the main story over time |
| Before/after cards, count-down, bar slice breaking off | `Twist` | a reversal or shock |
| Bars + bracket + giant number + stat tiles | `Result` | the payoff |
| Statement + comment prompt + disclaimer | `Lesson` | takeaway before the outro |

## Motion rules

- **Frame 0 is the cover.** The first scene must be fully composed on frame 0 (headline already in place,
  pre-rolled springs, see `PRE_ROLLED` in ep01 `Hook.tsx`), with motion starting right after. Platforms use it
  as the thumbnail, and viewers decide in the first second.
- Something starts moving within the first 10 frames of every scene.
- One focal motion at a time. Stagger pops by 4–8 frames, never more than 2 at once.
- Travel: `Easing.inOut(Easing.cubic)`. Arrivals and pops: springs (`useIn(delay, true)`).
- Hold any key number on screen for at least 1.5 s after it lands.
- Impact moments (screen pulse, shake, break-off): at most 3 per video, saved for the real drama.

## Sound (`public/sfx`, made by `scripts/sfx_synth.py`)

| Name | Use | Volume |
|---|---|---|
| `whoosh-soft` | scene changes (added automatically by the shell) | 0.3 |
| `whoosh` | big entrances, bars growing, clip changes | 0.35–0.45 |
| `pop` | chips, labels, callouts, pills | 0.3–0.5 |
| `tick` | counters and grids filling (sparse, ≤ 12 per fill) | 0.15–0.2 |
| `ding` | a milestone reached | 0.3–0.4 (0.3 when it lands on the spoken amount) |
| `coin` | money landing | 0.2–0.25 |
| `riser` | build-up before a reveal | 0.25 |
| `drop`, `swoosh-down` | a fall / decline starting | 0.35–0.5 |
| `impact` | the crash lands (≤ 3 per video) | 0.45–0.55 |
| `glitch` | shock / error accent, paired with impact | 0.3 |
| `shimmer` | logo or peak reveal | 0.4–0.45 |

Volumes assume the voice at −16 LUFS per line (`voiceover.py` normalizes every line to that). The voice always wins: SFX stay at 0.15–0.55, no more than 2 cues within 6 frames.
Where a cue runs under a word, its spectrum decides how far to lower it. `shimmer`, `whoosh`, `swoosh-down`, `glitch` and
`coin` sit in the 1–4 kHz speech band, so go 0.05–0.15 under the table. `impact` and `drop` are mostly below 500 Hz and
can keep their level. `ding` is narrow (1–2 kHz), so 0.3 is fine on an amount. A `whoosh` peaks ~6–8 frames after it starts
(`whoosh-soft` ~4–6), so a transition whoosh starts that much before its cut, not on the word. A `pop` that would land on a
word's first frame goes 1 frame early. Music
(optional, `public/music/`) sits at a level around 0.16 and ducks under the voice automatically
(`MusicBed`). Final mix target: about −14 LUFS integrated, true peak ≤ −1 dBTP.

## Checking your work

- `npm run render -- <id> --stills scenes` renders one still per scene into `episodes/<id>/qa/`. Look at every one.
- `npm run studio` lets you scrub motion live.
- Look for overflow, overlaps, text in safe zones, and numbers that disagree with `facts.md`.
