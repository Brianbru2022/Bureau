import { describe, expect, it } from 'vitest';
import { ALL_ROUND_TYPES, areRoundsSimilar, composeAssessmentSchedule, createMatchConfig, createMatchConfigFromSchedule, createMatchState, FIRST_ASSESSMENT_ROUND_ORDER, matchReducer, miniGameBoundaries, politicsRoundIndices, ROUND_FAMILIES, ROUND_MOMENTUM } from './match';
import { seededRandom } from './progression';

describe('match configuration and reducer', () => {
  it('creates unique custom schedules between four and eight rounds', () => {
    const config = createMatchConfig('CUSTOM', ['TOP_10','TOP_10','THE_LIST','MISFILED_RECORDS','DISPATCH_BOX'], 45);
    expect(config.roundTypes).toEqual(['TOP_10','THE_LIST','MISFILED_RECORDS','DISPATCH_BOX']);
    expect(config.timerSeconds).toBe(45);
  });
  it('files a scoring pace and keeps the first assessment relaxed', () => {
    expect(createMatchConfigFromSchedule('QUICK', ['TOP_10','THE_LIST','RANK_IT','IMAGE_REVEAL'], 0, 'OFF', true, 'MIXED', 'RAPID').scorePaceProfile).toBe('RAPID');
    expect(createMatchConfigFromSchedule('FIRST', ['TOP_10','THE_LIST','RANK_IT','IMAGE_REVEAL'], 60, 'STANDARD', false, 'EXPERT', 'RAPID').scorePaceProfile).toBe('RELAXED');
  });
  it.each([['QUICK',4],['STANDARD',6],['FULL',8]] as const)('draws %s schedules randomly without duplicate departments', (preset, count) => {
    const first=createMatchConfig(preset,undefined,0,'OFF',true,'MIXED',seededRandom(11));
    const second=createMatchConfig(preset,undefined,0,'OFF',true,'MIXED',seededRandom(29));
    expect(first.roundTypes).toHaveLength(count);
    expect(new Set(first.roundTypes).size).toBe(count);
    expect(first.roundTypes.every(type=>ALL_ROUND_TYPES.includes(type))).toBe(true);
    expect(second.roundTypes).not.toEqual(first.roundTypes);
  });
  it('creates a protected first assessment with no pre-question systems', () => {
    const config=createMatchConfig('FIRST',undefined,60,'STANDARD',true,'EXPERT',seededRandom(12));
    expect(config.roundTypes).toEqual(FIRST_ASSESSMENT_ROUND_ORDER);
    expect(config.timerSeconds).toBe(0);
    expect(config.officePolitics).toBe(false);
    expect(config.politicsMode).toBe('OFF');
    expect(config.guidedMode).toBe(false);
    expect(config.difficultyProfile).toBe('ACCESSIBLE');
    expect(config.scorePaceProfile).toBe('RELAXED');
  });
  it('does not let a supplied itinerary reintroduce complex first-assessment departments', () => {
    const config=createMatchConfigFromSchedule('FIRST',['THE_LIST','STOP_THE_SCORE','PUT_UP_OR_SHUT_UP','MISSING_MINUTES'],45,'STANDARD',true,'EXPERT');
    expect(config.roundTypes).toEqual(FIRST_ASSESSMENT_ROUND_ORDER);
    expect(config.timerSeconds).toBe(0);
    expect(config.politicsMode).toBe('OFF');
  });
  it('can draw every promoted department into preset play', () => {
    const drawn=new Set(Array.from({length:80},(_,index)=>createMatchConfig('FULL',undefined,0,'OFF',true,'MIXED',seededRandom(index+1)).roundTypes).flat());
    expect(ALL_ROUND_TYPES.slice(8).every(type=>drawn.has(type))).toBe(true);
  });
  it.each([['QUICK',4,4],['STANDARD',6,5],['FULL',8,5]] as const)('balances the five play styles in %s schedules', (preset, _count, minimumFamilies) => {
    for (let seed=1; seed<=40; seed+=1) {
      const schedule=createMatchConfig(preset,undefined,0,'OFF',true,'MIXED',seededRandom(seed)).roundTypes;
      expect(new Set(schedule.map(type=>ROUND_FAMILIES[type])).size).toBeGreaterThanOrEqual(minimumFamilies);
    }
  });
  it('does not place mechanically similar departments next to each other', () => {
    for (let seed=1; seed<=100; seed+=1) {
      const schedule=composeAssessmentSchedule(8,seededRandom(seed));
      expect(schedule.slice(1).some((type,index)=>areRoundsSimilar(schedule[index],type))).toBe(false);
    }
  });
  it('shapes random assessments towards a stronger closing department',()=>{
    const schedules=Array.from({length:200},(_,index)=>composeAssessmentSchedule(6,seededRandom(index+1)));
    const opening=schedules.reduce((sum,schedule)=>sum+ROUND_MOMENTUM[schedule[0]],0)/schedules.length;
    const closing=schedules.reduce((sum,schedule)=>sum+ROUND_MOMENTUM[schedule.at(-1)!],0)/schedules.length;
    expect(closing).toBeGreaterThan(opening+.15);
  });
  it('avoids the previous assessment when enough other departments exist', () => {
    const previous=ALL_ROUND_TYPES.slice(0,8);
    const schedule=composeAssessmentSchedule(8,seededRandom(7),previous);
    expect(schedule.some(type=>previous.includes(type))).toBe(false);
  });
  it('uses fresh departments first when some previous departments must be reused', () => {
    const previous=ALL_ROUND_TYPES.slice(0,16);
    const schedule=composeAssessmentSchedule(4,seededRandom(7),previous);
    expect(schedule).toContain(ALL_ROUND_TYPES[16]);
    expect(new Set(schedule).size).toBe(4);
  });
  it('respects exclusions and gives favourites additional scheduling weight', () => {
    const preferences={favouriteRoundTypes:['DISPATCH_BOX'] as const,excludedRoundTypes:['TOP_10','THE_LIST'] as const};
    const schedules=Array.from({length:100},(_,index)=>composeAssessmentSchedule(4,seededRandom(index+1),[],{favouriteRoundTypes:[...preferences.favouriteRoundTypes],excludedRoundTypes:[...preferences.excludedRoundTypes]}));
    expect(schedules.flat()).not.toContain('TOP_10');
    expect(schedules.flat()).not.toContain('THE_LIST');
    const favouriteAppearances=schedules.filter(schedule=>schedule.includes('DISPATCH_BOX')).length;
    const neutralAppearances=schedules.filter(schedule=>schedule.includes('COMPLAINTS_DESK')).length;
    expect(favouriteAppearances).toBeGreaterThan(neutralAppearances);
  });
  it('preserves an approved itinerary exactly when the game starts', () => {
    const itinerary: typeof ALL_ROUND_TYPES=['DISPATCH_BOX','WHERE_IN_BRITAIN','MISSING_MINUTES','STOP_THE_SCORE'];
    expect(createMatchConfigFromSchedule('QUICK',itinerary).roundTypes).toEqual(itinerary);
  });
  it('keeps a custom host order even when those departments were recently played', () => {
    const selected=ALL_ROUND_TYPES.slice(3,9);
    expect(createMatchConfig('CUSTOM',selected,0,'OFF',true,'MIXED',seededRandom(1),selected).roundTypes).toEqual(selected);
  });
  it.each([[4,[2]],[6,[2,4]],[8,[3,5]]] as const)('places mini-games proportionally for %i rounds', (count, expected) => {
    expect([...miniGameBoundaries(count)]).toEqual(expected);
  });
  it('keeps the opening round free of politics and makes Light mode intermittent',()=>{
    expect([...politicsRoundIndices('OFF',8)]).toEqual([]);
    expect([...politicsRoundIndices('LIGHT',6)]).toEqual([2,4]);
    expect([...politicsRoundIndices('STANDARD',4)]).toEqual([1,2,3]);
  });
  it('advances deterministically and records host decisions', () => {
    const initial = createMatchState(createMatchConfig('QUICK'));
    const advanced = matchReducer(initial, { type:'ADVANCE_ROUND', starterIndex:1 });
    const recorded = matchReducer(advanced, { type:'RECORD_ADJUDICATION', record:{ challengeId:'q', playerId:'p-1', submittedAnswer:'x', decision:'HOST_REJECTED', recordedAt:1 } });
    expect(recorded.currentRoundIndex).toBe(1);
    expect(recorded.roundStarterIndex).toBe(1);
    expect(recorded.adjudicationHistory).toHaveLength(1);
  });
  it('reverses only the latest active ruling for the current challenge', () => {
    const initial=createMatchState(createMatchConfig('QUICK'));
    const first=matchReducer(initial,{type:'RECORD_ADJUDICATION',record:{challengeId:'q-1',playerId:'p-1',submittedAnswer:'first',decision:'HOST_ACCEPTED',reason:'Host accepted it.',recordedAt:1}});
    const second=matchReducer(first,{type:'RECORD_ADJUDICATION',record:{challengeId:'q-1',playerId:'p-1',submittedAnswer:'second',decision:'HOST_REJECTED',reason:'Host rejected it.',recordedAt:2}});
    const other=matchReducer(second,{type:'RECORD_ADJUDICATION',record:{challengeId:'q-2',playerId:'p-1',submittedAnswer:'other',decision:'AUTOMATIC',reason:'Exact match.',recordedAt:3}});
    const reversed=matchReducer(other,{type:'REVERSE_LAST_ADJUDICATION',challengeId:'q-1',reversedAt:4});
    expect(reversed.adjudicationHistory.map(record=>record.reversedAt)).toEqual([undefined,4,undefined]);
    expect(matchReducer(reversed,{type:'REVERSE_LAST_ADJUDICATION',challengeId:'missing',reversedAt:5})).toBe(reversed);
  });
  it.each([1,2,4])('completes an eight-round reducer journey for %i candidate(s)', playerCount => {
    let state=createMatchState(createMatchConfig('FULL'));
    for(let round=0;round<8;round+=1){
      for(let player=0;player<playerCount;player+=1)state=matchReducer(state,{type:'ADVANCE_PLAYER'});
      if(round<7)state=matchReducer(state,{type:'ADVANCE_ROUND',starterIndex:(round+1)%playerCount});
    }
    expect(state.currentRoundIndex).toBe(7);
    expect(state.playersCompletedThisRound).toBe(playerCount);
  });
  it('supports off, light and standard politics configurations',()=>{
    expect(createMatchConfig('QUICK',undefined,0,'OFF').officePolitics).toBe(false);
    expect(createMatchConfig('QUICK',undefined,0,'LIGHT').politicsMode).toBe('LIGHT');
    expect(createMatchConfig('QUICK',undefined,0,'STANDARD').officePolitics).toBe(true);
  });
  it('stores the selected question difficulty profile',()=>{
    expect(createMatchConfig('STANDARD',undefined,0,'OFF',true,'ACCESSIBLE').difficultyProfile).toBe('ACCESSIBLE');
    expect(createMatchConfig('STANDARD',undefined,0,'OFF',true,'EXPERT').difficultyProfile).toBe('EXPERT');
  });
});
