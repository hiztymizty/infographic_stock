// Intro (scene intro-1): code-made, full frame (no window). Design: scenes/Intro.tsx, strings: copy.ts → intro.
import type {Beat} from '../../../core/tutorial/types';
import {Intro} from '../scenes/Intro';

export const beats: Record<string, Beat> = {
  'intro-1': {kind: 'custom', component: Intro, full: true},
};
