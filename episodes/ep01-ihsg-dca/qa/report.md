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
