import { describe, expect, it } from 'vitest';
import { scoreSeatingCommittee, seatingAccuracy, seatingDisplacement } from './seatingCommittee';

const certified = ['Moss', 'Pike', 'Vale', 'Frost', 'Reed'];

describe('Seating Committee', () => {
  it('measures every chair displacement proportionally', () => {
    expect(seatingDisplacement(certified, certified)).toBe(0);
    expect(seatingAccuracy(certified, certified)).toBe(1);
    expect(seatingAccuracy(['Reed', 'Frost', 'Vale', 'Pike', 'Moss'], certified)).toBe(0);
    expect(seatingAccuracy(['Moss', 'Pike', 'Vale', 'Reed', 'Frost'], certified)).toBeCloseTo(5 / 6);
  });

  it('combines exact arrangement accuracy with exact elapsed time', () => {
    expect(scoreSeatingCommittee(certified, certified, 0)).toBe(1000);
    expect(scoreSeatingCommittee(certified, certified, 45_000)).toBe(667);
    expect(scoreSeatingCommittee(['Moss', 'Pike', 'Vale', 'Reed', 'Frost'], certified, 0)).toBe(833);
    expect(scoreSeatingCommittee(certified, certified, 46_000)).toBeLessThan(scoreSeatingCommittee(certified, certified, 45_000));
  });

  it('rejects incomplete or duplicated seating plans', () => {
    expect(seatingAccuracy(['Moss'], certified)).toBe(0);
    expect(seatingAccuracy(['Moss', 'Moss', 'Vale', 'Frost', 'Reed'], certified)).toBe(0);
  });
});
