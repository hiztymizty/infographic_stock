import type {Timing} from '../../core/timing';
import type {TutorialDef} from '../../core/tutorial/types';
import {BEATS} from './beats';
import {CHAPTERS} from './chapters';
import {CLIPS} from './clips';
import {RECORDINGS} from './recordings';
import timing from './timing.json';

/**
 * tut01: the long-form 16:9 YouTube tutorial of the Hakabot app (compositions `tut01-hakabot-tutorial` with
 * subtitles and `tut01-hakabot-tutorial-clean`), edited from temp/New.mp4 (4K). One file per chapter:
 * beats/<chapter>.ts + clips/<chapter>.json (see docs/style-guide.md → Tutorials). Scenes without a beat render as
 * placeholders. Footage clips: python -I scripts/tutorial_clips.py tut01-hakabot-tutorial.
 */
export const tut01: TutorialDef = {
  id: 'tut01-hakabot-tutorial',
  timing: timing as Timing,
  recordings: RECORDINGS,
  clips: CLIPS,
  clipDir: 'tutorial/tut01',
  beats: BEATS,
  chapters: CHAPTERS,
  // Silent preview for the user's review (no voice yet); the sound designer turns this on later.
  sfx: false,
};
