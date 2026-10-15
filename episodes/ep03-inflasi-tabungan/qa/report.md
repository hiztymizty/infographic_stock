# QA · ep03-inflasi-tabungan · FAIL · 14 Okt 2026 (round 1)

**Audited:** `out/final.mp4` (12:15), `out/clean.mp4` (12:20), captions.srt (43 cues), post.md, timing.json (real, 93,35 s),
vo-check 0/12. Evidence: `qa/r1/` (full-res frames and crops), `qa/contact.jpg`.

| # | Check | Result | Evidence / fix |
|---|---|---|---|
| 1 | Fresh render | PASS | Renders newer than every input; no PREVIEW badge; clean has no captions |
| 2 | Numbers | PASS | All on-screen and caption numbers match facts.md; Rp 7,5 jt read from inflasi.json |
| 3a | Language | PASS | Casual, no formal words, formats per guide |
| 3b | Clarity | **FAIL** | BPS first appears unexplained on screen in the Shrink source tag (6–20 s); spelled out only at 62–66 s → copy.ts `T.shrink.source` (motion-designer) |
| 4 | Brand / blur | PASS | Watermark; v3.3 outro; blur intact at full res |
| 5 | Compliance | PASS | Disclaimer + sources ≈ 10,5 s on screen; no advice |
| 6a | Layout | PASS | Safe zones respected; min text 22 px; Bank scene one idea per state |
| 6b | Data-graphic sync | **FAIL** | Deposito counter lags the lit ticks by one during the 12/16 fill (Bank.tsx:102 floor vs `fill > i`) → motion-designer |
| 6c | Minor visuals | advisory | Ghost "belanjaan yang sama" at 13,4–14 s (bouncy spring); label cross-fade garble at 15 s; formula screen duplicates 3,00/3,28 %; footer "(BI)" → "(Bank Indonesia)" |
| 7 | Timing | PASS (length = user call) | 93,35 s |
| 8 | Audio | PASS (loudness noted) | −14,8 LUFS / −1,6 dBTP; capping peak 57,20 s = b-rise on "Saldonya"; others 64,70 / 46,45 / 62,20 s. Voice − music median 19,5 dB; reveal clean |
| 9 | Deliverables | PASS | final, clean, srt, post.md present; minor post wording notes |

## Fix log (producer, round 1 → 2)
- motion-designer: BPS spelled out at first on-screen use; Bank counter off-by-one; optional polish (ghost note, cross-fade, footer "(Bank Indonesia)").
- sound-designer: loudness lift (b-rise off "Saldonya", other three peaks ≤ −2,3 dBTP) toward −14,0 LUFS.
- producer: post.md wording ("Ada satu rumus simpel…", LPS-ceiling caveat in the TikTok caption); cover suggestion 19,5 s (shrink) as main.
- Then re-render final + clean, sheet, QA round 2 (fixes + loudness + regressions).

---

# QA · ep03-inflasi-tabungan · PASS · 14 Okt 2026 (round 2, producer check of the round-1 fixes)

New render final.mp4 / clean.mp4 (14 Okt ~13:00): **−14,0 LUFS, −1,7 dBTP** (b-rise moved to f4−10, score rebuilt).
Frames 10 / 13,8 / 15,0 / 30,0 / 57,2 / 70 s:
- "SUMBER: BADAN PUSAT STATISTIK (BPS)" on the Shrink screen from its first appearance ✓
- no ghost note behind the +90,3 % chip ✓; "UANGMU" → "DAYA BELI · 2010" no longer overlaps ✓
- deposito counter = lit green ticks (1/5/10 at 29,6/30,0/30,4 s; 12 at the end) ✓
- lesson footer "(Bank Indonesia)" ✓; formula and lesson unchanged otherwise
Timing, voice and numbers unchanged since round 1 (all PASS there). Fresh contact sheet `qa/contact.jpg`. Verdict: **PASS**.
