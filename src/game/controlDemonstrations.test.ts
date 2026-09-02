import { describe, expect, it } from 'vitest';
import { ALL_ROUND_TYPES } from './match';
import { CONTROL_DEMONSTRATIONS } from './controlDemonstrations';

describe('first-use control demonstrations', () => {
  it('covers every playable department with three concise actions', () => {
    expect(Object.keys(CONTROL_DEMONSTRATIONS).sort()).toEqual([...ALL_ROUND_TYPES].sort());
    ALL_ROUND_TYPES.forEach(roundType => {
      const demonstration = CONTROL_DEMONSTRATIONS[roundType];
      expect(demonstration.action.length).toBeGreaterThan(4);
      expect(demonstration.steps).toHaveLength(3);
      demonstration.steps.forEach(step => expect(step.length).toBeGreaterThan(8));
    });
  });
});
