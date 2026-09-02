import { describe, expect, it } from 'vitest';
import { markArtworkUnavailable, resolveRoundVisualState, type ApparatusSignal } from './visualState';

describe('apparatus presentation states', () => {
  it.each([
    ['WAITING', 'IDLE'],
    ['INPUT_ENABLED', 'ACTIVE'],
    ['SUBMITTED', 'PROCESSING'],
    ['ANSWER_ACCEPTED', 'ACCEPTED'],
    ['ANSWER_REJECTED', 'REJECTED'],
    ['SHOW_RESULT', 'RESULT'],
  ] as const)('maps %s to %s', (signal, expected) => {
    expect(resolveRoundVisualState(signal as ApparatusSignal)).toBe(expected);
  });

  it('hides failed decorative artwork without altering the apparatus', () => {
    const image = { hidden: false };
    markArtworkUnavailable(image as HTMLImageElement);
    expect(image.hidden).toBe(true);
  });
});
