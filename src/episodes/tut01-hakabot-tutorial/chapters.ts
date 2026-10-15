import type {Chapter} from '../../core/tutorial/types';
import {COPY} from './copy';

// The chapter cards and labels (BAB 01…08), in recording order (user, 15 Okt: Akun last). A chapter's card shows
// when its `first` scene starts; its label stays in the top margin until the next chapter. The Fundamental tab is
// part of the Stock page, so fund-* scenes belong to Stock (the intro's chapter line names 8 sections).
const prefix = (...ps: string[]) => (id: string) => ps.some((p) => id.startsWith(p));
const T = COPY.chapters;

export const CHAPTERS: Chapter[] = [
  {n: 1, title: T[0].title, first: 'dash-1', scenes: prefix('dash-')},
  {n: 2, title: T[1].title, first: 'watch-1', scenes: prefix('watch-')},
  {n: 3, title: T[2].title, first: 'stock-1', scenes: prefix('stock-', 'fund-')},
  {n: 4, title: T[3].title, first: 'idx-1', scenes: prefix('idx-')},
  {n: 5, title: T[4].title, first: 'comp-1', scenes: prefix('comp-')},
  {n: 6, title: T[5].title, first: 'scr-1', scenes: prefix('scr-')},
  {n: 7, title: T[6].title, first: 'hb-1', scenes: prefix('hb-')},
  {n: 8, title: T[7].title, first: 'akun-1', scenes: prefix('akun-')},
];
