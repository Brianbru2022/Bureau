import { describe, expect, it } from 'vitest';
import { dispatchTotal, scoreDispatchAnswer } from './dispatchBox';

describe('Dispatch Box scoring', () => {
  it('rewards exact response time continuously for correct answers', () => {
    expect(scoreDispatchAnswer(true, 0)).toBe(200);
    expect(scoreDispatchAnswer(true, 5_000)).toBe(150);
    expect(scoreDispatchAnswer(true, 15_000)).toBe(100);
    expect(scoreDispatchAnswer(true, 6_000)).toBeLessThan(scoreDispatchAnswer(true, 5_000));
  });

  it('awards zero for an incorrect brief and totals the actual awards', () => {
    expect(scoreDispatchAnswer(false, 0)).toBe(0);
    expect(dispatchTotal([200, 150, 0, 100, 50])).toBe(500);
  });
});
