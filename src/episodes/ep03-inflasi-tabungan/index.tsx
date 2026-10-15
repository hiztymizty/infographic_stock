import type {EpisodeDef} from '../../core/EpisodeShell';
import type {Timing} from '../../core/timing';
import {Bank} from './scenes/Bank';
import {Formula} from './scenes/Formula';
import {Hook} from './scenes/Hook';
import {Lesson} from './scenes/Lesson';
import {Shrink} from './scenes/Shrink';
import timing from './timing.json';

export const ep03: EpisodeDef = {
  id: 'ep03-inflasi-tabungan',
  timing: timing as Timing,
  scenes: {hook: Hook, shrink: Shrink, bank: Bank, formula: Formula, lesson: Lesson},
  // Original score, composed in code: scripts/music_synth.py (npm run music -- ep03-inflasi-tabungan). Mastered to
  // -16 LUFS, so 0.3 puts it ~16-19 dB under the voice once MusicBed ducks it. Rebuild after any re-voice.
  music: {src: 'music/ep03-score.wav', level: 0.3},
};
