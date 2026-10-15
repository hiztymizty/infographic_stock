// End card (scene end): code-made, full frame, matching the intro. Design: scenes/EndCard.tsx, strings: copy.ts → end.
import type {Beat} from '../../../core/tutorial/types';
import {EndCard} from '../scenes/EndCard';

export const beats: Record<string, Beat> = {
  end: {kind: 'custom', component: EndCard, full: true},
};
