import type { CommitteePrediction, Player, RivalryMotion, RivalryOutcome, RoundType } from '../types';
import { calibrateDepartmentScore } from './scoring';

export const INFLUENCE_CAP = 3;
export const MOTION_COSTS: Record<RivalryMotion,number> = { NONE:0, RAISE_STANDARD:1, COUNTER_SIGN:2, SECOND_READING:2 };

export const rivalryThreshold = (roundType:RoundType, raised=false):{value:number;label:string} => {
  const base:Record<RoundType,[number,string]>={
    WHERE_IN_BRITAIN:[475,'score at least 475 from the certified distance curve'], TOP_10:[650,'release files worth at least 650 before the registry closes'], PUT_UP_OR_SHUT_UP:[500,'complete a contract worth at least 500'], THE_LIST:[450,'bank at least 450'], CLOSEST_WINS:[575,'record an estimate worth at least 575'], RANK_IT:[625,'score at least 625 accuracy'], IMAGE_REVEAL:[500,'identify the subject while at least 500 remains'], STOP_THE_SCORE:[500,'survive a risk worth at least 500'],
    MISFILED_RECORDS:[500,'file both connections for at least 500'], REDACTED_RECORDS:[500,'identify the subject while at least 500 remains'], COMMON_DOSSIER:[500,'certify the connection for at least 500'], MISSING_MINUTES:[550,'recall the missing fact for at least 550'], PUBLIC_ENQUIRY:[600,'record a calibrated result worth at least 600'], CHAIN_OF_COMMAND:[550,'certify the chronology for at least 550'], COMPLAINTS_DESK:[550,'uphold the factual objection for at least 550'], SEATING_COMMITTEE:[500,'certify an ordering worth at least 500'], DISPATCH_BOX:[350,'complete the dispatch for at least 350']
  };
  const [rawValue,rawLabel]=base[roundType];
  const value=calibrateDepartmentScore(roundType,rawValue);
  const label=rawLabel.replace(String(rawValue),String(value));
  const raisedValue=Math.min(850,calibrateDepartmentScore(roundType,rawValue+150));
  return raised?{value:raisedValue,label:`meet the raised standard of ${raisedValue} points`}:{value,label};
};

export function resolveRivalry(players:Player[], predictions:CommitteePrediction[], targetPlayerId:string, targetRoundScore:number, roundType:RoundType, freeMotionPlayerId:string|null=null):{players:Player[];outcomes:RivalryOutcome[]} {
  const raised=predictions.some(item=>item.motion==='RAISE_STANDARD');
  const success=targetRoundScore>=rivalryThreshold(roundType,raised).value;
  const outcomes:RivalryOutcome[]=[];
  const deltas=new Map<string,{score:number;influence:number}>();
  const add=(id:string,score:number,influence:number,description:string)=>{const current=deltas.get(id)??{score:0,influence:0};deltas.set(id,{score:current.score+score,influence:current.influence+influence});outcomes.push({playerId:id,scoreDelta:score,influenceDelta:influence,description});};
  for(const prediction of predictions){
    const cost=prediction.playerId===freeMotionPlayerId?0:MOTION_COSTS[prediction.motion];
    if(cost)add(prediction.playerId,0,-cost,`${prediction.motion.replaceAll('_',' ')} filed for ${cost} Influence.`);
    const correct=prediction.stance==='ABSTAIN'?false:(prediction.stance==='BACK')===success;
    if(correct)add(prediction.playerId,0,1,'Committee prediction upheld: +1 Influence.');
    if(prediction.motion==='RAISE_STANDARD')add(success?targetPlayerId:prediction.playerId,success?60:50,0,success?'Raised standard met: target +60.':'Raised standard missed: challenger +50.');
    if(prediction.motion==='COUNTER_SIGN'&&success)add(prediction.playerId,Math.min(150,Math.round(targetRoundScore*.22)),0,'Counter-sign copied a bounded share of the successful result.');
    if(prediction.motion==='SECOND_READING')add(correct?prediction.playerId:targetPlayerId,100,0,correct?'Second Reading upheld: challenger +100.':'Second Reading dismissed: target +100.');
  }
  return {players:players.map(player=>{const delta=deltas.get(player.id)??{score:0,influence:0};const wonPrediction=predictions.some(item=>item.playerId===player.id&&item.stance!=='ABSTAIN'&&((item.stance==='BACK')===success));const successfulMotion=outcomes.some(item=>item.playerId===player.id&&item.scoreDelta>0&&/standard|Counter-sign|Second Reading/.test(item.description));return {...player,score:Math.max(0,player.score+delta.score),influence:Math.max(0,Math.min(INFLUENCE_CAP,(player.influence??0)+delta.influence)),stats:{...player.stats,rivalryPredictionsWon:(player.stats.rivalryPredictionsWon??0)+(wonPrediction?1:0),rivalryMotionsSucceeded:(player.stats.rivalryMotionsSucceeded??0)+(successfulMotion?1:0),influenceEarned:(player.stats.influenceEarned??0)+Math.max(0,delta.influence)}};}),outcomes};
}
