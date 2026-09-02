import { beforeEach,describe,expect,it,vi } from 'vitest';
import type { Challenge, Player } from '../types';
import { createMatchConfig, createMatchState } from './match';
import { consumeLoadNotice, loadDepartmentPreferences, loadGame, loadRecentAssessmentDepartments, loadRecentChallengeIds, loadRecentDepartmentIds, rememberAssessmentDepartments, rememberChallenge, saveDepartmentPreferences, saveGame } from './session';

const store=new Map<string,string>();
beforeEach(()=>{store.clear();vi.stubGlobal('localStorage',{getItem:(key:string)=>store.get(key)??null,setItem:(key:string,value:string)=>store.set(key,value),removeItem:(key:string)=>store.delete(key)});});

describe('session v4 migration',()=>{
  it('round-trips the complete reducer state including armed assets and final-case progress',()=>{
    const state=createMatchState(createMatchConfig('QUICK'));
    const candidate={id:'p-1',name:'A',avatar:'A',color:'#000',department:'Tests',score:321,influence:2,assets:[],secretDirective:{id:'d',codeName:'D',title:'D',description:'D',targetMetric:'D',bonusPoints:100,isCompleted:false,progressText:'D'},stats:{roundsPlayed:1,correctAnswers:1,totalAnswers:1,bestScore:321,worstScore:321,mapDistancesKm:[],estimateErrorsPercent:[],risksTaken:0,successfulRisks:0,highestBankedList:0,categoriesAttempted:new Set(['Test']),interceptCount:0,challengeScores:[321],mapScores:[],successfulListBanks:[],categoryScores:{Test:[321]},assetsUsed:[]}} as Player;
    const savedState={...state,phase:'FINAL_CASE' as const,players:[candidate],selectedPlayerCount:1,currentChallengeId:'q-current',armedAssets:{'p-1':['DOUBLE_ENTRY' as const]},finalCaseIndex:1};
    saveGame({version:4,savedAt:123,state:savedState});
    const loaded=loadGame();
    expect(loaded?.savedAt).toBe(123);
    expect(loaded?.state.armedAssets).toEqual({'p-1':['DOUBLE_ENTRY']});
    expect(loaded?.state.finalCaseIndex).toBe(1);
    expect(loaded?.state.players[0].stats.categoriesAttempted).toEqual(new Set(['Test']));
  });
  it('migrates a valid v1 game into the current reducer state',()=>{
    store.set('the-bureau.active-game.v1',JSON.stringify({version:1,phase:'PLAYING_ROUND',preset:'QUICK',roundLimit:4,players:[{id:'p-1',name:'A',score:55,assets:[],stats:{categoriesAttempted:[]}}]}));
    const loaded=loadGame();
    expect(loaded?.version).toBe(4);
    expect(loaded?.state.players[0].score).toBe(55);
    expect(store.has('the-bureau.active-game.v4')).toBe(true);
  });
  it('migrates a valid v2 committee-free game with politics disabled',()=>{
    store.set('the-bureau.active-game.v2',JSON.stringify({version:2,phase:'ROOM_TRANSITION',preset:'QUICK',roundLimit:4,selectedPlayerCount:2,currentRoundIndex:0,roundStarterIndex:0,playersCompletedThisRound:0,usedChallengeIdsThisRound:[],currentChallengeId:null,hiddenCommendations:[],scoreHistory:[],bureauReviewUsed:false,priorityStarterPlayerId:null,miniGameType:null,miniGamesPlayed:[],timerPaused:false,adjudicationHistory:[],players:[{id:'p-1',name:'A',score:0,assets:[],stats:{categoriesAttempted:[]}}]}));
    const loaded=loadGame();expect(loaded?.version).toBe(4);expect(loaded?.state.config.officePolitics).toBe(false);expect(loaded?.state.config.politicsMode).toBe('OFF');expect(loaded?.state.config.guidedMode).toBe(true);expect(loaded?.state.config.difficultyProfile).toBe('MIXED');expect(loaded?.state.config.scorePaceProfile).toBe('STANDARD');expect(loaded?.state.players[0].influence).toBe(1);
  });
  it('restores a saved committee window',()=>{
    const base={version:3,phase:'COMMITTEE',preset:'QUICK',roundLimit:4,selectedPlayerCount:2,currentRoundIndex:0,roundStarterIndex:0,playersCompletedThisRound:0,usedChallengeIdsThisRound:[],currentChallengeId:null,hiddenCommendations:[],scoreHistory:[],bureauReviewUsed:false,priorityStarterPlayerId:null,miniGameType:null,miniGamesPlayed:[],timerPaused:false,adjudicationHistory:[],matchConfig:{preset:'QUICK',roundTypes:['TOP_10','THE_LIST','RANK_IT','IMAGE_REVEAL'],timerSeconds:0,officePolitics:true},committeePredictions:[{playerId:'p-2',targetPlayerId:'p-1',stance:'BACK',motion:'NONE'}],freeMotionPlayerId:null,rivalryTargetScore:null,rivalryOutcomes:[],players:[{id:'p-1',name:'A',score:0,influence:1,assets:[],stats:{categoriesAttempted:[]}}]};
    store.set('the-bureau.active-game.v3',JSON.stringify(base));expect(loadGame()?.state.committeePredictions).toHaveLength(1);
  });
  it('restores a promoted department schedule and active challenge',()=>{
    const base={version:3,phase:'PLAYING_ROUND',preset:'QUICK',roundLimit:4,selectedPlayerCount:1,currentRoundIndex:0,roundStarterIndex:0,playersCompletedThisRound:0,usedChallengeIdsThisRound:['redacted-bletchley'],currentChallengeId:'redacted-bletchley',hiddenCommendations:[],scoreHistory:[],bureauReviewUsed:false,priorityStarterPlayerId:null,miniGameType:null,miniGamesPlayed:[],timerPaused:true,adjudicationHistory:[],matchConfig:{preset:'QUICK',roundTypes:['REDACTED_RECORDS','MISSING_MINUTES','COMPLAINTS_DESK','DISPATCH_BOX'],timerSeconds:30,officePolitics:false,politicsMode:'OFF',guidedMode:true,difficultyProfile:'MIXED'},committeePredictions:[],freeMotionPlayerId:null,rivalryTargetScore:null,rivalryOutcomes:[],players:[{id:'p-1',name:'A',score:0,influence:1,assets:[],stats:{categoriesAttempted:[]}}]};
    store.set('the-bureau.active-game.v3',JSON.stringify(base));const loaded=loadGame();expect(loaded?.state.config.roundTypes).toEqual(base.matchConfig.roundTypes);expect(loaded?.state.currentChallengeId).toBe('redacted-bletchley');expect(loaded?.state.timerPaused).toBe(true);
  });
  it('discards malformed saves and provides a clear recovery notice',()=>{
    store.set('the-bureau.active-game.v4','{not valid json');expect(loadGame()).toBeNull();expect(store.has('the-bureau.active-game.v4')).toBe(false);expect(consumeLoadNotice()).toMatch(/damaged Bureau save/i);
  });
});

describe('recent assessment departments',()=>{
  it('remembers the last completed assessment without duplicates',()=>{
    rememberAssessmentDepartments(['TOP_10','THE_LIST','TOP_10']);
    expect(loadRecentDepartmentIds()).toEqual(['TOP_10','THE_LIST']);
  });
  it('ignores damaged and unknown department history',()=>{
    store.set('the-bureau.recent-departments.v1',JSON.stringify(['TOP_10','NOT_A_ROUND',42]));
    expect(loadRecentDepartmentIds()).toEqual(['TOP_10']);
    store.set('the-bureau.recent-departments.v1','broken');
    expect(loadRecentDepartmentIds()).toEqual([]);
  });
  it('preserves the previous two completed assessments',()=>{
    rememberAssessmentDepartments(['TOP_10','THE_LIST']);
    rememberAssessmentDepartments(['RANK_IT','IMAGE_REVEAL']);
    rememberAssessmentDepartments(['DISPATCH_BOX','PUBLIC_ENQUIRY']);
    expect(loadRecentAssessmentDepartments()).toEqual([['DISPATCH_BOX','PUBLIC_ENQUIRY'],['RANK_IT','IMAGE_REVEAL']]);
    expect(loadRecentDepartmentIds()).toEqual(['DISPATCH_BOX','PUBLIC_ENQUIRY','RANK_IT','IMAGE_REVEAL']);
  });
});

describe('department replay preferences',()=>{
  it('stores mutually exclusive favourites and bounded exclusions',()=>{
    const stored=saveDepartmentPreferences({favouriteRoundTypes:['TOP_10','THE_LIST'],excludedRoundTypes:['TOP_10','RANK_IT']});
    expect(stored).toEqual({favouriteRoundTypes:['THE_LIST'],excludedRoundTypes:['TOP_10','RANK_IT']});
    expect(loadDepartmentPreferences()).toEqual(stored);
  });
  it('recovers safely from damaged preferences',()=>{
    store.set('the-bureau.department-preferences.v1','broken');
    expect(loadDepartmentPreferences()).toEqual({favouriteRoundTypes:[],excludedRoundTypes:[]});
  });
});

describe('recent challenge history',()=>{
  it('retains a deep deduplicated history across consecutive assessments',()=>{
    for(let index=0;index<85;index+=1)rememberChallenge({id:`challenge-${index}`} as Challenge);
    rememberChallenge({id:'challenge-20'} as Challenge);
    const recent=loadRecentChallengeIds();
    expect(recent).toHaveLength(80);
    expect(recent[0]).toBe('challenge-20');
    expect(new Set(recent).size).toBe(80);
  });
});
