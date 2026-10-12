import type {EpisodeDef} from '../../core/EpisodeShell';
import type {Timing} from '../../core/timing';
import {Hook} from './scenes/Hook';
import {Journey} from './scenes/Journey';
import {Lesson} from './scenes/Lesson';
import {MeetIhsg} from './scenes/MeetIhsg';
import {Result} from './scenes/Result';
import {Rules} from './scenes/Rules';
import {Twist} from './scenes/Twist';
import timing from './timing.json';

export const ep01: EpisodeDef = {
  id: 'ep01-ihsg-dca',
  timing: timing as Timing,
  scenes: {hook: Hook, rules: Rules, ihsg: MeetIhsg, journey: Journey, twist: Twist, result: Result, lesson: Lesson},
  music: null,
};
