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

One premium fintech app: palette **B · Premium UI** (short crisp taps, haptic low thumps, soft sine pings, one air
puff) is the base; palette **C · Terminal** (square-wave blips, relay click, low lock-in, tape-stop) comes in where the
story is about data and numbers moving. Chosen by the user 2026-10-13 (`episodes/ep01-ihsg-dca/qa/sfx-compare.md`).
`SfxName` in `src/core/audio.tsx` lists exactly these names.

| Name | Pack | Use | Volume | Peak | 1–4 kHz |
|---|---|---|---|---|---|
| `b-air` | B | scene changes (added automatically by the shell); a soft turn inside a scene | 0.3 (0.24 under words) | ~4 f | 48% |
| `b-rise` | B | big entrances, bars growing, outro feature changes (start 7 f before the cut) | 0.3–0.4 | ~7 f | 10% |
| `b-tap` | B | chips, labels, callouts, pills; soft landings (notes on a pile) | 0.3–0.38 (0.22 for small landings) | 0 f | 11% |
| `b-click` | B | UI click ripples in screen recordings | 0.24 under words | 0 f | 72% |
| `c-chatter-1`…`-4` | C | counters and grids filling: rotate 1→3→2→4, ≤ 8 per fill, level wobble 0.14–0.17 | 0.14–0.18 | 0–1 f | 26–43% |
| `c-lock` | C | a number or milestone locking in (lands on the spoken amount) | 0.3–0.4 | ~2 f (start 2 f early) | 6% |
| `b-confirm` | B | success / a peak reached (two soft pings) | 0.3 (0.22 under words) | ~3 f | 51% |
| `b-pay` | B | money landing (three quick pings) | 0.2–0.25 (0.17–0.18 under words) | 0 f | 76% |
| `b-build` | B | build-up before a reveal or fall (accelerating haptic pulses, top at 1.5 s) | 0.25 | ~44 f | 7% |
| `b-dip` | B | a small downward move (an arrow pointing down) | 0.25–0.3 | 0 f | 0% |
| `c-fall` | C | a decline starting (descending blips, ~1 s) | 0.25–0.3 | 0 f | 12% |
| `c-crash` | C | the story's big crash landing (low hit + static + tape-stop drone) | 0.45–0.55 | 0 f | 0% |
| `b-hit` | B | other impacts (haptic sub thump). `b-hit` + `c-crash` together ≤ 3 per video | 0.45–0.55 | 0 f | 0% |
| `c-alarm` | C | shock accent (two terminal beeps), paired with an impact | 0.22–0.3 | ~1 f | 8% (91% at 0.5–1 kHz) |
| `b-mark` | B | logo / end card (low thump + two pings) | 0.36–0.4 | 0 f | 50% |

Peaks are in frames at 30 fps from the cue's start; put the peak, not the start, on the visual it belongs to.
`b-build` is the exception: start it 45 frames before the moment it leads into.

Volumes assume the voice at −16 LUFS per take (`voiceover.py` normalizes every take to that). The voice always wins:
SFX stay at 0.15–0.55 (the chatter steps may go to 0.14), no more than 2 cues within 6 frames, impacts ≤ 3 per video.
Where a cue runs under a word, the 1–4 kHz column decides how far to lower it: above ~40% (`b-air`, `b-click`,
`b-confirm`, `b-pay`, `b-mark`, the chatter) go 0.05–0.15 under the table; below ~15% (`b-rise`, `b-tap`, `b-build`,
`b-dip`, `b-hit`, `c-lock`, `c-fall`, `c-crash`) can keep their level. `c-alarm` sits just under the band (0.5–1 kHz)
but is two beeps that cut through, so keep it at the low end. Final mix target: about −14 LUFS integrated, true peak
≤ −1 dBTP. Watch stacked low hits: a sub thump (`b-hit`, `c-crash`) whose first cycle lands on a loud syllable sets
the video's true peak and caps the loudness gain; nudging it 1–2 frames off the syllable fixes that (ep01 Covid).

### Music

Every episode gets an **original score composed in code** (`scripts/music_synth.py`, `npm run music -- <id>` →
`public/music/<epNN>-score.wav`). Nothing is downloaded, so there's nothing to license. The style is a curious,
cinematic explainer underscore (think Veritasium): felt piano, warm analog-style pads, a soft pulsing bass and
plucked 8ths that build momentum, light kick/shaker only at the builds, a spacious synthetic hall. It's never melodic
enough to compete with the words. Key D major / B minor, which agrees with the SFX (b-confirm G5 → D6).

- **Scored to the story.** The script reads the real `timing.json`: every section starts on a scene cut and is a whole
  number of bars (tempo flexes ~87–106 BPM so the bar lines land on the cuts). The big crash gets a tape-stop + closing
  filter into silence so the crash SFX and the voice hit alone. Re-run it after every re-voice.
- **Exact length.** The file is exactly the video's length, so `MusicBed` never loops it.
- **Mix rules baked in:** 1–4 kHz dipped ~8 dB while the voice speaks; dips under impacts; fader automation for the
  arc (quiet hook → crescendo → peak → silence → dark twist → reflective lesson → forward outro → resolve on the end card).
- **Level.** The score is mastered to −16 LUFS (same as the voice), and `music: {src, level: 0.3}` in the episode
  puts it ~16–19 dB under the voice once `MusicBed` ducks it (×0.35 under speech), and ~21–38 dB under in 1–4 kHz.
  (0.16 is the right level for a commercial track mastered around −10 LUFS; ours is quieter, hence 0.3.)
- A new episode copies `score()` in `music_synth.py` and rewrites its sections for that story; the instruments,
  anchors, mix and mastering are shared. Any other track in `public/music/` must be licensed by the user.

**Not used (files kept on disk; the user decides whether to delete them):** the legacy set `whoosh`, `whoosh-soft`,
`swoosh-down`, `pop`, `tick`, `ding`, `coin`, `riser`, `drop`, `impact`, `glitch`, `shimmer` (rejected: "sounds like
every AI video"); the round-1 musical palette (`bloom`, `swell`, `pluck*`, `step-1`…`-8`, `chime`, `glint`, `ascend`,
`descend`, `sink`, `thud`, `sour`, `bell-bloom`, `signature`); palettes A (`a-*`) and D (`d-*`); and the unpicked
B/C slots `b-tick`, `b-buzz`, `c-scan`, `c-boot`, `c-blip`, `c-click`, `c-cash`, `c-charge`, `c-logo`, `c-chatter`
(the single burst, replaced by the four step variants).

Rebuild: `npm run sfx` regenerates everything and reproduces the B/C files bit for bit.

## Checking your work

- `npm run render -- <id> --stills scenes` renders one still per scene into `episodes/<id>/qa/`. Look at every one.
- `npm run studio` lets you scrub motion live.
- Look for overflow, overlaps, text in safe zones, and numbers that disagree with `facts.md`.
