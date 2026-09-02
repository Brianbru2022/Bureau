import { describe, expect, it } from 'vitest';
import type { Player } from '../types';
import { resolveAssetScores } from './assets';

const player = (id: string) => ({ id } as Player);

describe('asset scoring', () => {
  it('applies score boosters and reports them consumed', () => {
    const result = resolveAssetScores(400, 'a', [player('a')], { a: ['SECOND_OPINION', 'DOUBLE_ENTRY'] }, 'EVERYONE_TAKES_A_TURN');
    expect(result.finalScores.a).toBe(608);
    expect(result.consumed.map(item => item.asset)).toEqual(['SECOND_OPINION', 'DOUBLE_ENTRY']);
  });

  it('keeps the strongest score booster bounded within the wider economy', () => {
    expect(resolveAssetScores(1000, 'a', [player('a')], { a: ['DOUBLE_ENTRY'] }, 'EVERYONE_TAKES_A_TURN').finalScores.a).toBe(1350);
  });

  it('pays insurance only on a failed risk', () => {
    expect(resolveAssetScores(0, 'a', [player('a')], { a: ['INSURANCE'] }, 'EVERYONE_TAKES_A_TURN', { riskedValue: 1000 }).finalScores.a).toBe(350);
    expect(resolveAssetScores(100, 'a', [player('a')], { a: ['INSURANCE'] }, 'EVERYONE_TAKES_A_TURN').finalScores.a).toBe(100);
  });

  it('transfers twenty percent to the first armed interceptor', () => {
    const result = resolveAssetScores(500, 'a', [player('a'), player('b')], { b: ['INTERCEPT'] }, 'EVERYONE_TAKES_A_TURN');
    expect(result.finalScores).toEqual({ a: 400, b: 100 });
  });

  it('does not permit interception in a shared round', () => {
    expect(resolveAssetScores({ a: 500 }, 'a', [player('a'), player('b')], { b: ['INTERCEPT'] }, 'SHARED_ROTATION').finalScores).toEqual({ a: 500 });
  });
});
