import { describe, expect, it } from 'vitest';
import { scoreMisfiledRecords, potentialMisfiledScore, shuffleMisfiledRecords } from './misfiledRecords';

describe('Misfiled Records scoring', () => {
  it('reduces the available score as clues are disclosed', () => {
    expect([0, 1, 2].map(potentialMisfiledScore)).toEqual([1000, 760, 520]);
  });

  it('rewards both pieces of the deduction independently', () => {
    expect(scoreMisfiledRecords(0, true, true)).toBe(1000);
    expect(scoreMisfiledRecords(0, true, false)).toBe(650);
    expect(scoreMisfiledRecords(0, false, true)).toBe(350);
    expect(scoreMisfiledRecords(0, false, false)).toBe(0);
  });

  it('applies the clue reduction to partial answers', () => {
    expect(scoreMisfiledRecords(2, true, true)).toBe(520);
    expect(scoreMisfiledRecords(2, true, false)).toBe(338);
  });

  it('shuffles record positions without mutating the filed source', () => {
    const source = ['a', 'b', 'c', 'd', 'e'];
    expect(shuffleMisfiledRecords(source, () => 0)).toEqual(['b', 'c', 'd', 'e', 'a']);
    expect(source).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
