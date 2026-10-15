import type {EpisodeDef} from '../core/EpisodeShell';
import type {TutorialDef} from '../core/tutorial/types';
import {ep01} from './ep01-ihsg-dca';
import {ep03} from './ep03-inflasi-tabungan';
import {tut01} from './tut01-hakabot-tutorial';

/** Every episode becomes two compositions: `<id>` (captions burned in) and `<id>-clean`. */
export const EPISODES: EpisodeDef[] = [ep01, ep03];

/** Long-form 16:9 tutorials (src/core/tutorial): `<id>` (subtitles burned in) and `<id>-clean`. */
export const TUTORIALS: TutorialDef[] = [tut01];
