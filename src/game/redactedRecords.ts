import { clampScore } from './scoring';

const SCORE_BY_LINE = [1000, 760, 520, 300] as const;

export const potentialRedactedScore = (linesVisible: number): number =>
  SCORE_BY_LINE[Math.max(0, Math.min(3, Math.round(linesVisible) - 1))];

export const scoreRedactedRecords = (linesVisible: number, correct: boolean): number =>
  correct ? clampScore(potentialRedactedScore(linesVisible)) : 0;
