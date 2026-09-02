import { clampScore } from './scoring';
import type { ScorePaceProfile } from '../types';
import { scoringElapsedMs } from './scorePacing';

export const seatingDisplacement = (submitted: readonly string[], correct: readonly string[]) => {
  const certifiedPositions = new Map(correct.map((official, index) => [official, index]));
  return submitted.reduce((total, official, index) => total + Math.abs(index - (certifiedPositions.get(official) ?? index)), 0);
};

export const seatingAccuracy = (submitted: readonly string[], correct: readonly string[]) => {
  if (submitted.length !== correct.length || new Set(submitted).size !== correct.length || submitted.some(official => !correct.includes(official))) return 0;
  const maximumDisplacement = Math.floor((correct.length * correct.length) / 2);
  return maximumDisplacement ? Math.max(0, 1 - seatingDisplacement(submitted, correct) / maximumDisplacement) : 1;
};

export const scoreSeatingCommittee = (submitted: readonly string[], correct: readonly string[], elapsedMs: number, pace: ScorePaceProfile = 'RAPID') => {
  const timeFactor = 1 / (1 + scoringElapsedMs(elapsedMs, pace) / 90_000);
  return clampScore(Math.round(1000 * seatingAccuracy(submitted, correct) * timeFactor));
};
