import { describe, expect, it } from 'vitest';
import { allChallenges } from '../data/questions';
import { VISUAL_ASSET_MANIFEST } from '../data/visualAssetManifest';
import { DEPARTMENT_SOUND_FAMILIES } from '../sound/audioEngine';
import { ROUND_GUIDANCE } from './roundGuidance';
import { createMatchConfig, createMatchState, matchReducer } from './match';
import { hasAnotherCandidateTurn } from './progression';
import { PROMOTED_ROUND_TYPES, roundDefinitionFor } from './roundCatalog';
import { rivalryThreshold } from './rivalry';

describe('promoted department normal-play certification', () => {
  it('registers every promoted department with challenges, guidance, artwork, sound and politics', () => {
    expect(PROMOTED_ROUND_TYPES).toHaveLength(9);
    expect(new Set(PROMOTED_ROUND_TYPES).size).toBe(9);

    for (const roundType of PROMOTED_ROUND_TYPES) {
      expect(roundDefinitionFor(roundType).type).toBe(roundType);
      expect(allChallenges.filter(challenge => challenge.roundType === roundType), roundType).toHaveLength(25);
      expect(ROUND_GUIDANCE[roundType].participation.trim(), roundType).not.toBe('');
      expect(Object.keys(VISUAL_ASSET_MANIFEST[roundType]), roundType).toEqual([
        'IDLE', 'ACTIVE', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'RESULT',
      ]);
      expect(DEPARTMENT_SOUND_FAMILIES[roundType], roundType).toBeDefined();
      expect(rivalryThreshold(roundType).value, roundType).toBeGreaterThan(0);
    }
  });

  it.each([1, 2, 4])('completes promoted schedules with correct turn counts for %i candidate(s)', playerCount => {
    const schedules = [PROMOTED_ROUND_TYPES.slice(0, 8), [PROMOTED_ROUND_TYPES[8], 'TOP_10', 'THE_LIST', 'RANK_IT'] as const];
    const completedTypes: string[] = [];

    for (const scheduledRounds of schedules) {
      const config = createMatchConfig('CUSTOM', [...scheduledRounds]);
      let state = createMatchState(config);

      config.roundTypes.forEach((roundType, roundIndex) => {
        const definition = roundDefinitionFor(roundType);
        let attemptCount = 1;
        while (hasAnotherCandidateTurn(definition.participationMode, attemptCount - 1, playerCount)) {
          state = matchReducer(state, { type: 'ADVANCE_PLAYER' });
          attemptCount += 1;
        }

        expect(attemptCount, roundType).toBe(definition.participationMode === 'EVERYONE_TAKES_A_TURN' ? playerCount : 1);
        completedTypes.push(roundType);
        if (roundIndex < config.roundTypes.length - 1) state = matchReducer(state, { type: 'ADVANCE_ROUND', starterIndex: (roundIndex + 1) % playerCount });
      });

      expect(state.currentRoundIndex).toBe(config.roundTypes.length - 1);
    }

    expect(PROMOTED_ROUND_TYPES.every(roundType => completedTypes.includes(roundType))).toBe(true);
  });

  it('clears a paused timer when a candidate or department advances', () => {
    const config = createMatchConfig('CUSTOM', PROMOTED_ROUND_TYPES.slice(0, 4), 30);
    const paused = matchReducer(createMatchState(config), { type: 'SET_TIMER_PAUSED', paused: true });
    expect(paused.timerPaused).toBe(true);
    expect(matchReducer(paused, { type: 'ADVANCE_PLAYER' }).timerPaused).toBe(false);
    expect(matchReducer(paused, { type: 'ADVANCE_ROUND', starterIndex: 1 }).timerPaused).toBe(false);
  });
});
