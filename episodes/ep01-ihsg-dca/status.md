# ep01-ihsg-dca · DCA Rp 5 juta/bulan ke IHSG sejak 2010

Phase: **7 (QA)** · Next: **qa-reviewer** audits the current render (round "v3 voice"), then Gate 3 with the user.

- [x] Gate 1: topic picked (pilot: the approved English video remade in Bahasa)
- [x] Data: facts.md (Yahoo ^JKSE monthly, as of 9 Okt 2026), including the "Rounded forms used in voice/captions" table
- [x] Gate 2: script approved (revised 10–11 Okt): simpler wording, DCA spelled out, written for the ear,
      captions match the rounded voice, line j-crash cut
- [x] Voiceover: Pratama on **eleven_v3**, speed 1.05, **12 takes (one per scene)**, 1.437 chars
      (+97 from an attempt blocked by Smart App Control = 1.534 for this version). vo-check 0/12 flagged.
      Real length **110,8 s**, which the user accepted (12 Okt).
- [x] Animation: re-checked on the real timing (word starts snapped to speech onsets by voiceover.py)
- [x] Sound: re-levelled for the v3 takes. Render −14,3 LUFS / −1,5 dBTP; SFX ≥ 5 dB under the voice
- [x] Rendered 12 Okt: `out/final.mp4`, `out/clean.mp4` (110,8 s), `out/captions.srt` (51 cues). Videos are not in
      git: on another PC, re-render with `RENDER_CONCURRENCY=2 npm run render -- ep01-ihsg-dca` (no voice cost:
      takes are in git).
- [x] Post copy: `out/post.md` updated; cover frame **68,47 s** (frame 2054) checked visually
- [ ] **QA (v3 voice round)**: started, but stopped by a usage limit and then the session ended, so no report.
      `qa/report.md` holds only the earlier rounds (10 Okt, old voice).
- [ ] Gate 3: the user reviews the final

## Next steps (for the next agent)
1. If `out/final.mp4` is missing (fresh clone), render it first: `RENDER_CONCURRENCY=2 npm run render -- ep01-ihsg-dca`.
2. Run the `qa-reviewer` subagent on the render. Brief it with:
   - the user accepted 110,8 s
   - captions deliberately match the rounded voice (check them against the facts.md rounded-forms table)
   - DCA must be spelled out; IHSG stays IHSG
   - j-crash was cut on purpose (the crash plays wordless in the journey tail)
   - check the outro blur at full resolution
   Save the report it returns to `qa/report.md` (append it as a new round).
3. Route any failures to the owning agent, re-render if needed (one at a time), re-run QA.
4. Gate 3: give the user `out/final.mp4`, `out/clean.mp4`, `out/captions.srt`, `out/post.md` and a contact sheet
   (`npm run sheet -- episodes/ep01-ihsg-dca/out/final.mp4 episodes/ep01-ihsg-dca/qa/contact.jpg --every 3`),
   plus the listening list below.

## Listening list for Gate 3
- "DCA" and "Dollar Cost Averaging" in the rules (≈ 7–20 s): natural?
- "Terus… 2026 datang" (≈ 31,8 s): does the beat land?
- 46,4 s: COVID impact + glitch, then "Maret 2020". Is "Maret" clear?
- 60,7–62 s: the wordless crash. Big enough, but not too loud?
- 64,9–67,7 s: twist cues under "Juni tinggal Rp 1 miliar lebih dikit". Does "dikit" survive?
- "Hakabot" (≈ 91,5 s) and "hakabot dot com" (≈ 107 s): brand-name stress.

## Spend
ElevenLabs characters on this episode so far: 1.556 (first Bahasa voice, per line) + 532 (v2/v3 A/B samples)
+ 1.534 (current v3 takes) = 3.622.

## History and decisions
- English cut (approved style) archived in `archive-en/` (videos not in git; the storyboard is).
- Gate 3 round 1 feedback (10 Okt): the wording was hard for general viewers, and the outro felt rushed. The
  outro was re-edited twice. v2 is 3 calm beats (Chart & Indikator, Broker Activity, Screener) plus the end card;
  shot log and EDL are in `docs/outro-recordings.md`.
- Voice changes:
  - Per-line takes sounded unnatural (pitch resolving mid-sentence, odd micro pauses), so we moved to one take
    per scene with calm settings.
  - v3 was chosen over v2 in an A/B.
  - Raw Pratama audio is ≈ −32 LUFS, so voiceover.py masters every take to −16 LUFS (with a limiter for peaky
    takes) and snaps word starts to real speech onsets.
- User rules added along the way (now in the docs):
  - clarity first (spell out unfamiliar abbreviations like DCA; familiar words like IHSG stay)
  - write for the ear
  - captions match the voice
- Pending user requests: a female narrator option later; music tracks later (`public/music/`).
- On the original PC, Windows Smart App Control had to be turned off because it blocked Remotion's ffmpeg.
