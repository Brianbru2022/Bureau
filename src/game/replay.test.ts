import { describe, expect, it } from 'vitest';
import { createMatchConfigFromSchedule } from './match';
import { seededRandom } from './progression';
import { createReplayMatchConfig } from './replay';

describe('same-candidate replay', () => {
  it('keeps match settings while drawing a fresh itinerary', () => {
    const previous=createMatchConfigFromSchedule('FULL',['WHERE_IN_BRITAIN','TOP_10','PUT_UP_OR_SHUT_UP','THE_LIST','CLOSEST_WINS','RANK_IT','IMAGE_REVEAL','STOP_THE_SCORE'],45,'LIGHT',false,'EXPERT','RAPID');
    const replay=createReplayMatchConfig(previous,previous.roundTypes,{favouriteRoundTypes:['DISPATCH_BOX'],excludedRoundTypes:['PUBLIC_ENQUIRY']},seededRandom(19));
    expect(replay.roundTypes).toHaveLength(8);
    expect(replay.roundTypes).not.toEqual(previous.roundTypes);
    expect(replay.roundTypes.some(type=>previous.roundTypes.includes(type))).toBe(false);
    expect(replay.roundTypes).not.toContain('PUBLIC_ENQUIRY');
    expect(replay.timerSeconds).toBe(45);
    expect(replay.politicsMode).toBe('LIGHT');
    expect(replay.guidedMode).toBe(false);
    expect(replay.difficultyProfile).toBe('EXPERT');
    expect(replay.scorePaceProfile).toBe('RAPID');
  });

  it('draws a new custom-length assessment rather than reusing its order', () => {
    const previous=createMatchConfigFromSchedule('CUSTOM',['TOP_10','THE_LIST','RANK_IT','IMAGE_REVEAL','DISPATCH_BOX']);
    const replay=createReplayMatchConfig(previous,previous.roundTypes,{favouriteRoundTypes:[],excludedRoundTypes:[]},seededRandom(3));
    expect(replay.preset).toBe('CUSTOM');
    expect(replay.roundTypes).toHaveLength(5);
    expect(replay.roundTypes).not.toEqual(previous.roundTypes);
  });
});
