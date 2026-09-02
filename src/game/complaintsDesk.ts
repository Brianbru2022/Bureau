import { clampScore } from './scoring';
import type { ScorePaceProfile } from '../types';
import { scoringElapsedMs } from './scorePacing';

const confidenceFactor = (confidence: number) => {
  const calibrated = Math.max(0, Math.min(100, confidence)) / 100;
  return 1 - ((1 - calibrated) ** 2);
};

export const complaintsDeskTimeCeiling = (elapsedMs: number, pace: ScorePaceProfile = 'RAPID') =>
  clampScore(Math.round(1000 / (1 + scoringElapsedMs(elapsedMs, pace) / 75_000)));

export const potentialComplaintsDeskScore = (elapsedMs: number, confidence: number, pace: ScorePaceProfile = 'RAPID') =>
  clampScore(Math.round((1000 / (1 + scoringElapsedMs(elapsedMs, pace) / 75_000)) * confidenceFactor(confidence)));

export const scoreComplaintsDesk = (elapsedMs: number, confidence: number, correct: boolean, pace: ScorePaceProfile = 'RAPID') =>
  correct ? potentialComplaintsDeskScore(elapsedMs, confidence, pace) : 0;
