import type { ScoreSnapshot } from '../data/commendations';
import type { AdjudicationRecord, Player, RoundType } from '../types';
import { ALL_ROUND_TYPES } from './match';
import { ROUND_LABELS } from './roundCatalog';

const CHRONOLOGY_ROUNDS = new Set<RoundType>(['RANK_IT', 'CHAIN_OF_COMMAND', 'SEATING_COMMITTEE']);

export interface DepartmentPerformance {
  roundType: RoundType;
  label: string;
  attempts: number;
  bestScore: number | null;
  averageScore: number | null;
}

export interface PlayerDossierSummary {
  bestDepartment: DepartmentPerformance | null;
  strongestKnowledgeArea: { category: string; averageScore: number } | null;
  closestMapKm: number | null;
  closestEstimatePercent: number | null;
  strongestRiskScore: number | null;
  bestChronology: DepartmentPerformance | null;
  scoreProgression: number[];
  departmentPerformance: DepartmentPerformance[];
  adjudications: AdjudicationRecord[];
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const buildPlayerDossier = (
  player: Player,
  scoreHistory: ScoreSnapshot[],
  adjudicationHistory: AdjudicationRecord[]
): PlayerDossierSummary => {
  const roundScores = player.stats.roundScores ?? {};
  const departmentPerformance = ALL_ROUND_TYPES.map(roundType => {
    const scores = roundScores[roundType] ?? [];
    return {
      roundType,
      label: ROUND_LABELS[roundType],
      attempts: scores.length,
      bestScore: scores.length ? Math.max(...scores) : null,
      averageScore: scores.length ? average(scores) : null
    };
  });
  const attempted = departmentPerformance.filter(item => item.attempts > 0);
  const bestDepartment = [...attempted].sort((first, second) =>
    (second.averageScore ?? 0) - (first.averageScore ?? 0) || (second.bestScore ?? 0) - (first.bestScore ?? 0))[0] ?? null;
  const bestChronology = [...attempted].filter(item => CHRONOLOGY_ROUNDS.has(item.roundType))
    .sort((first, second) => (second.bestScore ?? 0) - (first.bestScore ?? 0))[0] ?? null;
  const strongestKnowledgeArea = Object.entries(player.stats.categoryScores ?? {})
    .filter((entry): entry is [string, number[]] => entry[1].length > 0)
    .map(([category, scores]) => ({ category, averageScore: average(scores) }))
    .sort((first, second) => second.averageScore - first.averageScore)[0] ?? null;
  const filedProgression = scoreHistory.map(snapshot => snapshot.scores[player.id]).filter((score): score is number => typeof score === 'number');
  const scoreProgression = [0, ...filedProgression];
  if (scoreProgression.at(-1) !== player.score) scoreProgression.push(player.score);

  return {
    bestDepartment,
    strongestKnowledgeArea,
    closestMapKm: player.stats.mapDistancesKm.length ? Math.min(...player.stats.mapDistancesKm) : null,
    closestEstimatePercent: player.stats.estimateErrorsPercent.length ? Math.min(...player.stats.estimateErrorsPercent) : null,
    strongestRiskScore: player.stats.successfulRiskScores?.length ? Math.max(...player.stats.successfulRiskScores) : null,
    bestChronology,
    scoreProgression,
    departmentPerformance,
    adjudications: adjudicationHistory.filter(record => record.playerId === player.id)
  };
};

export const createScoreProgressionPoints = (scores: number[], width = 300, height = 72): string => {
  if (!scores.length) return '';
  const maximum = Math.max(...scores, 1);
  const divisor = Math.max(1, scores.length - 1);
  return scores.map((score, index) => {
    const x = (index / divisor) * width;
    const y = height - (score / maximum) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
};
