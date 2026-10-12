import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {useTiming} from './timing';

/** Names of the synthesized library in public/sfx (scripts/sfx_synth.py). */
export type SfxName =
  | 'whoosh'
  | 'whoosh-soft'
  | 'swoosh-down'
  | 'pop'
  | 'tick'
  | 'impact'
  | 'riser'
  | 'ding'
  | 'drop'
  | 'coin'
  | 'glitch'
  | 'shimmer';

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
