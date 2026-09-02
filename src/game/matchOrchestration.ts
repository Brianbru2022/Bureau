import type { ArmedAssetState, BureauAssetKey, MatchState, MiniGameEffect, Player, RoundParticipationMode, RoundType, SecretDirective } from '../types';
import { resolveAssetScores } from './assets';

type ExtendedStats = Player['stats'] & {
  challengeScores?: number[];
  mapScores?: number[];
  successfulListBanks?: number[];
  categoryScores?: Record<string, number[]>;
  assetsUsed?: string[];
};

export interface RoundResultContext {
  players: Player[];
  scoreOrScores: number | Record<string, number>;
  activePlayerId: string | null;
  armedAssets: ArmedAssetState;
  participationMode: RoundParticipationMode;
  roundType: RoundType;
  category?: string;
  extraData?: Record<string, unknown>;
}

export interface RoundResultResolution {
  players: Player[];
  armedAssets: ArmedAssetState;
  baseScores: Record<string, number>;
  finalScores: Record<string, number>;
}

/** Pure score application. React supplies facts about the attempt; this layer
 * applies assets, player totals and statistics without reading UI state. */
export function applyRoundResult(context:RoundResultContext):RoundResultResolution {
  const {players,scoreOrScores,activePlayerId,armedAssets,participationMode,roundType,category,extraData}=context;
  const result=resolveAssetScores(scoreOrScores,activePlayerId,players,armedAssets,participationMode,extraData);
  const consumedByPlayer=new Map<string,Set<BureauAssetKey>>();
  for(const {playerId,asset} of result.consumed){
    const consumed=consumedByPlayer.get(playerId)??new Set<BureauAssetKey>();consumed.add(asset);consumedByPlayer.set(playerId,consumed);
  }
  const nextArmedAssets=Object.fromEntries(Object.entries(armedAssets).map(([playerId,assets])=>[playerId,assets.filter(asset=>!consumedByPlayer.get(playerId)?.has(asset))]));
  const participantIds=new Set(Object.keys(result.baseScores));
  const updated=players.map(player=>{
    const finalEarned=result.finalScores[player.id]??0;
    const baseEarned=result.baseScores[player.id];
    const interceptedOnly=!participantIds.has(player.id)&&finalEarned>0;
    if(!participantIds.has(player.id)&&!interceptedOnly)return player;
    const stats=player.stats as ExtendedStats;
    if(interceptedOnly)return {...player,score:player.score+finalEarned,stats:{...stats,interceptCount:stats.interceptCount+1}};
    const explicitCorrect=typeof extraData?.correct==='boolean'&&activePlayerId===player.id?extraData.correct:undefined;
    const isSuccess=explicitCorrect??(baseEarned??0)>0;
    const mapDistance=roundType==='WHERE_IN_BRITAIN'&&activePlayerId===player.id&&typeof extraData?.km==='number'?extraData.km:null;
    const estimateErrors=roundType==='CLOSEST_WINS'&&extraData?.errors&&typeof extraData.errors==='object'?extraData.errors as Record<string,number>:null;
    const listBanked=roundType==='THE_LIST'&&activePlayerId===player.id&&isSuccess?(baseEarned??0):null;
    const isRisk=roundType==='STOP_THE_SCORE'&&activePlayerId===player.id;
    const categoryScores={...(stats.categoryScores??{})};if(category)categoryScores[category]=[...(categoryScores[category]??[]),baseEarned??0];
    const roundScores={...(stats.roundScores??{})};roundScores[roundType]=[...(roundScores[roundType]??[]),baseEarned??0];
    return {...player,score:Math.max(0,player.score+finalEarned),stats:{...stats,roundsPlayed:stats.roundsPlayed+1,correctAnswers:isSuccess?stats.correctAnswers+1:stats.correctAnswers,totalAnswers:stats.totalAnswers+1,bestScore:Math.max(stats.bestScore,baseEarned??0),worstScore:Math.min(stats.worstScore,baseEarned??0),mapDistancesKm:mapDistance!==null?[...stats.mapDistancesKm,mapDistance]:stats.mapDistancesKm,estimateErrorsPercent:estimateErrors?.[player.id]!==undefined?[...stats.estimateErrorsPercent,estimateErrors[player.id]]:stats.estimateErrorsPercent,risksTaken:isRisk?stats.risksTaken+1:stats.risksTaken,successfulRisks:isRisk&&isSuccess?stats.successfulRisks+1:stats.successfulRisks,highestBankedList:listBanked!==null?Math.max(stats.highestBankedList,listBanked):stats.highestBankedList,categoriesAttempted:category?new Set([...stats.categoriesAttempted,category]):stats.categoriesAttempted,challengeScores:[...(stats.challengeScores??[]),baseEarned??0],mapScores:roundType==='WHERE_IN_BRITAIN'?[...(stats.mapScores??[]),baseEarned??0]:(stats.mapScores??[]),successfulListBanks:listBanked!==null?[...(stats.successfulListBanks??[]),listBanked]:(stats.successfulListBanks??[]),categoryScores,roundScores,successfulRiskScores:isRisk&&isSuccess?[...(stats.successfulRiskScores??[]),baseEarned??0]:(stats.successfulRiskScores??[])} as Player['stats']};
  });
  return {players:updated,armedAssets:nextArmedAssets,baseScores:result.baseScores,finalScores:result.finalScores};
}

export function resolveBureauReview(players:Player[],eligiblePlayerId:string,optionType:'SAFE'|'RISKY'|'QUESTIONABLE',delta:number):Player[]{
  if(optionType==='QUESTIONABLE'&&delta>0){
    const leader=[...players].sort((a,b)=>b.score-a.score).find(player=>player.id!==eligiblePlayerId);
    const steal=leader?Math.min(delta,leader.score):0;
    return players.map(player=>player.id===eligiblePlayerId?{...player,score:player.score+steal}:leader&&player.id===leader.id?{...player,score:Math.max(0,player.score-steal)}:player);
  }
  return players.map(player=>player.id===eligiblePlayerId?{...player,score:Math.max(0,player.score+delta)}:player);
}

export function applyMiniGameEffects(players:Player[],effects:MiniGameEffect[]):{players:Player[];priorityWinnerId:string|null}{
  let priorityWinnerId:string|null=null;
  const updated=players.map(player=>{const effect=effects.find(item=>item.playerId===player.id);if(!effect)return player;if(effect.priorityNextRound)priorityWinnerId=player.id;return {...player,score:Math.max(0,player.score+(effect.pointsDelta??0)),assets:effect.asset?[...player.assets,effect.asset]:player.assets};});
  return {players:updated,priorityWinnerId};
}

export const applyFinalBonuses=(players:Player[],bonuses:Record<string,number>)=>players.map(player=>({...player,score:player.score+(bonuses[player.id]??0)}));

export function roundContextPatch(players:Player[],nextRound:number,nextStarter:number,nextChallengeId:string,phase:MatchState['phase']):Partial<MatchState>{
  const target=players[nextStarter];
  const trailing=[...players].filter(player=>player.id!==target?.id).sort((a,b)=>a.score-b.score)[0];
  return {players,currentRoundIndex:nextRound,roundStarterIndex:nextStarter,playersCompletedThisRound:0,currentChallengeId:nextChallengeId,usedChallengeIdsThisRound:[nextChallengeId],priorityStarterPlayerId:null,committeePredictions:[],rivalryTargetScore:null,rivalryOutcomes:[],freeMotionPlayerId:trailing?.id??null,phase};
}

/** Starts a new assessment with the same people but none of the previous
 * assessment's scores, statistics or transient apparatus state. */
export function resetPlayersForReplay(players:Player[],directives:SecretDirective[],firstAssessment=false):Player[]{
  return players.map((player,index)=>({
    ...player,
    score:0,
    influence:1,
    assets:firstAssessment?[]:['SECOND_OPINION'],
    secretDirective:directives[index]??player.secretDirective,
    stats:{
      ...player.stats,
      roundsPlayed:0,correctAnswers:0,totalAnswers:0,bestScore:0,worstScore:1000,
      mapDistancesKm:[],estimateErrorsPercent:[],risksTaken:0,successfulRisks:0,
      highestBankedList:0,categoriesAttempted:new Set<string>(),interceptCount:0,
      challengeScores:[],mapScores:[],successfulListBanks:[],categoryScores:{},
      assetsUsed:[],roundScores:{},successfulRiskScores:[],rivalryPredictionsWon:0,
      rivalryMotionsSucceeded:0,influenceEarned:0
    }
  }));
}
