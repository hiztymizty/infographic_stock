import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {useTiming} from './timing';

/**
 * The live SFX library in public/sfx (scripts/sfx_synth.py): palette B "Premium UI" as the base, with
 * palette C "Terminal" for numbers locking in, the decline, the 2026 crash, the shock beep and grid fills.
 * Uses and volumes: docs/style-guide.md → Sound. Older sounds (whoosh, pop, tick, ding…) and the other
 * palettes are still on disk but deliberately not in this type, so a scene can't pick them by accident.
 */
export type SfxName =
  | 'b-air' // scene change (shell), soft transition
  | 'b-rise' // big entrance, bar growing, outro feature change
  | 'b-tap' // chip, label, callout, pill
  | 'b-click' // UI click ripple in the outro
  | 'b-confirm' // success / peak reached
  | 'b-pay' // money landing
  | 'b-build' // build-up before a reveal or fall
  | 'b-dip' // small downward move (an arrow pointing down)
  | 'b-hit' // impact (≤ 3 per video, shared with c-crash)
  | 'b-mark' // logo / end card
  | 'c-lock' // a number or milestone locking in
  | 'c-fall' // a decline starting
  | 'c-crash' // the big crash landing (tape-stop)
  | 'c-alarm' // shock accent, paired with an impact
  | 'c-chatter-1'
  | 'c-chatter-2'
  | 'c-chatter-3'
  | 'c-chatter-4' // grid / counter fill steps: cycle through 1-4
  // Tutorial palettes T1-T4 (long-form only; picked per episode in core/tutorial/sfxPalettes.ts)
  | `t${1 | 2 | 3 | 4}-${'click' | 'ring' | 'chapter' | 'logo' | 'pill'}`;

/** One sound effect at a frame relative to the enclosing Sequence (usually the scene). */
export const Sfx: React.FC<{name: SfxName; at?: number; volume?: number}> = ({name, at = 0, volume = 0.5}) => (
  <Sequence from={Math.round(at)} durationInFrames={60} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Every voiceover take (or, for older timings, every line) at its place on the master timeline. */
export const VoiceTrack: React.FC = () => {
  const {voice, lines} = useTiming();
  const clips = voice?.length ? voice : lines;
  return (
    <>
      {clips
        .filter((c) => c.audio)
        .map((c) => (
          <Sequence key={c.id} from={c.from} durationInFrames={c.dur + 20} layout="none" name={`vo:${c.id}`}>
            <Audio src={staticFile(c.audio!)} volume={1} />
          </Sequence>
        ))}
    </>
  );
};

/**
 * Looping music bed from public/music, ducked under the voice and faded at both ends.
 * `level` is the bed volume with no voice; it drops to level × 0.35 under voiceover.
 */
export const MusicBed: React.FC<{src: string; level?: number}> = ({src, level = 0.16}) => {
  const {lines, totalFrames} = useTiming();
  const voiced = (f: number) => lines.some((l) => f >= l.from - 6 && f <= l.from + l.dur + 6);
  return (
    <Audio
      src={staticFile(src)}
      loop
      volume={(f) => {
        // Smooth the duck by averaging the voiced state over a short window.
        let on = 0;
        for (let k = -8; k <= 8; k += 2) on += voiced(f + k) ? 1 : 0;
        const duck = 1 - 0.65 * (on / 9);
        const fade = interpolate(f, [0, 20, totalFrames - 45, totalFrames], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return level * duck * fade;
      }}
    />
  );
};
