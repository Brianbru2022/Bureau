import { describe, expect, it } from 'vitest';
import { potentialRedactedScore, scoreRedactedRecords } from './redactedRecords';

describe('Redacted Records scoring', () => {
  it('reduces the maximum for every declassified line', () => {
    expect([1,2,3,4].map(potentialRedactedScore)).toEqual([1000,760,520,300]);
  });
  it('awards the current maximum only for a correct identification', () => {
    expect(scoreRedactedRecords(1,true)).toBe(1000);
    expect(scoreRedactedRecords(4,true)).toBe(300);
    expect(scoreRedactedRecords(1,false)).toBe(0);
  });
});
