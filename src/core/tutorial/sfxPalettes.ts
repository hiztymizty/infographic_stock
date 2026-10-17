import {getInputProps} from 'remotion';
import type {SfxName} from '../audio';

/**
 * Tutorial SFX palettes: which sound plays for each auto-cue role, and how loud. `b` is the original palette-B set
 * (rejected by the user for tut01 on 16 Okt as "the common AI-edit sound"); t1-t4 are the replacements made in
 * scripts/sfx_synth.py (`palette_t1`...`palette_t4`, `npm run sfx`). Every sound is loudness-matched to its role
 * (click/ring/pill -23, chapter -22, logo -16.5 LUFS momentary max), so the volumes below compare 1:1.
 * Pick one per episode with `sfxPalette` in the TutorialDef; a render can override it with the input prop
 * `sfxPalette` (SFX_PALETTE=t2 npm run render -- <id> --range a b) for side-by-side comparisons.
 * See docs/style-guide.md -> Tutorials -> Sound.
 */
export type TutPaletteId = 'b' | 't1' | 't2' | 't3' | 't4';

type Cue = {name: SfxName; volume: number};

export type TutPalette = {
  title: string;
  /** Every real click (click ripple). */
  click: Cue;
  /** A ring with a label appearing (only when nothing just sounded; see planCues). */
  label: Cue;
  /** A plain ring appearing; null = plain rings stay silent. */
  ring: Cue | null;
  /** Chapter card; `at` = frames after the chapter's first scene starts (the card fades in over 12). */
  chapter: Cue & {at: number};
  /** End card logo, before the voice. */
  logo: Cue & {at: number};
  /** The hakabot.com pill landing (on the spoken "hakabot"). */
  pill: Cue;
};

export const TUT_PALETTES: Record<TutPaletteId, TutPalette> = {
  b: {
    title: 'B · Premium UI (original, rejected)',
    click: {name: 'b-click', volume: 0.15},
    label: {name: 'b-tap', volume: 0.14},
    ring: {name: 'b-tap', volume: 0.11},
    chapter: {name: 'b-air', volume: 0.2, at: 2},
    logo: {name: 'b-mark', volume: 0.3, at: 2},
    pill: {name: 'b-tap', volume: 0.14},
  },
  t1: {
    title: 'T1 · Atelier (wood + felt piano)',
    click: {name: 't1-click', volume: 0.15},
    label: {name: 't1-ring', volume: 0.13},
    ring: {name: 't1-ring', volume: 0.1},
    chapter: {name: 't1-chapter', volume: 0.32, at: 2},
    logo: {name: 't1-logo', volume: 0.26, at: 2},
    pill: {name: 't1-pill', volume: 0.13},
  },
  t2: {
    title: 'T2 · Mechanism (key switch, shutter, latch)',
    click: {name: 't2-click', volume: 0.12},
    label: {name: 't2-ring', volume: 0.12},
    ring: {name: 't2-ring', volume: 0.1},
    chapter: {name: 't2-chapter', volume: 0.26, at: 4},
    logo: {name: 't2-logo', volume: 0.26, at: 2},
    pill: {name: 't2-pill', volume: 0.13},
  },
  t3: {
    title: 'T3 · In key (kalimba, marimba, singing bowl)',
    click: {name: 't3-click', volume: 0.12},
    label: {name: 't3-ring', volume: 0.11},
    ring: {name: 't3-ring', volume: 0.09},
    chapter: {name: 't3-chapter', volume: 0.3, at: 2},
    logo: {name: 't3-logo', volume: 0.26, at: 2},
    pill: {name: 't3-pill', volume: 0.12},
  },
  t4: {
    title: 'T4 · Paper (near-silent)',
    click: {name: 't4-click', volume: 0.12},
    label: {name: 't4-ring', volume: 0.11},
    ring: null,
    chapter: {name: 't4-chapter', volume: 0.3, at: 2},
    logo: {name: 't4-logo', volume: 0.24, at: 2},
    pill: {name: 't4-pill', volume: 0.11},
  },
};

/** The palette in force: the render's `sfxPalette` input prop if given, else the episode's, else `b`. */
export const tutPalette = (episode?: TutPaletteId): TutPalette => {
  const p = (getInputProps() as {sfxPalette?: string}).sfxPalette;
  const id = (p && p in TUT_PALETTES ? p : episode ?? 'b') as TutPaletteId;
  return TUT_PALETTES[id];
};
