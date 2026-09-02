import type { GameLengthPreset, PoliticsMode, RoundType } from '../types';
import { composeAssessmentSchedule, FIRST_ASSESSMENT_ROUND_ORDER, politicsRoundIndices, PRESET_ROUND_COUNTS } from './match';
import { miniGameBoundaries } from './match';
import { seededRandom } from './progression';

export interface AssessmentDurationEstimate {
  lowerMinutes: number;
  upperMinutes: number;
  typicalMinutes: number;
  label: string;
}

export interface FormatPacingReport extends AssessmentDurationEstimate {
  preset: Exclude<GameLengthPreset, 'CUSTOM'>;
  playerCount: 1 | 2 | 3 | 4;
  lowerDecileMinutes: number;
  upperDecileMinutes: number;
}

/** Deliberation time per candidate plus apparatus administration. Values are
 * deliberately independent of score, so faster play cannot change awards. */
const ROUND_SECONDS: Record<RoundType, { apparatus: number; perCandidate: number }> = {
  WHERE_IN_BRITAIN: { apparatus: 35, perCandidate: 58 },
  TOP_10: { apparatus: 75, perCandidate: 48 },
  PUT_UP_OR_SHUT_UP: { apparatus: 70, perCandidate: 52 },
  THE_LIST: { apparatus: 30, perCandidate: 65 },
  CLOSEST_WINS: { apparatus: 35, perCandidate: 52 },
  RANK_IT: { apparatus: 30, perCandidate: 62 },
  IMAGE_REVEAL: { apparatus: 30, perCandidate: 58 },
  STOP_THE_SCORE: { apparatus: 35, perCandidate: 56 },
  MISFILED_RECORDS: { apparatus: 30, perCandidate: 60 },
  REDACTED_RECORDS: { apparatus: 30, perCandidate: 55 },
  COMMON_DOSSIER: { apparatus: 30, perCandidate: 60 },
  MISSING_MINUTES: { apparatus: 45, perCandidate: 58 },
  PUBLIC_ENQUIRY: { apparatus: 75, perCandidate: 50 },
  CHAIN_OF_COMMAND: { apparatus: 35, perCandidate: 65 },
  COMPLAINTS_DESK: { apparatus: 30, perCandidate: 58 },
  SEATING_COMMITTEE: { apparatus: 35, perCandidate: 65 },
  DISPATCH_BOX: { apparatus: 30, perCandidate: 72 },
};

const secondsForAssessment = (rounds: RoundType[], playerCount: number, preset: GameLengthPreset, politicsMode: PoliticsMode) => {
  const candidates = Math.max(1, Math.min(4, Math.round(playerCount)));
  const firstAssessment = preset === 'FIRST';
  const roundsSeconds = rounds.reduce((total, roundType) => {
    const timing = ROUND_SECONDS[roundType];
    return total + timing.apparatus + timing.perCandidate * candidates;
  }, 0);
  const setupSeconds = 75 + candidates * 24;
  const directiveSeconds = firstAssessment ? 0 : 25 + candidates * 32;
  const transitionsSeconds = rounds.length * 18;
  const miniGameSeconds = firstAssessment ? 0 : miniGameBoundaries(rounds.length).size * (45 + candidates * 16);
  const finalCaseAndDossierSeconds = firstAssessment ? 70 : 135 + candidates * 42;
  const politicsAppearances=politicsRoundIndices(politicsMode,rounds.length).size;
  const politicsSeconds = candidates === 1 || politicsMode === 'OFF'
    ? 0
    : politicsAppearances * (politicsMode === 'LIGHT' ? 12 + candidates * 5 : 22 + candidates * 9);
  return roundsSeconds + setupSeconds + directiveSeconds + transitionsSeconds + miniGameSeconds + finalCaseAndDossierSeconds + politicsSeconds;
};

export function estimateAssessmentDuration(rounds: RoundType[], playerCount: number, preset: GameLengthPreset, politicsMode: PoliticsMode): AssessmentDurationEstimate {
  const typicalMinutes = Math.max(1, Math.round(secondsForAssessment(rounds, playerCount, preset, politicsMode) / 60));
  const lowerMinutes = Math.max(1, Math.floor(typicalMinutes * .82));
  const upperMinutes = Math.max(lowerMinutes + 1, Math.ceil(typicalMinutes * 1.18));
  return { lowerMinutes, upperMinutes, typicalMinutes, label: `${lowerMinutes}–${upperMinutes} min` };
}

const percentile = (sorted: number[], fraction: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)))] ?? 0;

/** Seeded pacing laboratory. It varies both itinerary and table speed while
 * retaining the same duration contract displayed to hosts. */
export function simulateFormatPacing(count: number, preset: Exclude<GameLengthPreset, 'CUSTOM'>, playerCount: 1 | 2 | 3 | 4, politicsMode: PoliticsMode): FormatPacingReport {
  const samples: number[] = [];
  for (let seed = 1; seed <= Math.max(1, count); seed += 1) {
    const random = seededRandom(seed * 7919 + playerCount * 101);
    const rounds = preset === 'FIRST'
      ? FIRST_ASSESSMENT_ROUND_ORDER
      : composeAssessmentSchedule(PRESET_ROUND_COUNTS[preset], random);
    const seconds = secondsForAssessment(rounds, playerCount, preset, playerCount === 1 ? 'OFF' : politicsMode);
    const tableSpeed = .84 + random() * .32;
    samples.push(seconds * tableSpeed / 60);
  }
  samples.sort((left, right) => left - right);
  const referenceRounds = preset === 'FIRST'
    ? FIRST_ASSESSMENT_ROUND_ORDER
    : composeAssessmentSchedule(PRESET_ROUND_COUNTS[preset], seededRandom(84));
  const estimate = estimateAssessmentDuration(referenceRounds, playerCount, preset, playerCount === 1 ? 'OFF' : politicsMode);
  return {
    ...estimate,
    preset,
    playerCount,
    typicalMinutes: Number(percentile(samples, .5).toFixed(1)),
    lowerDecileMinutes: Number(percentile(samples, .1).toFixed(1)),
    upperDecileMinutes: Number(percentile(samples, .9).toFixed(1)),
  };
}
