import { describe, expect, it } from 'vitest';
import { potentialComplaintsDeskScore } from './complaintsDesk';
import { potentialChainOfCommandScore } from './chainOfCommand';
import { scoreDispatchAnswer } from './dispatchBox';
import { potentialMissingMinutesScore } from './missingMinutes';
import { scoreSeatingCommittee } from './seatingCommittee';
import { scoringElapsedMs } from './scorePacing';

describe('continuous scoring pace profiles', () => {
  it('removes reading-speed loss in Relaxed without creating score bands', () => {
    expect(scoringElapsedMs(91_234, 'RELAXED')).toBe(0);
    expect(potentialComplaintsDeskScore(0, 80, 'RELAXED')).toBe(potentialComplaintsDeskScore(91_234, 80, 'RELAXED'));
    expect(potentialChainOfCommandScore(0, 'RELAXED')).toBe(potentialChainOfCommandScore(91_234, 'RELAXED'));
    expect(potentialMissingMinutesScore(0, 'RELAXED')).toBe(potentialMissingMinutesScore(91_234, 'RELAXED'));
    expect(scoreDispatchAnswer(true, 0, 'RELAXED')).toBe(scoreDispatchAnswer(true, 91_234, 'RELAXED'));
  });

  it('keeps Standard gentler than Rapid at the same exact elapsed time', () => {
    const correctOrder = ['A', 'B', 'C', 'D', 'E'];
    expect(potentialComplaintsDeskScore(30_000, 80, 'STANDARD')).toBeGreaterThan(potentialComplaintsDeskScore(30_000, 80, 'RAPID'));
    expect(potentialChainOfCommandScore(30_000, 'STANDARD')).toBeGreaterThan(potentialChainOfCommandScore(30_000, 'RAPID'));
    expect(potentialMissingMinutesScore(30_000, 'STANDARD')).toBeGreaterThan(potentialMissingMinutesScore(30_000, 'RAPID'));
    expect(scoreDispatchAnswer(true, 10_000, 'STANDARD')).toBeGreaterThan(scoreDispatchAnswer(true, 10_000, 'RAPID'));
    expect(scoreSeatingCommittee(correctOrder, correctOrder, 30_000, 'STANDARD')).toBeGreaterThan(scoreSeatingCommittee(correctOrder, correctOrder, 30_000, 'RAPID'));
  });

  it('keeps exact elapsed time rather than reducing it to categories', () => {
    expect(potentialChainOfCommandScore(30_001, 'STANDARD')).toBeLessThanOrEqual(potentialChainOfCommandScore(30_000, 'STANDARD'));
    expect(potentialMissingMinutesScore(30_001, 'RAPID')).toBeLessThanOrEqual(potentialMissingMinutesScore(30_000, 'RAPID'));
    expect(scoringElapsedMs(30_001, 'STANDARD')).toBeGreaterThan(scoringElapsedMs(30_000, 'STANDARD'));
  });
});
