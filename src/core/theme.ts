import {loadFont as loadSans} from '@remotion/google-fonts/PlusJakartaSans';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const SANS = loadSans('normal', {weights: ['400', '500', '700', '800'], subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;

// Chart marks were validated (dataviz validate_palette.js, dark, surface #0B1019, all pairs):
// invested/value/loss pass; green↔red sits in the CVD 6–8 band, so gain/loss always
// also carries ▲/▼ and +/− text.
export const C = {
  bg: '#0B1019',
  bgTop: '#111A2B',
  panel: 'rgba(255,255,255,0.04)',
  panelBorder: 'rgba(255,255,255,0.10)',
  grid: 'rgba(255,255,255,0.08)',
  text: '#F4F6FA',
  dim: '#A6AFBF',
  mute: '#6B7586',
  gold: '#F2B33D', // typographic accent for rupiah amounts — never a chart mark
  invested: '#3987E5',
  value: '#18A06F',
  loss: '#E5534F',
  index: '#E6EAF0',
  brand: '#1212F9', // Hakabot blue, from brand_logo/PNG-07 — fills only, never small text on dark
} as const;

export const W = 1080;
export const H = 1920;
