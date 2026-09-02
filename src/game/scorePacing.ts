import type { ScorePaceProfile } from '../types';

export const SCORE_PACE_LABELS: Record<ScorePaceProfile, string> = {
  RELAXED: 'Relaxed',
  STANDARD: 'Standard',
  RAPID: 'Rapid',
};

export const SCORE_PACE_DESCRIPTIONS: Record<ScorePaceProfile, string> = {
  RELAXED: 'No score is lost while candidates read or discuss the question.',
  STANDARD: 'Time has a gentle, continuously calculated influence on the award.',
  RAPID: 'The original full continuous time decay rewards an immediate response.',
};

const ELAPSED_MULTIPLIERS: Record<ScorePaceProfile, number> = {
  RELAXED: 0,
  STANDARD: 0.45,
  RAPID: 1,
};

/** Converts real elapsed time into scoring time. Standard and Rapid remain
 * continuous at millisecond precision; Relaxed deliberately removes time from
 * the scoring equation rather than hiding a reading-speed penalty. */
export const scoringElapsedMs = (elapsedMs: number, profile: ScorePaceProfile): number =>
  Math.max(0, elapsedMs) * ELAPSED_MULTIPLIERS[profile];

export const paceScoreNote = (profile: ScorePaceProfile): string =>
  profile === 'RELAXED'
    ? 'Relaxed scoring: recorded time does not reduce the award.'
    : `${SCORE_PACE_LABELS[profile]} scoring: every additional moment changes the award continuously.`;
