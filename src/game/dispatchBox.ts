import { clampScore } from './scoring';
import type { ScorePaceProfile } from '../types';
import { scoringElapsedMs } from './scorePacing';

export const scoreDispatchAnswer = (correct: boolean, elapsedMs: number, pace: ScorePaceProfile = 'RAPID') => {
  if (!correct) return 0;
  return clampScore(Math.round(200 / (1 + scoringElapsedMs(elapsedMs, pace) / 15_000)));
};

export const dispatchTotal = (scores: readonly number[]) => clampScore(scores.reduce((total, score) => total + score, 0));
