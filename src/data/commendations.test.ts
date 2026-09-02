import { describe, expect, it } from 'vitest';
import type { Player, PlayerStats } from '../types';
import { allPossibleCommendations, evaluateCommendations } from './commendations';

const stats = (): PlayerStats => ({
  roundsPlayed: 8, correctAnswers: 8, totalAnswers: 10, bestScore: 980, worstScore: 0,
  mapDistancesKm: [5], estimateErrorsPercent: [4], risksTaken: 3, successfulRisks: 0,
  highestBankedList: 700, categoriesAttempted: new Set(['a','b','c','d']), interceptCount: 1,
  challengeScores: [980], mapScores: [900], successfulListBanks: [700],
  categoryScores: { a: [1], b: [2], c: [3], d: [4] }, assetsUsed: ['INTERCEPT']
});

const player = (id: string, score: number): Player => ({
  id, name: id, avatar: 'A', color: '#000', department: 'Tests', score, assets: [], stats: stats(),
  secretDirective: { id: '', codeName: '', title: '', description: '', targetMetric: '', bonusPoints: 0, isCompleted: false, progressText: '' }
});

describe('commendation evaluators', () => {
  it('can evaluate every registered commendation without dropping an eligible category', () => {
    const players = [player('a', 1000), player('b', 900)];
    const selected = allPossibleCommendations.map(item => ({ ...item, evaluationNote: '', winnerPlayerId: null, isCompleted: false }));
    const result = evaluateCommendations(players, selected, [
      { roundNumber: 1, scores: { a: 1000, b: 0 } },
      { roundNumber: 2, scores: { a: 1000, b: 900 } }
    ]);
    expect(new Set(result.commendationsWithWinners.map(item => item.commendation.id))).toEqual(new Set(allPossibleCommendations.map(item => item.id)));
  });
});
