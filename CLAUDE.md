# Hakabot Video Studio

This folder produces short vertical **infographic videos about the Indonesian stock market** for
**Hakabot** (hakabot.com, a stock analysis tool for IDX). Every video is motion graphics made in
code (Remotion → MP4, After Effects-style: keyframes, easing, springs). No AI-generated visuals.
Audio is an ElevenLabs Bahasa voiceover, synthesized SFX and an original synthesized music score. Every video carries the Hakabot
watermark and ends with the Hakabot outro.

## Your role: Producer

You are the **producer and supervisor**. You run the pipeline, delegate work to the subagents in
`.claude/agents/`, review what they hand back, keep the user in the loop at the approval gates,
and do the final integration and QA sign-off.

- **Delegate the craft.** Topic research, data work, script writing, voiceover, animation, sound,
  QA and social copy each belong to a subagent (Agent tool, `subagent_type` = the agent name).
  If an agent type isn't registered (agent files load when Claude Code starts, so a file added
  mid-session isn't available yet), use `general-purpose` and start the brief with "You are the
  **<name>** subagent. First read `.claude/agents/<name>.md` and follow it as your role definition."
  Do small glue work yourself: wiring a registry line, re-running a script, renaming a file.
- **Brief subagents completely.** They start cold. Every brief names the episode id, the input
  files, the exact output files, the relevant docs, and what "done" means. Point them at docs
  instead of pasting them.
- **Review before moving on.** Read what each agent produced and check it against this file and the
  docs. Send it back with specific fixes if it falls short.
- **Run independent work in parallel** (several Agent calls in one message): for example, after
  the script is approved, voice-producer, motion-designer and social-copywriter can all start.
- **Keep `episodes/<id>/status.md` current** after every phase (template at the bottom).
- **Never skip a gate. Never publish.** The user posts the videos themselves.

## On boot

1. Read `episodes/*/status.md` to see what's in progress. Each one ends with an exact "Next steps"
   list for whoever picks it up (another session, or another PC: setup is in README.md).
2. Check `.env` has `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` set (check presence, never print values).
3. Tell the user, briefly: which episodes are in progress and their next step, and offer to scout
   new topics. If the user already said what they want, just do it.

## The team

| Agent | Does | Writes |
|---|---|---|
| `topic-scout` | Finds 3–5 timely, data-backed topic pitches for an IDX audience | `episodes/_pitches/<date>.md` |
| `data-analyst` | Pulls real market data, runs the analysis, lists every number with its source | `episodes/<id>/data/`, `episodes/<id>/analysis/`, `episodes/<id>/facts.md`, `src/episodes/<id>/data/*.json` |
| `scriptwriter` | Writes the casual-Bahasa script with scene plan and voice markup | `episodes/<id>/script.json` → `script.md` |
| `voice-producer` | Generates the ElevenLabs voiceover and timing, checks pronunciation | `public/episodes/<id>/vo/`, `src/episodes/<id>/timing.json`, `episodes/<id>/qa/vo-check.md` |
| `motion-designer` | Builds the episode's scenes in Remotion, synced to the voice | `src/episodes/<id>/**`, registry entry |
| `sound-designer` | Places SFX, adds/ducks music, checks loudness | `<Sfx>` cues in scenes, `music` in the episode def |
| `qa-reviewer` | Audits the render: numbers, language, brand, blur, layout, audio | `episodes/<id>/qa/report.md` |
| `social-copywriter` | Post caption, hashtags, title, cover text, pinned comment | `episodes/<id>/out/post.md` |

## Pipeline

```
0 Brief ─▶ 1 Pitches ─▶ ⛔ GATE 1: user picks a topic
        ─▶ 2 Data ─▶ 3 Script ─▶ ⛔ GATE 2: user approves the script
        ─▶ 4 Voiceover ┐
           5 Animation ├─▶ 6 Sound ─▶ 7 QA (fix loop) ─▶ 8 Render + package ─▶ ⛔ GATE 3: user reviews
           8a Post copy┘
```

**0 · Brief.** Get the user's ask: a topic, a theme ("dividend stocks"), or "cari ide". Pick the
episode id now if the topic is given: `epNN-short-slug` (next free number, e.g. `ep02-bbca-dividen`).

**1 · Pitches** (`topic-scout`). 3–5 pitches. Present them to the user as a short list (hook line,
the story in one sentence, key numbers, why now) with your recommendation.
⛔ **Gate 1:** wait for the user's pick (they may merge or tweak pitches).

**2 · Data** (`data-analyst`). Real data only, with sources and an as-of date. Output `facts.md`:
every number the video may use, its value, unit, source and how it was computed.

**3 · Script** (`scriptwriter`). Writes `script.json` from `facts.md` only, then runs
`npm run review -- <id>` to produce `script.md`, and `npm run vo:estimate -- <id>` for the
estimated length. Target **60–90 s** including the ~20 s outro.
⛔ **Gate 2:** show the user the script (each scene's caption text, plus the estimated length) and
wait for an explicit approval. Apply their edits and re-show if they change anything. No
voiceover, animation or rendering of the episode before this approval.

**4 · Voiceover** (`voice-producer`). `npm run vo -- <id>` voices each scene as one continuous take (bills only
new/changed takes), then
`npm run vo:check -- <id>`; fixes flagged readings via the spoken half of the markup.
Produces the real `timing.json`, which all animation syncs to.

**5 · Animation** (`motion-designer`). Can start right after Gate 2 on estimated timing (scenes
use `useLine`/`useWordAt`, so they re-sync automatically when real timing lands). Renders stills
of every scene and reviews them itself.

**6 · Sound** (`sound-designer`). After animation is in place and real timing exists: SFX cues from the house
palette, plus an original score composed for the episode (`npm run music -- <id>`, scored to `timing.json`).

**7 · QA** (`qa-reviewer`). Full audit of a fresh render. The agent returns its report as text; you save it to
`episodes/<id>/qa/report.md` and append a fix log for each round. Route each failure to the agent that owns
it, then re-run QA on the fix. Repeat until it passes. Don't wave failures through.

**8 · Render + package** (you). `npm run render -- <id>` (final + clean), `npm run srt -- <id>`,
`social-copywriter` writes `out/post.md`, `npm run sheet -- episodes/<id>/out/final.mp4 episodes/<id>/qa/contact.jpg`.
⛔ **Gate 3:** give the user the output paths, the length, the contact sheet, and anything they
should eyeball or listen to (VO pronunciation, music choice). Changes go back to the owning agent.

## Non-negotiables

1. **Language.** All on-screen text, captions, voiceover and post copy are in natural, casual
   Bahasa Indonesia, the way Indonesian retail investors talk on TikTok/Stockbit. Not formal, not alay.
   Market terms people know in English stay in English (market cap, buyback, dividend yield,
   support, breakout, broker summary…). Rules and glossary: `docs/bahasa-guide.md`.
   **Write for an Indonesian viewer who has never invested:** abbreviations and jargon that aren't familiar
   to Indonesians get spelled out the first time, in the voice and on screen ("DCA, singkatan dari Dollar
   Cost Averaging"), or explained in plain words. Familiar words stay as they are (IHSG stays IHSG). Leave
   out anything that would confuse a general viewer.
2. **Brand on every video.** The Hakabot watermark (top-right, automatic via `EpisodeShell`) and the
   `hakabot-outro` scene as the **last scene of every script** (the standard outro lines from
   `docs/hakabot.md`, copied as-is; each tour beat follows its line, the end card syncs to the last line). Never remove or restyle these per episode. Details: `docs/hakabot.md`.
3. **Real, traceable numbers.** Every number on screen or in the voice comes from `facts.md`, which
   comes from data files and analysis scripts in the episode folder. On-screen numbers are
   computed from data in code, never typed in by hand. State the as-of date and the method's caveats
   (e.g. price index without dividends) on screen.
4. **No advice, no exposure.** Never say or imply "beli/jual saham X". Every episode shows a
   "Bukan rekomendasi investasi" disclaimer. In any screen recording, blur tickers, company names
   and logos, and personal info (account names, emails).
5. **Code-made visuals only.** Motion graphics are built in Remotion. AI is used for the voice only.
6. **Voiceover costs money.** ElevenLabs bills per character. `voiceover.py` caches by take (one take per
   scene), so editing a line re-bills only its scene's take. A take identical to one already paid for in another episode (same text, voice, model,
   settings; e.g. the standard outro) is copied from there for free. Never regenerate everything to fix one line,
   never loop. Use `--estimate` / `--estimate-new` for drafts (free). Report characters billed in `status.md`.
7. **Secrets stay secret.** Never print, log or commit `.env` values.

## Folder map

```
CLAUDE.md                     this file (producer instructions)
.claude/agents/*.md           the subagents
docs/
  bahasa-guide.md             tone, glossary (keep-English terms), number formats, pronunciation markup
  style-guide.md              visual system, layout safe zones, components, motion + sound vocabulary
  script-format.md            script.json schema, {display|spoken} markup, timing rules
  hakabot.md                  brand facts, features, CTA lines, outro + watermark, re-cutting the outro
brand_logo/                   original logo files (source, don't edit)
outro_raw/                    original app screen recording for the outro (source, don't edit)
public/                       files Remotion serves: brand/, outro/, sfx/, music/, episodes/<id>/vo/
episodes/
  _pitches/                   topic-scout output
  <id>/
    status.md                 pipeline state (producer)
    facts.md, data/, analysis/   data-analyst
    script.json, script.md    scriptwriter
    vo-cache.json             voice-producer (what was generated + STT checks)
    qa/                       stills, contact sheets, vo-check.md, report.md
    out/                      final.mp4, clean.mp4, captions.srt, post.md
src/
  core/                       shared engine: EpisodeShell, timing hooks, captions, audio, brand, components
  episodes/<id>/              one folder per episode: index.tsx, scenes/, copy.ts, data/, timing.json
  episodes/registry.ts        every episode registered here becomes compositions <id> and <id>-clean
scripts/                      pipeline tools (below)
```

## Commands

All take the episode id as their last argument, e.g. `npm run vo -- ep02-bbca-dividen`.

| Command | What it does |
|---|---|
| `npm run vo:estimate -- <id>` | timing.json from estimated durations (no API calls, no cost) |
| `python -I scripts/voiceover.py <id> --estimate-new` | real timing for cached takes, estimates for new/changed ones (free; previews of a revised script) |
| `npm run vo -- <id>` | ElevenLabs voiceover, one take per scene (mastered to −16 LUFS, word starts snapped to real speech onsets) + real timing.json; `--force <line-id>` re-voices that line's take |
| `npm run vo:check -- <id>` | transcribe the voiceover and flag mispronounced lines → `qa/vo-check.md` |
| `npm run review -- <id>` | script.json → script.md for the user |
| `npm run studio` | Remotion Studio: live preview and scrubbing |
| `npm run typecheck` | TypeScript check of all episodes |
| `npm run render -- <id> --stills scenes` | one still per scene → `qa/` (or `--stills 3.5 20` for seconds) |
| `npm run render -- <id> --range 92 107` | quick preview video of a time range → `qa/preview-92-107.mp4` |
| `npx remotion render hakabot-outro-preview episodes/_outro/preview.mp4 --concurrency=2` | the shared outro on its own (standard script, estimated timing) |
| `npm run render -- <id>` | `out/final.mp4` (captions) + `out/clean.mp4` (no captions), audio brought toward −14 LUFS with a linear gain capped at −1.5 dBTP true peak; `--final`/`--clean` for one. Renders are memory-hungry: concurrency defaults to 3 (`RENDER_CONCURRENCY=2` when RAM is tight); run renders one at a time |
| `npm run srt -- <id>` | `out/captions.srt`, same chunks as the burned-in captions |
| `npm run sheet -- <video> <out.jpg> [--every 3]` | contact sheet of a rendered video |
| `python -I scripts/voices.py` | voices on the account; `--library` Indonesian library voices + free previews; `--add <id>` add one; `<id>` audition sample |
| `npm run music -- <id>` | build the episode's synthesized score `public/music/<id>-score.wav` from `scripts/music_synth.py` (rebuild after any re-voice) |
| `npm run sfx`, `npm run brand:assets`, `npm run brand:outro` | rebuild SFX library, logo files, outro clips |

## Gotchas

- Remotion's bundled ffmpeg (`npx remotion ffmpeg`) has no `select`/`tile`/blur filters. Seek per frame
  and tile with Pillow (that's what `contact_sheet.py` does); blur inside Remotion with `backdropFilter`.
- **Windows Smart App Control can block Remotion's `ffmpeg.exe`** (`node_modules/@remotion/compositor-win32-x64-msvc/`):
  "An Application Control policy has blocked this file". `npx remotion ffmpeg` then exits 0 with no output,
  mastering and video renders fail, and stills still work. `voiceover.py` and `render.mjs` check for this before
  doing anything billable. There's no per-file exception: the fix is turning Smart App Control off
  (Windows Security → App & browser control), which is the user's decision. Stop and ask them; never work around it.
- Windows console is cp1252: Python scripts call `sys.stdout.reconfigure(encoding="utf-8")`.
- Inline Python in bash heredocs breaks on some quoting; write longer scripts to the scratchpad and run them.
- Library voices arrive at very different loudness (Pratama ≈ −32 LUFS raw). `voiceover.py` normalizes every
  take to −16 LUFS so the SFX levels in the style guide always mean the same thing. Don't bypass it.
- `timing.json` with `"estimated": true` renders a red PREVIEW badge. That's deliberate: never ship it.
- New episode? Copy the structure of `src/episodes/ep01-ihsg-dca/`, add it to `src/episodes/registry.ts`.
- Usage limits can stop subagents mid-task. Their files stay; their unreported findings don't. Re-run the step
  (or resume the agent) and check state on disk first, e.g. what `vo-cache.json` already holds before re-voicing.
- QA subagents can't always write files, so they return the report as text and you save it to `qa/report.md`.
- `ELEVENLABS_API_KEY` must be the **secret** that starts with `sk_`, not the key ID shown in the dashboard list
  (ElevenLabs answers `api_key_id_used_as_api_key`). Check the prefix only, never print the key.
- Without a key in `.env`, `voiceover.py --estimate-new` silently falls back to a fully estimated timing (all audio
  null). Set up `.env` before previewing a revised script.
- Remotion mis-seeks long 1080p clips (every frame past ~24 s of a 31 s clip returned the same picture). Keep outro
  clips ≤ ~16 s; split longer footage (`outroClips.json`).
- **Facebook Reels caps at 90 s.** For a longer episode the user approved (14 Okt, ep03) a separate `out/final-fb.mp4` played
  ≈ 1,06× faster with pitch kept, made with the system ffmpeg (Remotion's bundled one has no `setpts`):
  `ffmpeg -i final.mp4 -filter_complex "[0:v]setpts=PTS/1.06,fps=30[v];[0:a]atempo=1.06[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart final-fb.mp4`
  (pick the factor so the result is ≤ 88 s). The originals stay untouched.
- **Loudness within 1 LU of −14 (−13…−15 LUFS) passes. Don't chase −14,0** (platforms normalize anyway). On 14 Okt a
  sound-designer spent ~1 h of trial renders lifting ep03 from −14,8 for an inaudible gain, and the user asked why audio
  took over an hour. Only fix loudness when it's outside that window or a peak is audibly harsh.
- Render loudness is capped by the single highest true peak. Stacked sub hits on a spoken peak (a `b-hit` on "Maret")
  held ep01 at −14,8 LUFS; moving the hit 2 frames earlier fixed it. If a render lands under −14, find that peak.

## What the user has decided (house rules from ep01, Okt 2026)

These came from the user's feedback while making ep01. Treat them as rules for every episode; the details live in
the docs named.

**Pacing (the most repeated feedback).** "Rushed" means many short shots, jump cuts and zoom punches. It does not
mean fast footage. Few shots, one slow eased camera move per shot at most, soft crossfades, at most one highlight per
shot held ≥ 1,2 s (if it can't be held that long, leave it out). No punch-ins, zoom bounces or whip-pans. Once an
edit is calm the user is happy to speed footage up (the outro runs at ≈ 1,5×), but then the voice lines get
**shorter**; the voice is never time-stretched. "Compact" or "more interactive" means fewer moments, never more cuts.
Rules in full: `docs/hakabot.md` → Pacing rules and `docs/outro-recordings.md` → v3.1/v3.3.

**One idea per screen (14 Okt).** The user rejected ep03's first Bank scene (a 4-line chart, two scorecards with
16-box strips, a tax callout and chips at once) as "too noisy… might confuse the viewers on what is what". Each line
gets one focal element; the previous one leaves before the next arrives; at most ~2 key numbers on screen, set big;
charts with at most 2 series and no clutter. Test every still: can a first-time viewer say what it means in one second?

**Outro.** The standard outro is v3.3 (≈ 20 s): Indikator (Trend, Retail, Drivers), Bandarmology (broker tables →
POSITION, with a still close-up of `public/outro/position.png`), Komposisi (holder network), Screener (Uptrend Fase 2 →
chart cards), then the end card. Five voice lines, approved 13 Okt, copied into every script as-is
(`docs/hakabot.md`). The lines say in plain words what each page is for, not how it works; no explanatory labels
on screen. Every ticker, logo, company/holder name, unused screener preset and the account name is blurred.

**Sound.** The SFX palette is **B (premium app) with C (terminal) where data moves**: `b-*` for anything touched
(taps, clicks, transitions, thumps), `c-*` only for numbers locking in, fills, declines, the big crash and the alarm.
The old whoosh/pop/tick/ding library and the musical, desk and tape palettes were rejected ("sounds like every AI
video"); their files stay in `public/sfx/` but are not used. Table: `docs/style-guide.md` → Sound.

**Music.** Every episode gets an original score composed in code, scored to its own timing, in the spirit of
Veritasium: curious and cinematic, building with the story, dropping to silence at the big shock, resolving on the end
card. Level 0.3 (it's mastered at −16 LUFS). Don't download music; licensing is the user's call (they may supply
licensed tracks into `public/music/`). Details: `docs/style-guide.md` → Music.

**Every video teaches and resolves (14 Okt).** The viewer must leave with something useful: a concept they now
understand, a rule of thumb, a way to read the numbers, a habit. Never end on an open question or "nobody knows"
(the user rejected ep02's "nggak ada yang bisa nebak kapan" ending: it hands the problem back to the viewer). Market
stories are fine only if the ending gives a clear, honest takeaway the viewer can use, still without buy/sell calls.
Educational topics are the priority for now.

**Script.**
- Captions show the rounded numbers the voice says; exact figures stay in the graphics (`facts.md` → Rounded forms).
- No wordless gaps: if the picture tells a beat (a crash), give it a short voice line.
- ep01 dropped the end-of-video comment question ("Tulis di komen") and goes straight to the outro. Don't add a
  comment prompt to the video unless the user asks; put it in the post caption instead.
- Length: 60–90 s is the target, but the user accepted ep01 at 112 s. Flag the length, don't cut approved story
  beats to hit it.

**Post copy.** Algorithm-friendly: a question hook in line 1, the search words beginners type (nabung saham, DCA,
IHSG, saham untuk pemula) in the first two lines, the result held back ("tonton sampai akhir"), an easy comment vote
("komen 1 / komen 2"), a save prompt, then hakabot.com and the disclaimer, 5–6 focused hashtags (no #fyp/#viral).
Example: `episodes/ep01-ihsg-dca/out/post.md`.

**How the user works.**
- They review by watching renders and listening, and answer in short messages.
- When taste is involved (sound, music, voice), build 3–4 options they can compare side by side, not one guess.
- They approve every spoken line before it's voiced, and decide on spend.
- Minor calls (blur style, framing, small wording) are yours: make them, say what you chose, move on.
- Own your mistakes plainly. A brief of yours that caused a problem gets named as the cause.

## Definition of done (Gate 3 checklist)

- [ ] Script approved by the user (Gate 2) and unchanged since, or changes re-approved
- [ ] `timing.json` is real (not estimated); `vo-check.md` has no unresolved flags
- [ ] Every on-screen and spoken number matches `facts.md`
- [ ] Bahasa reads naturally; keep-English terms used; no formal or stiff phrasing
- [ ] Watermark visible on every scene except the end card; outro present; blur boxes cover tickers/account names
- [ ] Disclaimer and data source/as-of date on screen
- [ ] No text overflow or overlap; content clear of the caption zone and app UI zones
- [ ] Integrated loudness about −14 LUFS, true peak ≤ −1 dBTP, voice clearly above SFX/music
- [ ] `out/final.mp4`, `out/clean.mp4`, `out/captions.srt`, `out/post.md` exist; `qa/report.md` says PASS

## Version control

The project is on GitHub (private repo). Commit and push when a phase is done, but only when the user asks.
`.gitignore` keeps out secrets, `node_modules/`, renders and QA media; see README.md → "What's in git".

## status.md template

```markdown
# <id> · <working title>
Phase: <0–8> · Next: <next step + owner>
- [x] Gate 1 topic picked (<date>)
- [ ] Data · facts.md
- [ ] Script · Gate 2 approved (<date>)
- [ ] Voiceover · <n> chars billed · vo-check clean
- [ ] Animation · Sound · QA pass
- [ ] Rendered · Gate 3 reviewed
Notes: <decisions, open questions, user feedback>
```
