import { describe, expect, it } from 'vitest';
import type { Player, PlayerStats } from '../types';
import { evaluateSecretDirective } from './directives';

const baseStats = (): PlayerStats => ({
  roundsPlayed: 0, correctAnswers: 0, totalAnswers: 0, bestScore: 0, worstScore: 0,
  mapDistancesKm: [], estimateErrorsPercent: [], risksTaken: 0, successfulRisks: 0,
  highestBankedList: 0, categoriesAttempted: new Set(), interceptCount: 0,
  challengeScores: [], mapScores: [], successfulListBanks: [], categoryScores: {}, assetsUsed: []
});

const candidate = (directiveId: string, stats: Partial<PlayerStats>): Player => ({
  id: 'candidate', name: 'Candidate', avatar: 'A', color: '#000', department: 'Tests', score: 0, assets: [],
  secretDirective: { id: directiveId, codeName: '', title: '', description: '', targetMetric: '', bonusPoints: 0, isCompleted: false, progressText: '' },
  stats: { ...baseStats(), ...stats }
});

describe('secret directive evaluators', () => {
  it.each<[string, Partial<PlayerStats>]>([
    ['dir-gambler', { challengeScores: [850, 900] }],
    ['dir-cartographer', { mapScores: [750] }],
    ['dir-opportunist', { interceptCount: 1 }],
    ['dir-generalist', { categoryScores: { a: [1], b: [2], c: [3], d: [4] } }],
    ['dir-specialist', { challengeScores: [920] }],
    ['dir-survivor', { successfulListBanks: [600] }],
    ['dir-conservative', { totalAnswers: 10, correctAnswers: 8 }],
    ['dir-precisionist', { estimateErrorsPercent: [11.9] }]
  ])('completes %s when its threshold is met', (id, stats) => {
    expect(evaluateSecretDirective(candidate(id, stats)).completed).toBe(true);
  });

  it('does not complete an unknown directive', () => {
    expect(evaluateSecretDirective(candidate('unknown', {})).completed).toBe(false);
  });
});
