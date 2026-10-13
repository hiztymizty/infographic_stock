# SFX comparison · round 2 (four alternative palettes, not wired in yet)

Every palette fills the same 12 slots and every demo has the same structure and timings, so the files compare 1:1:
Rules over the real voice (grid fill) · Twist over the real voice (the 2026 drop) · a no-voice run (entrance, build-up,
reveal, money) · a short outro (transition, two UI clicks, transition, end card, "Cek di hakabot.com").
Voice at its mastered -16 LUFS, SFX at the listed `<Sfx volume>`; that is the balance a video would have.
Each sound is loudness-matched to the slot it fills (max momentary loudness of the old sound in that slot).
Rebuild: `python -I scripts/sfx_synth.py --alts` then `python -I scripts/sfx_audition.py ep01-ihsg-dca --compare`.

## A · Desk (tactile / physical)  (`qa/sfx-demo-a.mp3`)

Real objects on a wooden desk, close-miked and nearly dry: a mouse switch, a pen tap, paper sliding, a card flicked down, a rubber stamp, coins set on wood.

| Slot (replaces) | Sound | Length | Energy in 1-4 kHz |
|---|---|---|---|
| transition (whoosh-soft) | `a-slide` | 0.50 s | 59% |
| entrance (whoosh) | `a-flick` | 0.60 s | 11% |
| label (pop) | `a-tap` | 0.30 s | 11% |
| step (tick) | `a-tick` | 0.08 s | 74% |
| milestone (ding) | `a-stamp` | 0.55 s | 1% |
| money (coin) | `a-coins` | 0.60 s | 66% |
| buildup (riser) | `a-wind` | 1.50 s | 74% |
| decline (drop / swoosh-down) | `a-slump` | 0.90 s | 76% |
| crash (impact) | `a-drop` | 1.30 s | 0% |
| shock (glitch) | `a-rattle` | 0.45 s | 82% |
| logo (shimmer on the end card) | `a-close` | 0.90 s | 1% |
| click (pop on outro click ripples) | `a-click` | 0.20 s | 49% |

Cue list:

**Rules (DCA grid fill)** · starts 0.0 s

-   0.0 s · `a-slide` (transition) @ 0.3 · scene change
-   0.3 s · `a-tap` (label) @ 0.35 · first chip
-   1.0 s · `a-tick` (step) @ 0.18 · grid fill 1/8
-   2.5 s · `a-tick` (step) @ 0.18 · grid fill 2/8
-   4.0 s · `a-tick` (step) @ 0.18 · grid fill 3/8
-   5.5 s · `a-tick` (step) @ 0.18 · grid fill 4/8
-   6.9 s · `a-tick` (step) @ 0.18 · grid fill 5/8
-   8.4 s · `a-tick` (step) @ 0.18 · grid fill 6/8
-   8.5 s · `a-tap` (label) @ 0.35 · second chip
-   9.9 s · `a-tick` (step) @ 0.18 · grid fill 7/8
-  11.4 s · `a-tick` (step) @ 0.18 · grid fill 8/8
-  12.8 s · `a-stamp` (milestone) @ 0.3 · total lands on the spoken amount

**Twist (the 2026 drop)** · starts 15.0 s

-  15.0 s · `a-slide` (transition) @ 0.3 · scene change
-  15.2 s · `a-tap` (label) @ 0.35 · peak card
-  18.0 s · `a-slump` (decline) @ 0.3 · value starts falling ("Juni")
-  19.7 s · `a-drop` (crash) @ 0.45 · crash lands
-  19.7 s · `a-rattle` (shock) @ 0.3 · shock accent with the crash

**No voice: entrance, build-up, reveal, money** · starts 24.9 s

-  24.9 s · `a-slide` (transition) @ 0.3 · scene change
-  25.3 s · `a-flick` (entrance) @ 0.4 · big entrance
-  26.4 s · `a-wind` (buildup) @ 0.25 · build-up (1.5 s)
-  27.9 s · `a-stamp` (milestone) @ 0.3 · reveal / milestone
-  29.0 s · `a-coins` (money) @ 0.25 · money lands
-  29.9 s · `a-coins` (money) @ 0.22 · money lands again

**Outro: transition, two UI clicks, transition, end card** · starts 32.1 s

-  32.1 s · `a-slide` (transition) @ 0.3 · outro starts
-  33.6 s · `a-click` (click) @ 0.32 · UI click ripple
-  34.8 s · `a-click` (click) @ 0.32 · UI click ripple
-  37.6 s · `a-slide` (transition) @ 0.3 · back to the end card
-  38.0 s · `a-close` (logo) @ 0.4 · end card / logo

Listen for:

- Whether the paper slide (`a-slide`) reads as a transition or as noise: it is the most speech-band-heavy transition of the four.
- `a-stamp` on the milestone ('approved!') and `a-close` (a notebook shut) on the end card: do they feel like a brand or like foley?
- `a-slump` (paper dragging down) sits under "Juni" in the Twist; it is mostly 1-4 kHz, so in a real cut it would go to ~0.2.

## B · Premium UI (minimal fintech)  (`qa/sfx-demo-b.mp3`)

Restraint: very short crisp taps, haptic-like low thumps you feel more than hear, one subtle air puff for transitions, two soft sine pings for success.

| Slot (replaces) | Sound | Length | Energy in 1-4 kHz |
|---|---|---|---|
| transition (whoosh-soft) | `b-air` | 0.38 s | 49% |
| entrance (whoosh) | `b-rise` | 0.60 s | 11% |
| label (pop) | `b-tap` | 0.15 s | 12% |
| step (tick) | `b-tick` | 0.04 s | 91% |
| milestone (ding) | `b-confirm` | 0.60 s | 51% |
| money (coin) | `b-pay` | 0.30 s | 77% |
| buildup (riser) | `b-build` | 1.50 s | 7% |
| decline (drop / swoosh-down) | `b-dip` | 0.50 s | 0% |
| crash (impact) | `b-hit` | 0.80 s | 0% |
| shock (glitch) | `b-buzz` | 0.25 s | 0% |
| logo (shimmer on the end card) | `b-mark` | 0.80 s | 50% |
| click (pop on outro click ripples) | `b-click` | 0.06 s | 73% |

Cue list:

**Rules (DCA grid fill)** · starts 0.0 s

-   0.0 s · `b-air` (transition) @ 0.3 · scene change
-   0.3 s · `b-tap` (label) @ 0.35 · first chip
-   1.0 s · `b-tick` (step) @ 0.18 · grid fill 1/8
-   2.5 s · `b-tick` (step) @ 0.18 · grid fill 2/8
-   4.0 s · `b-tick` (step) @ 0.18 · grid fill 3/8
-   5.5 s · `b-tick` (step) @ 0.18 · grid fill 4/8
-   6.9 s · `b-tick` (step) @ 0.18 · grid fill 5/8
-   8.4 s · `b-tick` (step) @ 0.18 · grid fill 6/8
-   8.5 s · `b-tap` (label) @ 0.35 · second chip
-   9.9 s · `b-tick` (step) @ 0.18 · grid fill 7/8
-  11.4 s · `b-tick` (step) @ 0.18 · grid fill 8/8
-  12.8 s · `b-confirm` (milestone) @ 0.3 · total lands on the spoken amount

**Twist (the 2026 drop)** · starts 15.0 s

-  15.0 s · `b-air` (transition) @ 0.3 · scene change
-  15.2 s · `b-tap` (label) @ 0.35 · peak card
-  18.0 s · `b-dip` (decline) @ 0.3 · value starts falling ("Juni")
-  19.7 s · `b-hit` (crash) @ 0.45 · crash lands
-  19.7 s · `b-buzz` (shock) @ 0.3 · shock accent with the crash

**No voice: entrance, build-up, reveal, money** · starts 24.9 s

-  24.9 s · `b-air` (transition) @ 0.3 · scene change
-  25.3 s · `b-rise` (entrance) @ 0.4 · big entrance
-  26.4 s · `b-build` (buildup) @ 0.25 · build-up (1.5 s)
-  27.9 s · `b-confirm` (milestone) @ 0.3 · reveal / milestone
-  29.0 s · `b-pay` (money) @ 0.25 · money lands
-  29.9 s · `b-pay` (money) @ 0.22 · money lands again

**Outro: transition, two UI clicks, transition, end card** · starts 32.1 s

-  32.1 s · `b-air` (transition) @ 0.3 · outro starts
-  33.6 s · `b-click` (click) @ 0.32 · UI click ripple
-  34.8 s · `b-click` (click) @ 0.32 · UI click ripple
-  37.6 s · `b-air` (transition) @ 0.3 · back to the end card
-  38.0 s · `b-mark` (logo) @ 0.4 · end card / logo

Listen for:

- Is it too quiet / too polite for TikTok? The haptic thumps (`b-hit`, `b-buzz`, the pulses in `b-build`) are 50-170 Hz and thin out on phone speakers.
- `b-air` is still a (very short, soft) air movement: check it doesn't read as the generic whoosh.
- `b-confirm` / `b-pay` are the closest to 'app notification' sounds: good if that's the vibe, bad if it reminds you of a specific app.

## C · Terminal (trading desk)  (`qa/sfx-demo-c.mp3`)

A Bloomberg-style terminal: square-wave blips, relay clicks, short data chatter on counters, a low lock-in on numbers, a tape-stopped drone for the crash.

| Slot (replaces) | Sound | Length | Energy in 1-4 kHz |
|---|---|---|---|
| transition (whoosh-soft) | `c-scan` | 0.40 s | 58% |
| entrance (whoosh) | `c-boot` | 0.70 s | 3% |
| label (pop) | `c-blip` | 0.12 s | 25% |
| step (tick) | `c-chatter` | 0.12 s | 28% |
| milestone (ding) | `c-lock` | 0.45 s | 7% |
| money (coin) | `c-cash` | 0.25 s | 59% |
| buildup (riser) | `c-charge` | 1.50 s | 11% |
| decline (drop / swoosh-down) | `c-fall` | 0.95 s | 12% |
| crash (impact) | `c-crash` | 1.30 s | 1% |
| shock (glitch) | `c-alarm` | 0.25 s | 8% |
| logo (shimmer on the end card) | `c-logo` | 1.10 s | 5% |
| click (pop on outro click ripples) | `c-click` | 0.07 s | 74% |

Cue list:

**Rules (DCA grid fill)** · starts 0.0 s

-   0.0 s · `c-scan` (transition) @ 0.3 · scene change
-   0.3 s · `c-blip` (label) @ 0.35 · first chip
-   1.0 s · `c-chatter` (step) @ 0.18 · grid fill 1/8
-   2.5 s · `c-chatter` (step) @ 0.18 · grid fill 2/8
-   4.0 s · `c-chatter` (step) @ 0.18 · grid fill 3/8
-   5.5 s · `c-chatter` (step) @ 0.18 · grid fill 4/8
-   6.9 s · `c-chatter` (step) @ 0.18 · grid fill 5/8
-   8.4 s · `c-chatter` (step) @ 0.18 · grid fill 6/8
-   8.5 s · `c-blip` (label) @ 0.35 · second chip
-   9.9 s · `c-chatter` (step) @ 0.18 · grid fill 7/8
-  11.4 s · `c-chatter` (step) @ 0.18 · grid fill 8/8
-  12.8 s · `c-lock` (milestone) @ 0.3 · total lands on the spoken amount

**Twist (the 2026 drop)** · starts 15.0 s

-  15.0 s · `c-scan` (transition) @ 0.3 · scene change
-  15.2 s · `c-blip` (label) @ 0.35 · peak card
-  18.0 s · `c-fall` (decline) @ 0.3 · value starts falling ("Juni")
-  19.7 s · `c-crash` (crash) @ 0.45 · crash lands
-  19.7 s · `c-alarm` (shock) @ 0.3 · shock accent with the crash

**No voice: entrance, build-up, reveal, money** · starts 24.9 s

-  24.9 s · `c-scan` (transition) @ 0.3 · scene change
-  25.3 s · `c-boot` (entrance) @ 0.4 · big entrance
-  26.4 s · `c-charge` (buildup) @ 0.25 · build-up (1.5 s)
-  27.9 s · `c-lock` (milestone) @ 0.3 · reveal / milestone
-  29.0 s · `c-cash` (money) @ 0.25 · money lands
-  29.9 s · `c-cash` (money) @ 0.22 · money lands again

**Outro: transition, two UI clicks, transition, end card** · starts 32.1 s

-  32.1 s · `c-scan` (transition) @ 0.3 · outro starts
-  33.6 s · `c-click` (click) @ 0.32 · UI click ripple
-  34.8 s · `c-click` (click) @ 0.32 · UI click ripple
-  37.6 s · `c-scan` (transition) @ 0.3 · back to the end card
-  38.0 s · `c-logo` (logo) @ 0.4 · end card / logo

Listen for:

- Square waves can feel retro-game: check `c-blip` and `c-cash` read as 'terminal', not '8-bit'.
- `c-chatter` repeats the same burst on every grid step: varied enough, or does it machine-gun?
- `c-crash` = low hit + a short static burst + a drone that winds down (tape-stop): is it dramatic enough for the Covid / 2026 crashes?

## D · Tape (analog / lo-fi)  (`qa/sfx-demo-d.mp3`)

A cassette deck: button clunks for clicks, tape rewind for transitions, tape start / slow-down for entrances and declines, muffled e-piano chords, crackle and hiss.

| Slot (replaces) | Sound | Length | Energy in 1-4 kHz |
|---|---|---|---|
| transition (whoosh-soft) | `d-rewind` | 0.50 s | 68% |
| entrance (whoosh) | `d-clunk-in` | 0.90 s | 1% |
| label (pop) | `d-button` | 0.22 s | 14% |
| step (tick) | `d-tick` | 0.06 s | 98% |
| milestone (ding) | `d-chord` | 1.40 s | 1% |
| money (coin) | `d-register` | 0.90 s | 80% |
| buildup (riser) | `d-speedup` | 1.50 s | 0% |
| decline (drop / swoosh-down) | `d-slow` | 0.95 s | 0% |
| crash (impact) | `d-thump` | 1.10 s | 0% |
| shock (glitch) | `d-warble` | 0.45 s | 0% |
| logo (shimmer on the end card) | `d-outro` | 1.90 s | 1% |
| click (pop on outro click ripples) | `d-click` | 0.10 s | 16% |

Cue list:

**Rules (DCA grid fill)** · starts 0.0 s

-   0.0 s · `d-rewind` (transition) @ 0.3 · scene change
-   0.3 s · `d-button` (label) @ 0.35 · first chip
-   1.0 s · `d-tick` (step) @ 0.18 · grid fill 1/8
-   2.5 s · `d-tick` (step) @ 0.18 · grid fill 2/8
-   4.0 s · `d-tick` (step) @ 0.18 · grid fill 3/8
-   5.5 s · `d-tick` (step) @ 0.18 · grid fill 4/8
-   6.9 s · `d-tick` (step) @ 0.18 · grid fill 5/8
-   8.4 s · `d-tick` (step) @ 0.18 · grid fill 6/8
-   8.5 s · `d-button` (label) @ 0.35 · second chip
-   9.9 s · `d-tick` (step) @ 0.18 · grid fill 7/8
-  11.4 s · `d-tick` (step) @ 0.18 · grid fill 8/8
-  12.8 s · `d-chord` (milestone) @ 0.3 · total lands on the spoken amount

**Twist (the 2026 drop)** · starts 15.0 s

-  15.0 s · `d-rewind` (transition) @ 0.3 · scene change
-  15.2 s · `d-button` (label) @ 0.35 · peak card
-  18.0 s · `d-slow` (decline) @ 0.3 · value starts falling ("Juni")
-  19.7 s · `d-thump` (crash) @ 0.45 · crash lands
-  19.7 s · `d-warble` (shock) @ 0.3 · shock accent with the crash

**No voice: entrance, build-up, reveal, money** · starts 24.9 s

-  24.9 s · `d-rewind` (transition) @ 0.3 · scene change
-  25.3 s · `d-clunk-in` (entrance) @ 0.4 · big entrance
-  26.4 s · `d-speedup` (buildup) @ 0.25 · build-up (1.5 s)
-  27.9 s · `d-chord` (milestone) @ 0.3 · reveal / milestone
-  29.0 s · `d-register` (money) @ 0.25 · money lands
-  29.9 s · `d-register` (money) @ 0.22 · money lands again

**Outro: transition, two UI clicks, transition, end card** · starts 32.1 s

-  32.1 s · `d-rewind` (transition) @ 0.3 · outro starts
-  33.6 s · `d-click` (click) @ 0.32 · UI click ripple
-  34.8 s · `d-click` (click) @ 0.32 · UI click ripple
-  37.6 s · `d-rewind` (transition) @ 0.3 · back to the end card
-  38.0 s · `d-outro` (logo) @ 0.4 · end card / logo

Listen for:

- Hiss and crackle tails: charming or dirty under the voice? (`d-thump` and `d-outro` carry the most.)
- `d-chord` / `d-outro` are muffled Dmaj9 e-piano chords, lo-fi-beats style: still 'musical', so check it doesn't feel like round 1 again.
- `d-register` (crank, bell, drawer) is the busiest money cue: fun or too cartoon?

