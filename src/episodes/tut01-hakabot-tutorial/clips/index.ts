import type {Clip} from '../../../core/tutorial/types';
import akun from './akun.json';
import comp from './comp.json';
import dash from './dash.json';
import fund from './fund.json';
import hb from './hb.json';
import idx from './idx.json';
import scr from './scr.json';
import stock from './stock.json';
import watch from './watch.json';

// Every chapter's clip list merged (one JSON per chapter so chapters are built in parallel without touching the
// same file). Names must be unique across chapters: prefix them with the chapter id (e.g. "stock-c").
const lists: {clips: Record<string, unknown>}[] = [dash, watch, stock, fund, idx, comp, scr, hb, akun];

export const CLIPS: Record<string, Clip> = {};
for (const l of lists) {
  for (const [name, c] of Object.entries(l.clips)) {
    if (CLIPS[name]) throw new Error(`tut01: clip "${name}" is listed twice`);
    CLIPS[name] = c as Clip;
  }
}
