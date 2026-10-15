import type {Beat} from '../../../core/tutorial/types';
import {beats as akun} from './akun';
import {beats as comp} from './comp';
import {beats as dash} from './dash';
import {beats as end} from './end';
import {beats as fund} from './fund';
import {beats as hb} from './hb';
import {beats as idx} from './idx';
import {beats as intro} from './intro';
import {beats as scr} from './scr';
import {beats as stock} from './stock';
import {beats as watch} from './watch';

// tut01: the edit, one beat per script scene (same ids), one file per chapter. This index only merges them: a
// chapter is built by editing its own beats/<chapter>.ts + clips/<chapter>.json, never this file.
const chapters: Record<string, Beat>[] = [intro, dash, watch, stock, fund, idx, comp, scr, hb, akun, end];

export const BEATS: Record<string, Beat> = {};
for (const c of chapters) {
  for (const [id, b] of Object.entries(c)) {
    if (BEATS[id]) throw new Error(`tut01: beat "${id}" is defined twice`);
    BEATS[id] = b;
  }
}
