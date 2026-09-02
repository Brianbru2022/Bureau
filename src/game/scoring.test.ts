import { describe, expect, it } from 'vitest';
import { top10Challenges } from '../data/questions';
import { calibrateDepartmentScore, clampScore, getTop10ItemScores, scoreBidSuccess, scoreEstimate, scoreImageReveal, scoreListProgress, scoreMapDistance, scoreRanking } from './scoring';

describe('scoring rules', () => {
  it('clamps invalid and out-of-range values', () => {
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(1500)).toBe(1000);
  });

  it('rewards better estimates and map guesses', () => {
    expect(scoreEstimate(0)).toBe(1000);
    expect(scoreEstimate(10)).toBeGreaterThan(scoreEstimate(50));
    expect(scoreMapDistance(5)).toBeGreaterThan(scoreMapDistance(500));
  });

  it('makes list and bidding progress monotonic', () => {
    expect(scoreListProgress(1, 10)).toBeLessThan(scoreListProgress(9, 10));
    expect(scoreListProgress(10, 10)).toBe(1000);
    expect(scoreBidSuccess(2, 10)).toBeLessThan(scoreBidSuccess(8, 10));
  });

  it('normalises the Top 10 board for solo and shared play', () => {
    const solo = Object.values(getTop10ItemScores(top10Challenges[0], 1)).reduce((sum, score) => sum + score, 0);
    const fourPlayer = Object.values(getTop10ItemScores(top10Challenges[0], 4)).reduce((sum, score) => sum + score, 0);
    expect(solo).toBeCloseTo(1000, -1);
    expect(fourPlayer).toBeCloseTo(2000, -1);
    expect(fourPlayer).toBeLessThan(solo * 2.05);
  });

  it('reduces image score as more is revealed', () => {
    expect(scoreImageReveal('case', 0)).toBeGreaterThan(scoreImageReveal('case', 3));
  });

  it('awards a perfect ranking in full', () => {
    expect(scoreRanking([
      { id: 'a', label: 'A', correctRank: 1, detail: '' },
      { id: 'b', label: 'B', correctRank: 2, detail: '' }
    ])).toBe(1000);
  });

  it('calibrates exact performance continuously rather than into score categories',()=>{
    const awards=[401,402,417].map(score=>calibrateDepartmentScore('DISPATCH_BOX',score));
    expect(awards[0]).toBeLessThan(awards[1]);
    expect(awards[1]).toBeLessThan(awards[2]);
    expect(new Set(awards).size).toBe(3);
  });

  it('preserves the endpoints of every department curve',()=>{
    expect(calibrateDepartmentScore('TOP_10',0)).toBe(0);
    expect(calibrateDepartmentScore('TOP_10',1000)).toBe(1000);
    expect(calibrateDepartmentScore('PUT_UP_OR_SHUT_UP',0)).toBe(0);
    expect(calibrateDepartmentScore('PUT_UP_OR_SHUT_UP',1000)).toBe(1000);
  });
});
