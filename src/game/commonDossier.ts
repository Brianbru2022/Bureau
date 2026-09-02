import { clampScore } from './scoring';

const SCORE_BY_EXHIBIT = [1000, 800, 600, 400] as const;

export const potentialCommonDossierScore = (exhibitsVisible: number): number =>
  SCORE_BY_EXHIBIT[Math.max(0, Math.min(3, Math.round(exhibitsVisible) - 1))];

export const scoreCommonDossier = (exhibitsVisible: number, correct: boolean): number =>
  correct ? clampScore(potentialCommonDossierScore(exhibitsVisible)) : 0;
