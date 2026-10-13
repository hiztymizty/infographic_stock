# SFX audition · musical palette (proposal, not wired in yet)

Files: `sfx-audition.mp3` (and `.wav`). Every sound plays twice, about 1 s apart, in the order below.
Each is played at its proposed default `<Sfx volume>`; the whole file then gets one gain (x3.12) so the
relative levels are exactly as they would sit in a video. `sfx-demo.mp3` puts them in context over the ep01 voice.
Regenerate: `python -I scripts/sfx_synth.py --palette` then `python -I scripts/sfx_audition.py ep01-ihsg-dca`.

Key: **D major pentatonic** (D E F# A B). Dark cues borrow D minor (F) and a sour Eb/Ab, but all land on D.

| # | Time (1st / 2nd) | Sound | Replaces (slot) | Volume | What it is |
|---|---|---|---|---|---|
| 1 | 0:00.5 / 0:02.3 | `bloom` | whoosh-soft · scene change (shell) | 0.3 | Soft open D chord swelling in like a reversed bell; peaks ~5 frames in. |
| 2 | 0:04.1 / 0:06.2 | `swell` | whoosh · big entrance / bars growing / clip change | 0.4 | Rolled reversed-glass D add9 rising into a mallet D5 + felt low D; peaks ~7 frames in. |
| 3 | 0:08.3 / 0:09.8 | `pluck` | pop · chips, labels, callouts | 0.35 | Soft marimba A4 with a wooden body. |
| 4 | 0:11.4 / 0:13.0 | `pluck-low` | pop · (variant) heavier label / question | 0.35 | Soft marimba D4, the home note. |
| 5 | 0:14.6 / 0:16.1 | `pluck-high` | pop · (variant) light chip / pill | 0.35 | Soft marimba D5, a bit lighter. |
| 6 | 0:17.6 / 0:20.3 | `step-run` | tick · counter / grid fill (step-1..step-8) | 0.18 | Kalimba run A4 B4 D5 E5 F#5 A5 B5 D6, one note per fill step (5 frames apart here). |
| 7 | 0:22.9 / 0:25.4 | `chime` | ding · milestone reached | 0.3 | Glass bells A5 → D6 (rising fourth) over a soft D5: the Hakabot motif. |
| 8 | 0:27.9 / 0:29.4 | `glint` | coin · money landing | 0.25 | Tiny two-note glass sparkle D6 → A6. |
| 9 | 0:30.8 / 0:33.3 | `ascend` | riser · build-up before a reveal | 0.25 | Accelerating pentatonic kalimba arpeggio over a pad whose filter opens; stops on A, unresolved. |
| 10 | 0:35.8 / 0:37.8 | `descend` | swoosh-down · a decline starting | 0.25 | Falling D-minor mallet figure A4 F4 D4 A3, each note sagging in pitch. |
| 11 | 0:39.8 / 0:41.8 | `sink` | drop · the fall itself | 0.3 | Low D-minor chord on a tape slowing to a stop. |
| 12 | 0:43.7 / 0:46.3 | `thud` | impact · the crash lands (max 3 per video) | 0.45 | Felt low-D doom (sub glide + D1) with a dark D/F mallet cluster and a soft noise bloom. |
| 13 | 0:48.9 / 0:50.5 | `sour` | glitch · shock accent, paired with the crash | 0.3 | Detuned, wobbling D/Eb/Ab glass cluster (minor second + tritone). |
| 14 | 0:52.0 / 0:54.6 | `thud+sour` | impact + glitch · the pair as Journey fires it | 0.45 | thud at 0.45 with sour at 0.3 on the same frame. |
| 15 | 0:57.2 / 0:59.8 | `bell-bloom` | shimmer · peak reveal | 0.4 | Rolled D add9 glass chord up the scale (D5 F#5 A5 E6), bright body front-loaded. |
| 16 | 1:02.4 / 1:05.3 | `signature` | shimmer (+ pop) · logo / end card | 0.4 | Hakabot sonic logo: A4 → D5 mallet+glass motif landing on a warm D add9 chord with a felt D2. |

## sfx-demo.mp3 (in context, voice from the real ep01 takes)

**Rules (DCA grid fill)** · starts 0.0 s

-   0.0 s · `bloom` @ 0.3 · scene change
-   0.3 s · `pluck` @ 0.35 · first chip
-   1.0 s · `step-1` @ 0.18 · grid fill
-   2.5 s · `step-2` @ 0.18 · grid fill
-   4.0 s · `step-3` @ 0.18 · grid fill
-   5.5 s · `step-4` @ 0.18 · grid fill
-   6.9 s · `step-5` @ 0.18 · grid fill
-   8.4 s · `step-6` @ 0.18 · grid fill
-   8.5 s · `pluck-high` @ 0.35 · second chip
-   9.9 s · `step-7` @ 0.18 · grid fill
-  11.4 s · `step-8` @ 0.18 · grid fill
-  12.8 s · `chime` @ 0.3 · total lands on the spoken amount

**Twist (the 2026 drop)** · starts 15.0 s

-  15.0 s · `bloom` @ 0.3 · scene change
-  15.2 s · `pluck` @ 0.35 · peak card
-  16.9 s · `descend` @ 0.25 · arrow draws (under "Rp 1,6 miliar")
-  18.0 s · `sink` @ 0.3 · value falls ("Juni")
-  19.7 s · `thud` @ 0.45 · crash lands
-  19.7 s · `sour` @ 0.3 · shock accent (pair demo; Twist has no glitch today)

**No voice: entrance, build-up, peak reveal, money, end card** · starts 24.9 s

-  24.9 s · `bloom` @ 0.3 · scene change
-  25.3 s · `swell` @ 0.4 · big entrance
-  26.4 s · `ascend` @ 0.25 · build-up
-  27.9 s · `bell-bloom` @ 0.4 · peak reveal
-  29.0 s · `glint` @ 0.25 · money lands
-  29.9 s · `glint` @ 0.22 · money lands again
-  31.4 s · `signature` @ 0.4 · end card / logo

Voice at its mastered -16 LUFS and SFX at the listed volumes: the mix before the render's final
linear gain to -14 LUFS, so the balance you hear is the balance in the video.
