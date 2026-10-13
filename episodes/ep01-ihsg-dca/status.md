# ep01-ihsg-dca · DCA Rp 5 juta/bulan ke IHSG sejak 2010

Phase: **8 → Gate 3** · Next: the user's final review of the package (they said "everything looks okay" on 13 Okt
after round 5). Then commit/push only when the user asks.

- [x] Gate 1: topic (pilot: the approved English video remade in Bahasa)
- [x] Data: facts.md (Yahoo ^JKSE monthly, as of 9 Okt 2026), incl. the "Rounded forms used in voice/captions" table
- [x] Gate 2: script approved (10–11 Okt), revised and re-approved 13 Okt:
      new journey line `j-crash` "Tapi masuk 2026, IHSG anjlok 35%." (fills a wordless gap at ~60–63 s),
      `lesson-2` comment question removed, new 5-line standard outro
- [x] Voiceover: Pratama, eleven_v3, 14 takes; vo-check 0/14 flagged. Real length **112,2 s** (story ≈ 92 s +
      outro 20,4 s); the user accepted the length.
- [x] Animation: Journey crash synced to j-crash; Lesson without the comment pill; outro v3.3
- [x] Sound: SFX palette B + C; original score `public/music/ep01-score.wav` (level 0.3); render −14,0 LUFS / −1,5 dBTP
- [x] QA rounds 3–5 (13 Okt): all PASS except fixes now applied (see `qa/report.md` fix logs)
- [x] QA round 6 (producer): no ring on the POSITION still, pan unchanged, −14,0 LUFS both files → PASS
- [ ] Gate 3: hand over `out/final.mp4`, `out/clean.mp4`, `out/captions.srt`, `out/post.md`, `qa/contact.jpg`

## Next steps (for the next agent)
1. If `out/final.mp4` is missing (fresh clone): `npm run music -- ep01-ihsg-dca` (the score is gitignored), then
   `RENDER_CONCURRENCY=2 npm run render -- ep01-ihsg-dca` and `npm run srt -- ep01-ihsg-dca`. No voice cost: all
   takes are in git.
2. QA is done (round 6 PASS). Gate 3 with the user.
3. Gate 3 listening list: the music arc and level (0.3); the silence at 62,1–64,1 s into "anjlok"; the twist bed
   67–76 s; the end-card resolve 108,6–112,2 s; "Hakabot" at ~92,1 s (STT heard "HKBot"; re-voicing outro-1 costs
   86 chars); the Indikator beat at ~1,5× (91,8–97,9 s).
4. Post: `out/post.md` (algorithm-friendly caption, cover 72,0 s, backup 64,8 s).

## Spend
ElevenLabs characters on this episode: 3.622 before 13 Okt + 427 on 13 Okt (j-crash 77, lesson 81, outro 269) = 4.049.
The 13 Okt run billed only new/changed takes; a first attempt with the key ID instead of the `sk_` secret billed 0.

## History and decisions
- English cut (approved style) archived in `archive-en/`.
- 10 Okt: the wording was hard for general viewers → clarity-first rules; outro v1 felt rushed → v2.
- 12–13 Okt rework, from the user's feedback:
  - SFX: the original whoosh/pop/tick library, then a musical palette, were rejected ("sounds like every AI video").
    Four alternatives were auditioned (`qa/sfx-demo-a…d.mp3`, `qa/sfx-compare.md`); the user picked **B with C**.
  - Outro: v2 "explained like a demo" → new recordings C/D + `POSITION.png`, generalized lines. v3 was rejected as far
    too fast (11 shots, zoom punches) → v3.1 calm (5 shots, real time) → v3.2 added Retail + Drivers and the new
    POSITION source → v3.3 the same edit at ≈ 1,5× with shorter lines (user's request). Full log:
    `docs/outro-recordings.md`.
  - Music: the user asked for something "like Veritasium" → an original score composed in code, scored to the story.
  - Post caption rewritten for reach (hook, search words, comment vote, save prompt).
- Pending user requests: a female narrator option later; licensed music tracks are optional (the user may supply them).
