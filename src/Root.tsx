import React from 'react';
import {Composition} from 'remotion';
import {EpisodeShell} from './core/EpisodeShell';
import {OUTRO_PREVIEW_TIMING, OutroPreview} from './core/brand/OutroPreview';
import {H, W} from './core/theme';
import {EPISODES} from './episodes/registry';

const Episode: React.FC<{id: string; captions: boolean}> = ({id, captions}) => {
  const episode = EPISODES.find((e) => e.id === id)!;
  return <EpisodeShell episode={episode} captions={captions} />;
};

export const RemotionRoot: React.FC = () => (
  <>
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
  </>
);
