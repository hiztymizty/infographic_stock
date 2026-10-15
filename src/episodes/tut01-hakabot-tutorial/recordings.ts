import type {BlurBox, Recording, Rect} from '../../core/tutorial/types';
import recordings from './recordings.json';

// The source recordings, from recordings.json (shared with scripts/tutorial_clips.py, which crops the clips to
// `bounds`). Coordinates in beats are raw-recording px: for New.mp4 that's 4K (3840×2160).
type RecJson = {file: string; bounds: Rect; fill: string; clipWidth: number; blur: BlurBox[]};

export const RECORDINGS: Record<string, Recording> = Object.fromEntries(
  Object.entries(recordings)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, r]) => {
      const j = r as RecJson;
      return [k, {file: j.file, bounds: j.bounds, fill: j.fill, blur: j.blur}];
    }),
);
