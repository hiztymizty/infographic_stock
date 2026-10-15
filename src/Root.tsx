import React from 'react';
import {Composition, Still} from 'remotion';
import {EpisodeShell} from './core/EpisodeShell';
import {OUTRO_PREVIEW_TIMING, OutroPreview} from './core/brand/OutroPreview';
import {H, W} from './core/theme';
import {TutorialComposition} from './core/tutorial/TutorialComposition';
import {TH, TW} from './core/tutorial/layout';
import {EPISODES, TUTORIALS} from './episodes/registry';
import {Cover, type CoverVariant} from './episodes/ep03-inflasi-tabungan/Cover';

const Episode: React.FC<{id: string; captions: boolean}> = ({id, captions}) => {
  const episode = EPISODES.find((e) => e.id === id)!;
  return <EpisodeShell episode={episode} captions={captions} />;
};

const Tutorial: React.FC<{id: string; subtitles: boolean}> = ({id, subtitles}) => {
  const def = TUTORIALS.find((t) => t.id === id)!;
  return <TutorialComposition def={def} subtitles={subtitles} />;
};

export const RemotionRoot: React.FC = () => (
  <>
    {/* 16:9 tutorials: `<id>` with burned-in subtitles, `<id>-clean` without. */}
    {TUTORIALS.flatMap((t) =>
      [true, false].map((subtitles) => (
        <Composition
          key={`${t.id}-${subtitles}`}
          id={subtitles ? t.id : `${t.id}-clean`}
          component={Tutorial}
          durationInFrames={t.timing.totalFrames}
          fps={t.timing.fps}
          width={TW}
          height={TH}
          defaultProps={{id: t.id, subtitles}}
        />
      )),
    )}
    {EPISODES.flatMap((ep) =>
      [true, false].map((captions) => (
        <Composition
          key={`${ep.id}-${captions}`}
          id={captions ? ep.id : `${ep.id}-clean`}
          component={Episode}
          durationInFrames={ep.timing.totalFrames}
          fps={ep.timing.fps}
          width={W}
          height={H}
          defaultProps={{id: ep.id, captions}}
        />
      )),
    )}
    {/* The shared Hakabot outro on its own, timed from the standard outro script (docs/hakabot.md). */}
    <Composition
      id="hakabot-outro-preview"
      component={OutroPreview}
      durationInFrames={OUTRO_PREVIEW_TIMING.totalFrames}
      fps={OUTRO_PREVIEW_TIMING.fps}
      width={W}
      height={H}
    />
    {/* ep03 thumbnail options (render with --props='{"variant":"a"|"b"|"c"}'). */}
    <Still
      id="ep03-inflasi-tabungan-cover"
      component={Cover}
      width={W}
      height={H}
      defaultProps={{variant: 'a' as CoverVariant}}
    />
  </>
);
