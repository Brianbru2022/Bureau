import { describe, expect, it } from 'vitest';
import type { Player, PlayerStats, SecretDirective } from '../types';
import { createMatchConfig, createMatchState, matchReducer } from './match';
import { applyFinalBonuses, applyMiniGameEffects, applyRoundResult, resetPlayersForReplay, resolveBureauReview, roundContextPatch } from './matchOrchestration';

const stats=():PlayerStats=>({
  roundsPlayed:0,correctAnswers:0,totalAnswers:0,bestScore:0,worstScore:1000,
  mapDistancesKm:[],estimateErrorsPercent:[],risksTaken:0,successfulRisks:0,
  highestBankedList:0,categoriesAttempted:new Set(),interceptCount:0,
  challengeScores:[],mapScores:[],successfulListBanks:[],categoryScores:{},assetsUsed:[]
});

const directive=(id='directive'):SecretDirective=>({
  id,codeName:id,title:id,description:'Test directive',targetMetric:'Test',bonusPoints:120,
  isCompleted:false,progressText:'Not yet complete'
});

const player=(id:string,score=0):Player=>({
  id,name:`Candidate ${id}`,avatar:'A',color:'#123456',department:'Tests',score,influence:1,
  assets:[],secretDirective:directive(),stats:stats()
});

describe('match orchestration',()=>{
  it('applies continuous scores, player statistics and every consumed apparatus asset atomically',()=>{
    const result=applyRoundResult({
      players:[player('a'),player('b')],scoreOrScores:437,activePlayerId:'a',
      armedAssets:{a:['SECOND_OPINION','DOUBLE_ENTRY'],b:['INTERCEPT','PRIORITY_ACCESS']},
      participationMode:'EVERYONE_TAKES_A_TURN',roundType:'THE_LIST',category:'Geography',extraData:{correct:true}
    });
    expect(result.baseScores).toEqual({a:437});
    expect(result.finalScores).toEqual({a:577,b:87});
    expect(result.players.map(candidate=>candidate.score)).toEqual([577,87]);
    expect(result.players[0].stats.challengeScores).toEqual([437]);
    expect(result.players[0].stats.categoriesAttempted).toEqual(new Set(['Geography']));
    expect(result.armedAssets).toEqual({a:[],b:['PRIORITY_ACCESS']});
  });

  it('resolves review transfers, mini-game effects and final bonuses without negative totals',()=>{
    const reviewed=resolveBureauReview([player('a',900),player('b',100)],'b','QUESTIONABLE',250);
    expect(reviewed.map(candidate=>candidate.score)).toEqual([650,350]);
    const mini=applyMiniGameEffects(reviewed,[{playerId:'b',pointsDelta:-500,asset:'REFILE',priorityNextRound:true,note:'Test'}]);
    expect(mini.players[1].score).toBe(0);
    expect(mini.players[1].assets).toContain('REFILE');
    expect(mini.priorityWinnerId).toBe('b');
    expect(applyFinalBonuses(mini.players,{a:125,b:75}).map(candidate=>candidate.score)).toEqual([775,75]);
  });

  it('builds the complete next-round patch including transient-state clearance',()=>{
    const patch=roundContextPatch([player('a',500),player('b',100)],2,0,'challenge-3','ROOM_TRANSITION');
    expect(patch).toMatchObject({currentRoundIndex:2,roundStarterIndex:0,currentChallengeId:'challenge-3',usedChallengeIdsThisRound:['challenge-3'],freeMotionPlayerId:'b',committeePredictions:[],rivalryOutcomes:[]});
  });

  it('resets retained candidates without carrying assessment statistics',()=>{
    const used=player('a',1500);used.stats.roundsPlayed=8;used.stats.rivalryPredictionsWon=2;used.assets=['INTERCEPT'];
    const reset=resetPlayersForReplay([used],[directive('new')]);
    expect(reset[0]).toMatchObject({id:'a',score:0,influence:1,assets:['SECOND_OPINION']});
    expect(reset[0].secretDirective.id).toBe('new');
    expect(reset[0].stats.roundsPlayed).toBe(0);
    expect(reset[0].stats.rivalryPredictionsWon).toBe(0);
  });

  it.each([1,2,4])('runs a complete eight-round domain journey for %i candidate(s)',playerCount=>{
    const candidates=Array.from({length:playerCount},(_,index)=>player(`p-${index+1}`));
    let state=matchReducer(createMatchState(createMatchConfig('FULL')),{type:'PATCH_MATCH',patch:{phase:'PLAYING_ROUND',players:candidates,selectedPlayerCount:playerCount,currentChallengeId:'q-1',usedChallengeIdsThisRound:['q-1']}});
    for(let round=0;round<8;round+=1){
      for(const candidate of state.players){
        const result=applyRoundResult({players:state.players,scoreOrScores:313+round*17,activePlayerId:candidate.id,armedAssets:state.armedAssets,participationMode:'EVERYONE_TAKES_A_TURN',roundType:state.config.roundTypes[round],extraData:{correct:true}});
        state=matchReducer(state,{type:'PATCH_MATCH',patch:{players:result.players,armedAssets:result.armedAssets}});
        state=matchReducer(state,{type:'ADVANCE_PLAYER'});
      }
      state=matchReducer(state,{type:'APPEND_SCORE_SNAPSHOT',snapshot:{roundNumber:round+1,scores:Object.fromEntries(state.players.map(candidate=>[candidate.id,candidate.score]))}});
      if(round===2)state=matchReducer(state,{type:'PATCH_MATCH',patch:{miniGamesPlayed:['RED_BUTTON'],miniGameType:null}});
      if(round===3)state=matchReducer(state,{type:'PATCH_MATCH',patch:{bureauReviewUsed:true,reviewEligiblePlayerId:null}});
      if(round<7)state=matchReducer(state,{type:'PATCH_MATCH',patch:roundContextPatch(state.players,round+1,(round+1)%playerCount,`q-${round+2}`,'PLAYING_ROUND')});
    }
    state=matchReducer(state,{type:'PATCH_MATCH',patch:{players:applyFinalBonuses(state.players,Object.fromEntries(state.players.map(candidate=>[candidate.id,111]))),finalCaseIndex:state.players.length,phase:'PODIUM'}});
    expect(state.phase).toBe('PODIUM');
    expect(state.currentRoundIndex).toBe(7);
    expect(state.scoreHistory).toHaveLength(8);
    expect(state.players).toHaveLength(playerCount);
    expect(state.players.every(candidate=>candidate.stats.roundsPlayed===8)).toBe(true);
    expect(state.players.every(candidate=>candidate.score>0)).toBe(true);
    expect(state.miniGamesPlayed).toEqual(['RED_BUTTON']);
    expect(state.bureauReviewUsed).toBe(true);
    expect(state.finalCaseIndex).toBe(playerCount);
  });
});
