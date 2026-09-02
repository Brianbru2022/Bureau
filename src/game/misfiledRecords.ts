import { clampScore } from './scoring';

const MAXIMUM_BY_CLUE = [1000, 760, 520] as const;

export const potentialMisfiledScore = (cluesRevealed: number): number =>
  MAXIMUM_BY_CLUE[Math.max(0, Math.min(2, Math.round(cluesRevealed)))];

export const scoreMisfiledRecords = (
  cluesRevealed: number,
  recordCorrect: boolean,
  connectionCorrect: boolean,
): number => {
  const maximum = potentialMisfiledScore(cluesRevealed);
  const earnedRatio = (recordCorrect ? 0.65 : 0) + (connectionCorrect ? 0.35 : 0);
  return clampScore(maximum * earnedRatio);
};

export const shuffleMisfiledRecords = <T>(records: readonly T[], random: () => number = Math.random): T[] => {
  const shuffled = [...records];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const destination = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[destination]] = [shuffled[destination], shuffled[index]];
  }
  return shuffled;
};
