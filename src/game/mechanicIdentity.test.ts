import { describe, expect, it } from 'vitest';
import { MECHANIC_IDENTITIES } from './mechanicIdentity';

const GROUPS = {
  ORDERING: ['RANK_IT', 'SEATING_COMMITTEE', 'CHAIN_OF_COMMAND'],
  REVEAL: ['IMAGE_REVEAL', 'REDACTED_RECORDS', 'MISSING_MINUTES'],
  OPEN_REGISTER: ['TOP_10', 'PUT_UP_OR_SHUT_UP', 'THE_LIST'],
} as const;

describe('overlapping department identities', () => {
  it('gives every related quiz department an explicit operating contract', () => {
    for (const [family, roundTypes] of Object.entries(GROUPS)) {
      for (const roundType of roundTypes) {
        const identity = MECHANIC_IDENTITIES[roundType];
        expect(identity, roundType).toBeDefined();
        expect(identity?.family).toBe(family);
        expect(identity?.action.length).toBeGreaterThan(8);
        expect(identity?.pressure.length).toBeGreaterThan(8);
        expect(identity?.finish.length).toBeGreaterThan(8);
      }
    }
  });

  it('does not disguise one repeated mechanic with different department names', () => {
    for (const roundTypes of Object.values(GROUPS)) {
      const identities = roundTypes.map(roundType => MECHANIC_IDENTITIES[roundType]!);
      expect(new Set(identities.map(identity => identity.doctrine)).size).toBe(3);
      expect(new Set(identities.map(identity => identity.action)).size).toBe(3);
      expect(new Set(identities.map(identity => identity.pressure)).size).toBe(3);
      expect(new Set(identities.map(identity => identity.finish)).size).toBe(3);
      expect(new Set(identities.map(identity => identity.diagram)).size).toBe(3);
    }
  });
});
