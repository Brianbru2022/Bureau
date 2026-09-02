import { clampScore } from './scoring';
import type { ScorePaceProfile } from '../types';
import { scoringElapsedMs } from './scorePacing';

const DECAY_WINDOW_MS = 45_000;

/** A continuous hyperbolic curve: every additional millisecond of inspection
 * lowers the potential score, without discrete replay or hint bands. */
export const potentialMissingMinutesScore = (viewedMs: number, pace: ScorePaceProfile = 'RAPID'): number =>
  clampScore(Math.round(1000 / (1 + scoringElapsedMs(viewedMs, pace) / DECAY_WINDOW_MS)));

export const scoreMissingMinutes = (viewedMs: number, correct: boolean, pace: ScorePaceProfile = 'RAPID'): number =>
  correct ? potentialMissingMinutesScore(viewedMs, pace) : 0;
