import { describe, expect, it } from 'vitest';
import type { Player } from '../types';
import { ALL_ROUND_TYPES } from './match';
import { buildPlayerDossier, createScoreProgressionPoints } from './dossier';

const player = {
  id: 'p-1', name: 'Ada', avatar: 'A', color: '#fff', department: 'Tests', score: 2_400, assets: [], influence: 1,
  secretDirective: { id:'directive', codeName:'TEST', title:'Directive', description:'Test it', targetMetric:'roundsPlayed', bonusPoints:200, isCompleted:true, progressText:'Filed' },
  stats: {
    roundsPlayed:17, correctAnswers:12, totalAnswers:17, bestScore:850, worstScore:0,
    mapDistancesKm:[94.2,18.4], estimateErrorsPercent:[14.8,2.6], risksTaken:2, successfulRisks:1,
    highestBankedList:600, categoriesAttempted:new Set(['History','Science']), interceptCount:0,
    challengeScores:[], mapScores:[], successfulListBanks:[], assetsUsed:[],
    categoryScores:{History:[420,720],Science:[500]}, successfulRiskScores:[640],
    roundScores:Object.fromEntries(ALL_ROUND_TYPES.map((type,index)=>[type,[100+index*20]]))
  }
} as Player;

describe('post-assessment dossier', () => {
  it('summarises all seventeen departments and the replay highlights', () => {
    const summary=buildPlayerDossier(player,[{roundNumber:1,scores:{'p-1':400}},{roundNumber:2,scores:{'p-1':900}}],[
      {challengeId:'q',playerId:'p-1',submittedAnswer:'filed',decision:'HOST_ACCEPTED',recordedAt:1},
      {challengeId:'other',playerId:'p-2',submittedAnswer:'other',decision:'AUTOMATIC',recordedAt:2}
    ]);
    expect(summary.departmentPerformance).toHaveLength(17);
    expect(summary.departmentPerformance.every(item=>item.attempts===1)).toBe(true);
    expect(summary.bestDepartment?.roundType).toBe('DISPATCH_BOX');
    expect(summary.bestChronology?.roundType).toBe('SEATING_COMMITTEE');
    expect(summary.strongestKnowledgeArea).toEqual({category:'History',averageScore:570});
    expect(summary.closestMapKm).toBe(18.4);
    expect(summary.closestEstimatePercent).toBe(2.6);
    expect(summary.strongestRiskScore).toBe(640);
    expect(summary.scoreProgression).toEqual([0,400,900,2400]);
    expect(summary.adjudications).toHaveLength(1);
  });

  it('creates a bounded accessible chart path', () => {
    expect(createScoreProgressionPoints([0,500,1000])).toBe('0.0,72.0 150.0,36.0 300.0,0.0');
  });
});
