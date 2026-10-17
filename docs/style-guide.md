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
| `core/format` | `fmt.rp/num/pct/signedPct/axis/words/juta` (`juta(n, digits)` → Rp 5,3 juta), `monthLabel`, `monthShort`, `dateLabel` |

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

Rebuild: `npm run sfx` regenerates everything and reproduces the B/C files bit for bit. The long-form tutorials have
their own palettes `t1-*`…`t4-*` (B was rejected there too): Tutorials → Sound and music.

## Tutorials (16:9 long-form, `src/core/tutorial/`)

Long YouTube tutorials edited from the user's screen recordings (first: `tut01-hakabot-tutorial`, from the 4K
`temp/New.mp4`). Not a short: no `EpisodeShell`, no 9:16 safe zones, no watermark, no `hakabot-outro`. The
voice/timing pipeline is the same (`timing.json` + anchors), so the edit re-syncs when the real voice lands. Before
you build, read the reference chapters `beats/dash.ts` and `beats/watch.ts` of tut01: they use every feature below.

### Frame layout (`layout.ts`)

| Zone (1920×1080) | What |
|---|---|
| y 0–72 | top margin: the chapter label ("02 │ Watchlist", quiet, left). Never over app UI. |
| `WIN` x 40, y 72, 1840×937, radius 18 | the screen window. Aspect 1,964 = a 3840×1956 page viewport, so a full page at zoom 1 fills it. |
| window y > ~820 (frame y ≈ 890–981) | burned-in subtitles (36 px, ≤ 2 lines). Keep rings and labels above it (labels flip automatically). |
| y 1009–1080 | bottom margin: PREVIEW badge (right, only while timing is estimated); intro/end small print (centre). |

### Files of a tutorial episode (one file per chapter, so chapters can be built in parallel)

```
src/episodes/<id>/
  index.tsx            TutorialDef (shared; don't edit for a chapter)
  recordings.json      source recordings: raw file, page viewport `bounds`, `clipWidth`, always-on blurs (shared)
  recordings.ts        reads recordings.json for the player (shared)
  chapters.ts          chapter cards: BAB number, title, first scene, which scene ids belong (shared)
  copy.ts              intro, chapter titles, end card strings (shared)
  timing.json          npm run vo:estimate -- <id> (estimated) / npm run vo -- <id> (real)
  beats/index.ts       merges every chapter (shared: already imports all chapter files, incl. stubs)
  beats/common.ts      REC, FULL, NAV menu rects, navCenter(), ACCOUNT (shared)
  beats/<chapter>.ts   ONE CHAPTER: `export const beats: Record<string, Beat>` + its framings, element rects, labels
  clips/index.ts       merges every chapter's clip list (shared)
  clips/<chapter>.json ONE CHAPTER: {"clips": {"<chapter>-a": {rec, start, end, note}, ...}}
  scenes/*.tsx         code-made scenes (Intro, EndCard, Stage helpers)
```

**Building a chapter = editing only `beats/<chapter>.ts` and `clips/<chapter>.json`** (tut01 chapters: `dash`,
`watch`, `stock`, `fund`, `idx`, `comp`, `scr`, `hb`, `akun`; `intro` and `end` are code-made). Beat ids are the
script's scene ids; a scene without a beat renders as a grey placeholder with its lines, so the whole timeline stays
reviewable. Clip names start with the chapter id (`stock-a`, `stock-b`…) and must be unique across chapters (the
merge throws on duplicates). The chapter's on-screen label strings (Bahasa, 2–5 words) sit in a `const L` at the top
of its beat file. Need something in a shared file (a new NAV rect, a chapter title)? Ask the producer.

### Coordinates and source

- **All positions are raw-recording pixels.** New.mp4 is 3840×2160, so read positions straight off full-size 4K
  frames with `scripts/tutorial_probe.py` (output into your scratchpad): `grid` crops an area 1:1 with a labelled
  pixel grid (`grid temp/New.mp4 52.2 740 400 1800 1000 out.png 50`), so rects are read, not guessed (estimating
  from downscaled screenshots puts rings on the wrong button). Recording times are raw seconds; shotlist-v2.md is
  ±1 s, so find the exact frame first: `diff temp/New.mp4 51 60 1500 950 800 400` prints every frame where that
  region changes (a click's result, a tooltip, a dialog); `sheet` makes timestamped contact sheets of a stretch;
  `scroll` measures scroll offsets for blur `track`s.
- New.mp4's page viewport is `bounds` x 0–3840, y 132–2088: the browser tab strip + URL bar (y < 132) and the
  Windows taskbar (y ≥ 2088) are never drawn. The OBS window is in the first 0,3 s and from 13:51 (831 s): never use.
- The menu bar is sticky (same place on every page and scroll position): `NAV` in `beats/common.ts`.
- Layouts move: tables and side panels reflow when rows are added/removed and pages scroll, so measure each rect
  at the moment it's ringed (tut01 Watchlist: the group panel sits 66 px higher with 2 table rows than with 3).

### Clips (`scripts/tutorial_clips.py`)

`python -I scripts/tutorial_clips.py <id>` cuts every clip that is missing or changed (`--chapter watch` re-cuts one
chapter, clip names re-cut single clips, `--force` all, `--prune` deletes files no list mentions). Output
`public/tutorial/<prefix>/<name>.mp4` (git-ignored, regenerable). Each clip is the recording **cropped to `bounds`
at full 4K resolution** (`clipWidth` 3840: zoom ≈ 2 is 1:1 with the source, tooltips at zoom 3 still read cleanly),
H.264 CRF 16, keyframe every 15 frames, no B-frames, no audio. Rules: ≤ ~16 s per clip (Remotion mis-seeks long
clips), start on a frame boundary (multiple of 1/30 s), every footage piece must sit inside one clip (cover each
beat's pieces with a clip and leave a little margin). Cutting is fast (≈ 1–3 s per clip). Rendering 4K clips is the
slow part: ≈ 8 fps at concurrency 8 (≈ 3,8× real time at the default 3), so use `RENDER_CONCURRENCY=8` on this
128 GB machine and run one render at a time.

### Configuring a beat (`types.ts` documents every field)

```ts
'watch-5': {
  kind: 'footage',
  enter: 'cut',                 // continue the previous beat's picture (same page); default 'fade' (new page)
  shots: [{
    rec: REC,
    // Play raw 62.6–66.5 s; the click at 63.93 lands on the spoken word "Charts". Before it the picture holds.
    pieces: [{from: 62.6, to: 66.5, align: 63.93, at: {line: 'watch-5-charts', word: 'Charts'}}],
    cam: {from: WATCH, to: CARDS, at: {rec: 64.2}, dur: 1.6},        // ONE eased move per shot, or none
    marks: [
      {kind: 'ring', rect: CHARTS_BTN, at: {line: 'watch-5-charts', word: 'Nyalain'}, until: {rec: 63.93, off: 0.4}, pad: 4},
      {kind: 'click', x: 2732, y: 445, rec: 63.93},                   // ripple on the real click
      {kind: 'ring', rect: CARD_GRID, at: {max: [{line: 'watch-5-charts', word: 'kecil'}, {rec: 64.6}]}},
    ],
    blur: [/* page-specific privacy blurs, see below */],
  }],
},
```

- **Pieces** (`{from, to, align?, at?, rate?}`): stretches of the recording, in order. `align` (a click, a keystroke)
  lands on the anchor `at`; the part after `align` speeds up (≤ 1,6×) only if it must, never slower than 1×; before
  and between pieces the picture holds; a gap between pieces is a jump cut (at most one per shot, only over dead
  time: loading, typing pauses). A piece with no `at` plays right after the previous one. Pieces may go backwards in
  the recording (tut01 watch-7 plays 13 Okt before 14 Okt); give the second one its own shot so it crossfades.
- **Anchors**: `{line, word?, nth?, end?, off?}` (voice; `word` = case-insensitive prefix of the displayed word),
  `{rec: s, off?}` (when raw second `s` plays in this shot), `{max: [...]}` (the later of several: "on this word,
  but not before the dialog is open"), or a number (seconds into the scene: entrances only). Pieces and shot starts
  take voice anchors only.
- **Camera** `{from, to?, at?, dur?}`: centre (raw px) + zoom. zoom 1 = full page width; 1,5–2 for reading a page
  area; 2,6–3 for tiny elements (Acc/Dist squares, tooltips). The view is clamped to the viewport. One slow move per
  shot (house rule). Show the whole page briefly when a new page opens. A new shot (`start` anchor) crossfades in.
- **Marks**: `ring` (rect, `at`, optional `until`, `label`, `side`, `spot`, `pad`, `track`), `click` (x, y, `rec`),
  `path` (one ring gliding along several rects, e.g. a menu read out). One ring on screen at a time, each held
  ≥ 1,2 s (enforced). Most rings need no label (the voice says it); a label is 2–5 words. `spot` dims the rest:
  use it for tiny or crowded targets, not by default. Rect = the element's own box; the ring adds `pad` (default 8
  screen px, 3–4 for small buttons). A ring on an element that only shows on hover must start after it appears
  (`{max: [word, {rec}]}`).

### Highlight style (15 Okt: "highlights can be more elegant")

Thin and calm, like a product film: ring 2 px white at 92 %, radius scaled to the element (6–14 px), soft white
glow; it enters over 14 frames with a fade and a 1,03 → 1 settle (no bounce) and leaves over 10. Spotlight dims the
rest to 50 % over 18 frames. Labels: 24 px semibold on dark glass (86 %), 1 px hairline border, radius 10, fade + 6 px
slide, 4 frames after the ring; they stay inside the window and out of the subtitle strip. Click: a faint 1,5 px
ripple (7 → 34 px over 22 frames) and a small soft dot. Gold is not used in footage highlights (it's kept for the
chapter card hairline, the intro cover line and the intro's active-chapter dot).

### Privacy blur

`BlurBox` = rect (raw px) + optional `from`/`to` (raw seconds), `track` (offsets by raw second, for scrolling
content), `sigma` (default 16), `tint`. Always-on blurs live on the recording (`recordings.json`: the account name +
avatar top-right). Page-specific ones go on the shot (`shot.blur`): tut01 Dashboard blurs the name in
"Welcome back, …" and the announcement author with the measured scroll track, stopping before they slide under the
sticky menu (a blur box over the menu would smear it). **Akun page: blur the email AND the referral code** (user,
15 Okt): one `shot.blur` box each, limited with `from`/`to` to the seconds the Akun page is open (and `track` if it
scrolls). Tickers, company and investor names stay readable (user decision).

### Chapters, intro, end card

`chapters.ts`: each chapter's card ("BAB 03" + title, ≈ 1,6 s: the footage dims, the title rises in, a short gold
hairline) shows when its first scene starts, then its label sits in the top margin until the next chapter. A
chapter's first ~1,6 s is under the card: start its footage on a calm view and keep the first click after it.
Code-made scenes are `{kind: 'custom', component}` beats in window coordinates (1840×937), or with `full: true` over
the whole 1920×1080 frame (tut01 intro and end card: `scenes/Intro.tsx`, `scenes/EndCard.tsx`, shared `Stage` look:
deep navy, one slow brand-blue glow, centred type, one idea per phase, small print in the bottom margin). Frame 0 of
the intro is the composed cover.

### Sound and music (tut01, 16 Okt)

A tutorial is listened to for ~18 minutes, so it sits lower and sparser than a short. With `sfx: true` the cues are
automatic (`ScreenShot.tsx` → `TUT_SFX`, `planCues`): the palette's **click** on every click ripple; its **ring**
sound on a ring (labelled rings slightly louder) only when nothing sounded in the 1 s before it and no other ring
sound within 4 s; no two cues closer than 0.5 s; nothing under the chapter card except its **chapter** cue
(`TutorialComposition`); the end card plays the **logo** cue before the voice and the **pill** cue on the spoken
"hakabot" (`scenes/EndCard.tsx`). No cue on every scene change, no impacts.

**Tutorial SFX palettes (`src/core/tutorial/sfxPalettes.ts`, `sfxPalette` in the TutorialDef).** The user rejected
palette B in tut01 (16 Okt: "the most common sound effects for video edit made with AI… make sure we are different"),
so tutorials use their own palettes, each modelled on a physical source, with none of the synth-UI clichés (sine
pings, swept-noise whooshes, sub thumps, square blips, pop/tick/ding, risers). Made by `palette_t1`…`palette_t4` in
`scripts/sfx_synth.py` (`npm run sfx`, or `--tut` for just these; own random generator, so the other files stay
bit-identical). Each role is loudness-matched (click/ring/pill −23, chapter −22, logo −16,5 LUFS momentary max, the B
slots' scale), so volumes compare 1:1. `b` (the old B set) stays the default until the user picks one.

| Palette | click | ring (label / plain) | chapter | logo | pill |
|---|---|---|---|---|---|
| `t1` Atelier: wood + felt piano | `t1-click` knuckle on hardwood 0.15 | `t1-ring` felt mallet on a hollow wooden box 0.13 / 0.10 | `t1-chapter` felt-piano dyad D4+A4 0.32 | `t1-logo` felt piano, rolled D add9 0.26 | `t1-pill` small wood knock 0.13 |
| `t2` Mechanism: tactile hardware | `t2-click` tactile key switch (bump, bottom-out, release) 0.12 | `t2-ring` soft leaf shutter 0.12 / 0.10 | `t2-chapter` case latch snapping shut 0.26 (at frame 4) | `t2-logo` lid closing onto its latch 0.26 | `t2-pill` key switch, no release 0.13 |
| `t3` In key (D major / B minor, the score's key) | `t3-click` muted kalimba tine A5 0.12 | `t3-ring` rosewood marimba F#5 with resonator 0.11 / 0.09 | `t3-chapter` struck singing bowl D5 (beating doublets) 0.30 | `t3-logo` marimba D–F#–A–E over a D4 bowl 0.26 | `t3-pill` marimba A5 0.12 |
| `t4` Paper: near-silent | `t4-click` fingertip on paper 0.12 | `t4-ring` short pencil mark 0.11 / plain rings silent | `t4-chapter` page turn 0.30 | `t4-logo` notebook closing 0.24 | `t4-pill` pencil dot 0.11 |

Chapter cues sit higher than the shorts' transition cue because the score lifts into every chapter card (≈ −28 LUFS
momentary under it) while the voice pauses; they still land ≥ 10 dB under the voice. Compare palettes by rendering
with the input prop: `SFX_PALETTE=t3 RENDER_CONCURRENCY=8 npm run render -- <id> --range a b` (writes
`qa/preview-a-b-t3.mp4`; range previews aren't loudness-normalized). tut01's side-by-side files: `qa/sfx-options.md`.

Music: `music: {src, level: 0.2}` in the def (`MusicBed`, ducked under speech as in the
shorts; 0.2 instead of 0.3 keeps it background). The score (`main_tut()` in `music_synth.py`, written to
`public/music/<full-id>-score.wav`) is a calm bed in the house instruments with no drums: one chord per 2 bars, a new
progression and texture (keys / flow / air / pulse) every ~1 min cut on scene starts, a lift into each chapter card
(reversed-piano bloom + 4 bars of rolled chords + a 2 dB bump), each chapter closing on the dominant, and a D add9
cadence on the end card.

### Checking a chapter

`npm run typecheck`, then stills at the moments that matter (`npm run render -- <id> --stills 52.4 61`) or a range
(`RENDER_CONCURRENCY=8 npm run render -- <id> --range a b`, then `npm run sheet -- <mp4> <jpg> --every 1`). Look
for: ring on the right element at full size, crisp text, nothing personal (tabs, taskbar, account name, email,
referral code), nothing under the subtitles, labels inside the window.

## Checking your work

- `npm run render -- <id> --stills scenes` renders one still per scene into `episodes/<id>/qa/`. Look at every one.
- `npm run studio` lets you scrub motion live.
- Look for overflow, overlaps, text in safe zones, and numbers that disagree with `facts.md`.


**Tutorial captions (.srt):** `npm run srt` uses the shorts' 6-word chunks. For tutorials use `python -I scripts/tutorial_srt.py <id> episodes/<id>/out/captions.srt`, a port of the burned-in chunker in `src/core/tutorial/Overlays.tsx` (keep the two in sync).
