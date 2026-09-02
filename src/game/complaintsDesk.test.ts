import { describe, expect, it } from 'vitest';
import { complaintsDeskTimeCeiling, potentialComplaintsDeskScore, scoreComplaintsDesk } from './complaintsDesk';

describe('Complaints Desk scoring', () => {
  it('combines exact elapsed time and confidence without score bands', () => {
    expect(complaintsDeskTimeCeiling(0)).toBe(1000);
    expect(potentialComplaintsDeskScore(0, 50)).toBe(750);
    expect(potentialComplaintsDeskScore(15_000, 80)).toBe(800);
    expect(potentialComplaintsDeskScore(30_000, 80)).toBe(686);
  });

  it('changes continuously and awards nothing for an unsupported objection', () => {
    expect(potentialComplaintsDeskScore(11_000, 67)).toBeLessThan(potentialComplaintsDeskScore(10_000, 67));
    expect(potentialComplaintsDeskScore(10_000, 68)).toBeGreaterThan(potentialComplaintsDeskScore(10_000, 67));
    expect(scoreComplaintsDesk(5_000, 100, false)).toBe(0);
  });
});
