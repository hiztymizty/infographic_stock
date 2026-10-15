# tut01-hakabot-tutorial · Tutorial Hakabot (YouTube, 16:9, long-form)
Phase: 5 (silent edit v2) · Next: motion-designer rebuilds beats on New.mp4 with new intro + softer highlights → silent preview to user → voice (14.110 chars) → sound → QA
- [x] v2 Step 1 built 15 Okt: per-chapter beats/clips, 4K crops, new intro/end card, refined highlights; preview
      `qa/preview-0-169.mp4` (Intro→Watchlist, silent). intro-1 tailSec 1.2. Chapters stock / fund+idx / comp /
      scr+hb+akun now built in parallel by 4 motion-designers (each owns only its beats/<ch>.ts + clips/<ch>.json).
- [x] Gate 2 v2: user approved script v2 15 Okt ("Go ahead"); LQ45 spoken "El Kiu empat lima"; other pronunciations OK.
- 15 Okt: user liked edit/zoom/highlights; wants more elegant highlights and a redesigned (modern, less cluttered) intro;
  footage was blurry → NEW 4K recording `temp/New.mp4` (13:53, different order, new numbers, new features). Producer
  analyzed it → `shotlist-v2.md`. Old script + Phase A beats are superseded; edit system (`src/core/tutorial/`) is reused.
  Waiting for user answers before rewriting the script.
- [x] Phase A built 15 Okt (motion-designer): `src/core/tutorial/`, `src/episodes/tut01-hakabot-tutorial/beats.ts`,
      `scripts/tutorial_clips.py`; preview `qa/preview-0-209.4.mp4` (3:29, silent). Producer sent 2 fixes (watch-4b framing
      hides BREN; chapter pill overlaps nav bar). Waiting for user feedback on zoom/highlight/chapter-card style.
      Later chapters are placeholders. Render ≈ 1,2× real time → full 18:30 ≈ 25–35 min per variant.
- [x] Gate 2: user approved the script 14 Okt ("go ahead and proceed"), asked for a silent cut first.
- Script written 14 Okt (scriptwriter); producer fixed UI wording against the footage (New list box, × to delete,
  pencil to rename, donut is right of the network, Local/Foreign tabs with real category names).
- [x] Brief (14 Okt): user asked for a full how-to-use tutorial from their screen recordings in `temp/`
      (`2026-10-14 11-19-35.mp4` 22:14 main, `11-42-10.mp4` 1:19 HB Center, `21-49-53.mp4` 0:20 PEP re-record)
      and their guide `temp/script.txt`. YouTube only; length doesn't matter (user wants viewers to fully understand).
- [x] Footage reviewed end to end by the producer → `shotlist.md` (beats, source times, what to explain)
- [ ] Script · Gate 2 approved
- [ ] Voiceover · <n> chars billed · vo-check clean
- [ ] Edit (Remotion 1920×1080: trims, zooms, highlights, chapter cards) · Sound · QA
- [ ] Rendered · Gate 3 reviewed
Notes:
- User decisions 14 Okt: ElevenLabs voice (Pratama, Bahasa); keep tickers, companies and individual names readable
  (hide only account names, browser tabs, taskbar, OBS window); show HB Center live/active signals in full; one long
  video with YouTube chapters.
- Not a short: 16:9, no 9:16 safe zones, no EpisodeShell; its own composition. Voice/timing pipeline is reused.
- Remotion mis-seeks long 1080p clips: cut the sources into short clips (≤ ~16 s, short GOP) before editing.
- User 14 Okt: script "looks good"; right-square reading correct; NO 20 s outro (end card only); 18 min OK; TEBE said
  "Tebe"; SM Local spoken "Smart Money Local". New clip A (Acc/Dist tooltips) added as scene watch-4b.
- Raw files live in `temp/` (not in git). Don't delete them.
- User 15 Okt (v2 decisions): include Float Composition; Akun page: blur email AND referral code; keep recording order
  (Akun last); review new intro + highlight style in the silent preview. Old script saved as script-v1-old.json/.md.
