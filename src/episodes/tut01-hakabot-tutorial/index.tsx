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
  // Sparse auto SFX (clicks, a few rings, chapter cards, end card). Palette T3 "in key" (kalimba click, marimba ring,
  // singing bowl chapter): the user's pick 16 Okt after rejecting palette B as generic (qa/sfx-options.md).
  sfx: true,
  sfxPalette: 't3',
  // Original score, composed in code for this tutorial: scripts/music_synth.py (npm run music -- tut01-hakabot-tutorial;
  // rebuild after any re-voice). Mastered to -16 LUFS like the shorts' scores but set lower (0.2, shorts 0.3) so an
  // 18-minute bed stays in the background.
  music: {src: 'music/tut01-hakabot-tutorial-score.wav', level: 0.2},
};
