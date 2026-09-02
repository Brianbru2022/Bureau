import { describe, expect, it } from 'vitest';
import { potentialMissingMinutesScore, scoreMissingMinutes } from './missingMinutes';

describe('Missing Minutes continuous scoring', () => {
  it('decays smoothly according to exact viewing time rather than score bands', () => {
    expect(potentialMissingMinutesScore(0)).toBe(1000);
    expect(potentialMissingMinutesScore(5_000)).toBe(900);
    expect(potentialMissingMinutesScore(10_000)).toBe(818);
    expect(potentialMissingMinutesScore(30_000)).toBe(600);
    expect(potentialMissingMinutesScore(30_500)).toBeLessThan(potentialMissingMinutesScore(30_000));
  });

  it('awards the time-derived value only for a correct recollection', () => {
    expect(scoreMissingMinutes(12_345, true)).toBe(potentialMissingMinutesScore(12_345));
    expect(scoreMissingMinutes(12_345, false)).toBe(0);
  });
});
