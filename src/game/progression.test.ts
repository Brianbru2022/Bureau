import { describe, expect, it } from 'vitest';
import type { Player } from '../types';
import { applyScoreDeltas, findTrailingPlayers, nextStarterIndex, seededRandom, selectReviewCandidate } from './progression';

const player = (id: string, score: number) => ({ id, name: id, score } as Player);

describe('game progression', () => {
  it('finds the true trailing player when every score is positive', () => {
    expect(selectReviewCandidate([player('a', 900), player('b', 250), player('c', 600)])?.id).toBe('b');
  });

  it('preserves every tied trailing player and selects by seat order', () => {
    const result = findTrailingPlayers([player('a', 100), player('b', 100), player('c', 500)]);
    expect(result?.players.map(item => item.id)).toEqual(['a', 'b']);
    expect(selectReviewCandidate(result!.players)?.id).toBe('a');
  });

  it('handles a genuine zero score', () => {
    expect(selectReviewCandidate([player('a', 300), player('b', 0)])?.id).toBe('b');
  });

  it.each([1, 2, 3, 4])('rotates starters for %i players', count => {
    expect(nextStarterIndex(count, count + 1)).toBe((count + 1) % count);
  });

  it.each([1, 2, 4])('can deterministically traverse complete presets with %i player(s)', playerCount => {
    [4, 6, 8].forEach(roundLimit => {
      const starters = Array.from({ length: roundLimit }, (_, round) => nextStarterIndex(playerCount, round));
      expect(starters).toHaveLength(roundLimit);
      expect(starters.every(index => index >= 0 && index < playerCount)).toBe(true);
      expect(starters.at(-1)).toBe((roundLimit - 1) % playerCount);
    });
  });

  it('honours a valid priority starter and rejects an invalid one', () => {
    expect(nextStarterIndex(4, 3, 1)).toBe(1);
    expect(nextStarterIndex(4, 3, 7)).toBe(3);
  });

  it('applies positive and negative deltas without allowing negative totals', () => {
    const updated = applyScoreDeltas([player('a', 100), player('b', 20)], { a: 50, b: -100 });
    expect(updated.map(item => item.score)).toEqual([150, 0]);
  });

  it('provides repeatable seeded randomness', () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});
