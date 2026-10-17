import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {MusicBed, Sfx, VoiceTrack} from '../audio';
import {CLAMP} from '../components/ui';
import {C, MONO, SANS} from '../theme';
import {SceneProvider, TimingProvider, useScene, useTiming} from '../timing';
import {WIN, XF} from './layout';
import {Backdrop, ChapterOverlay, PreviewBadge, Subtitles} from './Overlays';
import {ease} from './plan';
import {FootageBeatView, TutorialCtx} from './ScreenShot';
import {tutPalette} from './sfxPalettes';
import type {Beat, TutorialDef} from './types';

/** Stand-in for scenes not edited yet: scene id + its voice lines, so the full timeline can still be reviewed. */
const Placeholder: React.FC = () => {
  const scene = useScene();
  const {lines} = useTiming();
  const mine = lines.filter((l) => l.scene === scene.id);
  return (
    <AbsoluteFill style={{background: '#121826', padding: 90, gap: 26}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: C.mute}}>BELUM DIEDIT · {scene.id}</div>
      {mine.map((l) => (
        <div key={l.id} style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, lineHeight: 1.35, color: C.dim, maxWidth: 1500}}>
          {l.display}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const BeatView: React.FC<{beat: Beat | undefined}> = ({beat}) => {
  if (!beat) return <Placeholder />;
  if (beat.kind === 'custom') {
    const Comp = beat.component;
    return <Comp />;
  }
  return <FootageBeatView beat={beat} />;
};

/** Fades a beat in over the previous one (unless it continues it with `enter: 'cut'`), and out at `outAt`. */
const Enter: React.FC<{fade: boolean; outAt?: number; children: React.ReactNode}> = ({fade, outAt, children}) => {
  const f = useCurrentFrame();
  const i = fade ? interpolate(f, [0, XF], [0, 1], {...CLAMP, easing: ease}) : 1;
  const o = outAt === undefined ? 1 : interpolate(f, [outAt, outAt + XF], [1, 0], {...CLAMP, easing: ease});
  return <AbsoluteFill style={{opacity: Math.min(i, o)}}>{children}</AbsoluteFill>;
};

const isFull = (b: Beat | undefined) => b?.kind === 'custom' && b.full === true;

/**
 * A long-form 16:9 tutorial edited from screen recordings: every scene of timing.json is a beat (footage or a
 * code-made card) inside one screen window on the navy backdrop (or over the whole frame for `full` custom beats:
 * intro, end card); chapter cards and the chapter label (top margin), burned-in subtitles (`subtitles`), the voice,
 * the music bed (`music`, ducked under the voice), sparse auto SFX (`sfx`) and the PREVIEW badge while timing is estimated. See docs/style-guide.md → Tutorials.
 */
export const TutorialComposition: React.FC<{def: TutorialDef; subtitles: boolean}> = ({def, subtitles}) => {
  const {timing, beats, chapters} = def;
  const sceneAt = (f: number) => {
    let cur = null;
    for (const s of timing.scenes) if (s.from <= f) cur = s;
    return cur;
  };
  const n = timing.scenes.length;
  const pal = tutPalette(def.sfxPalette);
  return (
    <TutorialCtx.Provider value={def}>
      <TimingProvider value={timing}>
        <AbsoluteFill style={{backgroundColor: C.bg}}>
          <Backdrop />
          <div
            style={{
              position: 'absolute',
              left: WIN.x,
              top: WIN.y,
              width: WIN.w,
              height: WIN.h,
              borderRadius: WIN.radius,
              overflow: 'hidden',
              background: '#121826',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.09)',
            }}
          >
            {timing.scenes.map((s, i) => {
              const beat = beats[s.id];
              if (isFull(beat)) return null;
              const last = i === n - 1;
              return (
                <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.dur + (last ? 0 : XF)}>
                  <SceneProvider value={s}>
                    <Enter fade={i > 0 && beat?.enter !== 'cut'}>
                      <BeatView beat={beat} />
                    </Enter>
                  </SceneProvider>
                </Sequence>
              );
            })}
          </div>
          <ChapterOverlay chapters={chapters} sceneAt={sceneAt} />
          {/* Full-frame code-made beats (intro, end card) sit above the window and fade out over the next scene. */}
          {timing.scenes.map((s, i) => {
            const beat = beats[s.id];
            if (!isFull(beat)) return null;
            const last = i === n - 1;
            return (
              <Sequence key={`full-${s.id}`} name={`${s.id} (full)`} from={s.from} durationInFrames={s.dur + (last ? 0 : XF)}>
                <SceneProvider value={s}>
                  <Enter fade={i > 0 && beat?.enter !== 'cut'} outAt={last ? undefined : s.dur}>
                    <BeatView beat={beat} />
                  </Enter>
                </SceneProvider>
              </Sequence>
            );
          })}
          {def.sfx &&
            chapters.map((c) => {
              const s = timing.scenes.find((x) => x.id === c.first);
              return s ? (
                <Sequence key={c.n} from={s.from} layout="none">
                  {/* The palette's chapter cue as the card rises in (the voice pauses here). */}
                  <Sfx name={pal.chapter.name} at={pal.chapter.at} volume={pal.chapter.volume} />
                </Sequence>
              ) : null;
            })}
          {subtitles && <Subtitles />}
          <VoiceTrack />
          {def.music && <MusicBed src={def.music.src} level={def.music.level} />}
          {timing.estimated && <PreviewBadge />}
        </AbsoluteFill>
      </TimingProvider>
    </TutorialCtx.Provider>
  );
};
