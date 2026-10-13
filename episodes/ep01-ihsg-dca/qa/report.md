# QA · ep01-ihsg-dca · FAIL · 10 Okt 2026 (round 1)

**Audited:** the existing `out/final.mp4` (00:06) and `out/clean.mp4` (00:16): 3202 frames, 1080×1920, 30 fps, 106,8 s.
Not re-rendered, per the brief. Stills rendered from current source match frames from final.mp4 within compression noise.
**Evidence:** `qa/contact.jpg` (every 2 s), `qa/final-t<sec>s.jpg` (32 frames from final.mp4), `qa/clean-t{6.5,54.5,90.5,104.0}s.jpg`,
`qa/still-t{0,43.5,69.0,94.4,103.5}s.jpg`. Other files in `qa/` come from earlier timing.

| # | Check | Result | Evidence | Fix → owner |
|---|---|---|---|---|
| 1 | Fresh render | PASS | The render matches the current source (still diff); 54-tile contact sheet reviewed | — |
| 2 | Numbers | FAIL (minor) | All key numbers match facts.md. (a) COVID callout "pertama kali minus" is false: Feb 2010 was −0,88%, and the VO says "sempat minus". (b) Kicker "EKSPERIMEN 16 TAHUN" is typed by hand, not in facts.md | copy.ts → motion-designer; facts.md → data-analyst |
| 3 | Language | PASS | Captions match the approved display text; casual tone; formats per guide. Notes: disclaimer opens "Hanya…" (guide: cuma/aja); caption chunk 38 is a lone "keluar." (88,7–89,4 s) | optional |
| 4 | Brand | PASS | Watermark 0–93,9 s then fades; all 3 outro clips play; end card with hakabot.com + 7 chips; blur covers ticker, company and account name at full resolution; clips 2–3 never show the nav bar | — |
| 5 | Compliance | PASS | Disclaimer, source, as-of date on screen; no buy/sell call. Disclaimer is faint (C.mute ≈ 4,1:1) | optional: C.dim → motion-designer |
| 6 | Layout | FAIL (minor) | 20 px text: Rules month initials (`Rules.tsx:65`), outro URL bar (`HakabotOutro.tsx:160`) | 22 px → motion-designer |
| 7 | Timing | user call | Mechanics pass, no PREVIEW badge. Length 106,8 s vs 60–90 s target (user approved ~101 s) | Gate 3 |
| 8 | Audio | FAIL | −14,0 LUFS / −1,3 dBTP, SFX never beat the voice. Three 1,5 s lines sit 3,6–4,9 LU under the rest: outro-3 (CTA) −18,7, j-keep −18,3, hook-2 −17,4 vs median −13,8 | re-master with limiter → voice-producer; shimmer back to ~0,4 → sound-designer |
| 9 | Deliverables | FAIL | captions.srt stale (written before the timing change): cues from 63,4 s on are 0,40 s early. post.md: stale PREVIEW sentence, "saja"→"aja" | `npm run srt` → producer; post.md → social-copywriter |

## Needs the user's ears / decision
1. Length 106,8 s vs the approved ~101 s estimate.
2. After the re-master: are hook-2, j-keep and outro-3 level with the rest and not squashed?
3. "Cobain Hakabot" at ~98,6 s: STT heard "HKBot". Confirm the brand name is clear.
4. result-2 "Cuan" at ~79,9 s: one natural word?
5. ~1,9 s of silence on the end card until music arrives.

## Fix log (producer, round 1 → 2)
- Voice re-mastered with the limiter (`npm run vo`, 0 characters billed); per-line loudness re-measured.
- copy.ts: "sempat minus"; kicker years derived from the data; disclaimer "Cuma harga indeks…" in C.dim.
- 22 px minimum: Rules month initials, outro URL bar.
- Caption chunker merges a lone trailing word into the previous chunk (fixes "keluar.").
- facts.md: ret_2020_03 display text, experiment length row.
- Outro shimmer 0,2 → 0,4.
- post.md cleanup.
- Re-render final + clean, then `npm run srt`, then QA round 2.

---

# QA · ep01-ihsg-dca · PASS · 10 Okt 2026 (round 2)

**Audited:** the new `out/final.mp4` (01:10), `out/clean.mp4` (01:19), `out/captions.srt` (01:19) and `out/post.md`: 106,73 s, 3202 frames.
Evidence: `qa/contact.jpg` (round 2, every 2 s), `qa/r2-final-t<sec>s.jpg` (34 frames), `qa/r2-clean-t{44.00,104.00}s.jpg`, `qa/still-t{0,16,44,92}s.jpg`.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Fresh render | PASS | Postdates all source; stills match frames within compression noise; no regressions on the contact sheet |
| 2 | Numbers | PASS | "sempat minus"; kicker 16 TAHUN derived (floor 202/12); all key numbers match facts.md |
| 3 | Language | PASS | "Cuma harga indeks…"; no single-word caption cards; no formal words |
| 4 | Brand | PASS | Watermark 0–93,7 s; 3 outro clips; end card 103,03 s to the end; blur intact |
| 5 | Compliance | PASS | Disclaimer in C.dim (≈ 8,6:1); source, as-of date and "Bukan rekomendasi investasi" present |
| 6 | Layout | PASS | Nothing under 22 px; no overflow; caption zone clear |
| 7 | Timing | PASS (length: user call) | Not estimated; sell-off callout holds 2,0 s; end card 3,7 s; 106,7 s vs 60–90 s target |
| 8 | Audio | PASS | −14,0 LUFS / −1,3 dBTP; every line within −1,2…+0,5 LU of the median (−13,9); SFX ≥ 5 LU under the voice; shimmer ~11 LU under the CTA |
| 9 | Deliverables | PASS | SRT frame-exact (45 cues) and equal to the burned-in captions; clean.mp4 has no captions; post.md clean; cover 69,0 s confirmed |

Optional (non-blocking): render.mjs final loudnorm fell back to dynamic mode, so the first ~3 s play ~1,2 dB lower (fixed in the tool for future renders); twist bottom card shows its start state ~1 s before the count-down; facts.md caveat said "Hanya" (fixed).
Needs the user's ears: limiter-lifted lines (hook-2 5,8 s, j-keep 40,0 s, outro-3 103,2 s); "Cobain Hakabot" ~98,6 s; "Cuan" ~79,9 s; 2 s of end-card silence until music arrives; the length.

---

# QA · ep01-ihsg-dca · PASS · 13 Okt 2026 (round 3, "rework 13 Okt")

**Audited:** `out/final.mp4` + `out/clean.mp4` (112,213 s, 3366 frames, 1080×1920, 30 fps), `out/captions.srt` (51 cues),
`out/post.md`, timing.json (real), vo-check 0/14. Not re-rendered (no source newer than the render).
Evidence in `qa/`: `contact.jpg`, `r3-outro-sheet.jpg` (0,4 s), 27 × `r3-final-t<sec>s.jpg`, `r3-clean-t72.0s.jpg`,
`r3-blur-{network,presets,cards}-2x.jpg`, `r3-indikator-pacing.jpg`, `r3-position-still.jpg`.

| # | Check | Result | Evidence | Fix → owner |
|---|---|---|---|---|
| 1 | Fresh render | PASS | 57-tile + 52-tile sheets, full-size frames at every key number and outro shot | — |
| 2 | Numbers | PASS | All on-screen numbers match facts.md; "IHSG −35% dalam 6 bulan" = ihsg_fall_6m, lands on "anjlok" (64,2–64,5 s); 51/51 captions match Rounded forms | "6 bulan" typed in copy.ts → derive from data (motion-designer, optional) |
| 3 | Language | PASS | Natural casual Bahasa, DCA spelled out, no formal words | "Uptrend Fase 2" unexplained in footage (user's call) |
| 4 | Brand + blur | PASS | Watermark 0–91,8 s; 4 groups; end card ≈ 3,5 s, 8 chips; all blur boxes hold at 1× and 2× | — |
| 5 | Compliance | PASS | Disclaimer, source, as-of date, caveats on screen; no buy/sell call | — |
| 6 | Layout | PASS | Nothing < 22 px; no overflow | P/L column ~20 px into the button strip; P/L ring clipped ~0,2 s at 101,2 s (motion-designer, optional) |
| 7 | Timing | PASS (length = user call) | Not estimated; SRT = timing 51/51 within 20 ms; 112,2 s | "kapan kamu jual." lingers 0,3 s into the outro (cosmetic) |
| 8 | Audio | PASS | −14,8 LUFS / −1,5 dBTP (gain capped by one peak at 46,55 s: "Maret" + b-hit + c-alarm); takes −16,1…−17,0; voice over SFX median 30 dB; "anjlok" closest call (c-crash 1–4 kHz ~4 dB above voice for ~100 ms) | b-hit at covidAt 0,45 → 0,40; consider c-crash 0,45 → 0,38 or delay its static (sound-designer, optional) |
| 9 | Deliverables | PASS | final, clean, srt, post.md present | Cover 72,0 s (f2160), backup 64,8 s (f1944) → post.md |

Gate 3 listening/watch list: "Hakabot" ~92,1 s; "anjlok" ~64,2–64,8 s; Indikator beat at 1,4–1,5× (Bandar line ~0,5 s,
Retail ~0,8 s); POSITION still broker codes ~0,4 s + double exposure at 100,2 s; loudness −14,8.
Stale docs: hakabot.md says lines are DRAFT / 21,5 s / shot count; outro-recordings.md v3.3 header "not approved".

## Fix log (producer, round 3 → 4)
- Producer: qa/report.md saved; docs/hakabot.md status/length/shot count; outro-recordings.md v3.3 header; post.md cover times.
- Music score being added (user request, 13 Okt) → full re-render + audio re-check needed (round 4).
- Optional fixes folded into the music re-render: b-hit −1 dB, c-crash under "anjlok", "6 bulan" derived, P/L ring timing.

---

# QA · ep01-ihsg-dca · FAIL · 13 Okt 2026 (round 4, music + fixes re-render)

**Audited:** final.mp4 (17:44), clean.mp4 (17:48), captions.srt (51 cues), post.md, ep01-score.wav. Stems separated
(voice from takes, music × MusicBed curve, SFX = residual; fit gains 0,977 / 0,966).
Evidence: `qa/contact.jpg`, `r4-position-*.jpg`, `r4-outro-blur.jpg`, `r4-keys-64.8-72.0-47.5.jpg`.

| # | Check | Result | Evidence / fix |
|---|---|---|---|
| 1 | Regressions | PASS | Fresh contact sheet = round 3 tile for tile |
| 2 | Numbers | PASS | "6 bulan" derived; text identical at 64,8 / 72,0 s |
| 3 | Language | PASS | No copy changes |
| 4 | Brand + blur | PASS | All outro blur boxes hold at full size |
| 5 | Compliance | PASS | Unchanged |
| 6 | Layout + outro pacing | **FAIL** | POSITION still pan is a whip-pan: 705 → 1300 px in ~0,8 s (100,5–101,3 s), ~1.500 px/s, mblur on 5 frames, 1–2 px back-step at 101,30 s. Breaks "one slow eased move". Ring timing, x ≤ 980 and the 4-frame crossfade are fine. → motion-designer |
| 7 | Timing / SRT | PASS | 51/51 within 20 ms; 112,2 s (user call) |
| 8 | Audio | PASS | −14,1 LUFS / −1,6 dBTP, LRA 2,9; music 24 dB under voice (31,8 dB in 1–4 kHz); "Maret" voice +22–25 dB over SFX in 1–4 kHz; "anjlok" in silence, voice +11–12 dB over c-crash; chatter reads; end card clean. Non-blocking: one-sample step in the score at 62,133 s (and 0,02 at 67,10 s) → declick (sound-designer) |
| 9 | Deliverables | PASS | Cover 72,0 s / backup 64,8 s still right |

## Fix log (producer, round 4 → 5)
- position-still pan slowed (≥ 1,2 s, no mblur, ring after the move, column ≤ x 980) → motion-designer.
- Score declicked at 62,133 s and 67,10 s, rebuilt → sound-designer.
- Re-render final + clean; round 5 = POSITION frame by frame, loudness, regression contact sheet.

---

# QA · ep01-ihsg-dca · FAIL · 13 Okt 2026 (round 5, POSITION pan + declick)

All checks PASS except 6b. Pan 100,30–101,33 s eased, top speed 24 px/frame (round 4: 51), no motion blur, no reversal,
codes readable, right edge x 969. Score click at 62,133 s fixed (jump 0,193 → 0,022); 67,10 s is a designed tick, not a
splice. Loudness −14,0 LUFS / −1,5 dBTP both files; SRT 51/51 unchanged; no regressions on the fresh contact sheet.

| # | Check | Result | Fix |
|---|---|---|---|
| 6b | P/L ring | FAIL | Solid only ~0,45 s (101,50–101,95 s), after the voice ends; reads as a blink (rule: highlight ≥ 1,2 s) → drop it |

## Fix log (producer, round 5 → 6)
- Removed the ring `marks` from `position-still` (outroConfig.ts). Re-render final + clean; round 6 = 100,0–102,1 s
  frame by frame + loudness.

---

# QA · ep01-ihsg-dca · PASS · 13 Okt 2026 (round 6, producer check of the ring removal)

Scope as agreed in round 5: frames 100,25 / 100,8 / 101,4 / 101,6 / 101,9 / 102,05 s of the new `final.mp4` show the
POSITION still with no ring, the same calm pan (codes → P/L), and a clean crossfade into Komposisi. Loudness: final and
clean −14,0 LUFS, −1,5 dBTP (render log). Nothing else changed since round 5 (one `marks` line in outroConfig.ts).
Fresh contact sheet: `qa/contact.jpg` (every 3 s). Verdict: **PASS**. Ready for Gate 3.
