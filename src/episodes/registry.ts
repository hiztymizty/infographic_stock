import type {EpisodeDef} from '../core/EpisodeShell';
import {ep01} from './ep01-ihsg-dca';

/** Every episode becomes two compositions: `<id>` (captions burned in) and `<id>-clean`. */
export const EPISODES: EpisodeDef[] = [ep01];
