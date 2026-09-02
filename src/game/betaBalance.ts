import type { PlaytestEvent, PlaytestSession, RoundType } from '../types';
import { ALL_ROUND_TYPES } from './match';
import { summarisePlaytestSession } from './playtest';

export interface BetaDepartmentBalance {
  roundType:RoundType;
  samples:number;
  meanScore:number;
  medianScore:number;
  meanAttemptSeconds:number;
  zeroRate:number;
  suggestedMultiplier:number|null;
}

export interface BetaBalanceReport {
  status:'AWAITING_EVIDENCE'|'PARTIAL_EVIDENCE'|'CHANGES_REQUIRED'|'READY_FOR_REVIEW';
  scoredAttempts:number;
  eligibleSessions:number;
  independentGroups:number;
  representedPlayerCounts:number[];
  excludedScoredEvents:number;
  departments:BetaDepartmentBalance[];
  seatMeans:number[];
  seatSpreadRatio:number;
  issues:string[];
}

const median=(values:number[])=>{
  if(!values.length)return 0;
  const sorted=[...values].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:Math.round((sorted[middle-1]+sorted[middle])/2);
};

export function analyseBetaBalance(events:PlaytestEvent[],minimumSamplesPerDepartment=8,sessions?:PlaytestSession[],minimumIndependentGroups=6):BetaBalanceReport {
  const humanEvidenceEnforced=Array.isArray(sessions);
  const eligibleSessions=(sessions??[]).filter(session=>{
    const summary=summarisePlaytestSession(session,events);
    return summary.status==='COMPLETED'&&summary.consented&&summary.independentGroupConfirmed&&summary.configurationMatchesCohort&&summary.eventEvidenceComplete&&summary.passedUnassisted;
  });
  const eligibleSessionIds=new Set(eligibleSessions.map(session=>session.id));
  const allScored=events.filter(event=>event.type==='ROUND_COMPLETED'&&event.roundType&&event.seatScores?.some(score=>typeof score==='number'));
  const scored=humanEvidenceEnforced?allScored.filter(event=>event.sessionId&&eligibleSessionIds.has(event.sessionId)):allScored;
  const departments=ALL_ROUND_TYPES.map(roundType=>{
    const matching=scored.filter(event=>event.roundType===roundType);
    const scores=matching.flatMap(event=>(event.seatScores??[]).filter((score):score is number=>typeof score==='number'));
    const durations=matching.flatMap(event=>event.durationMs===undefined?[]:[event.durationMs/1000]);
    const meanScore=scores.length?Math.round(scores.reduce((sum,score)=>sum+score,0)/scores.length):0;
    return {
      roundType,
      samples:scores.length,
      meanScore,
      medianScore:median(scores),
      meanAttemptSeconds:durations.length?Number((durations.reduce((sum,duration)=>sum+duration,0)/durations.length).toFixed(1)):0,
      zeroRate:scores.length?Number((scores.filter(score=>score===0).length/scores.length).toFixed(4)):0,
      suggestedMultiplier:scores.length>=minimumSamplesPerDepartment&&meanScore>0?Number(Math.max(.8,Math.min(1.25,500/meanScore)).toFixed(3)):null,
    };
  });
  const maximumSeats=Math.max(0,...scored.map(event=>event.seatScores?.length??0));
  const seatMeans=Array.from({length:maximumSeats},(_,seat)=>{
    const values=scored.flatMap(event=>typeof event.seatScores?.[seat]==='number'?[event.seatScores[seat] as number]:[]);
    return values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0;
  });
  const populatedSeats=seatMeans.filter(mean=>mean>0);
  const seatAverage=populatedSeats.length?populatedSeats.reduce((sum,value)=>sum+value,0)/populatedSeats.length:0;
  const seatSpreadRatio=seatAverage&&populatedSeats.length>1?Number(((Math.max(...populatedSeats)-Math.min(...populatedSeats))/seatAverage).toFixed(4)):0;
  const missing=departments.filter(department=>department.samples<minimumSamplesPerDepartment);
  const evidenceIssues:string[]=[];const balanceIssues:string[]=[];
  if(!scored.length)evidenceIssues.push('No consented scored beta attempts are available.');
  if(missing.length)evidenceIssues.push(`${missing.length} department${missing.length===1?' has':'s have'} fewer than ${minimumSamplesPerDepartment} scored attempts.`);
  const independentGroups=new Set(eligibleSessions.map(session=>session.groupCode)).size;
  const representedPlayerCounts=[...new Set(eligibleSessions.map(session=>session.playerCount))].sort((a,b)=>a-b);
  if(humanEvidenceEnforced&&independentGroups<minimumIndependentGroups)evidenceIssues.push(`Need ${minimumIndependentGroups} independent balance groups; found ${independentGroups}.`);
  if(humanEvidenceEnforced)for(const playerCount of [1,2,4])if(!representedPlayerCounts.includes(playerCount))evidenceIssues.push(`No eligible ${playerCount}-candidate balance session is represented.`);
  if(seatSpreadRatio>=.05)balanceIssues.push(`Observed seat spread is ${(seatSpreadRatio*100).toFixed(1)}%, above the 5% review threshold.`);
  for(const department of departments.filter(row=>row.samples>=minimumSamplesPerDepartment)){
    if(department.meanScore<350||department.meanScore>650)balanceIssues.push(`${department.roundType} mean score ${department.meanScore} falls outside the 350–650 review band.`);
    if(department.zeroRate>.55)balanceIssues.push(`${department.roundType} zero-score rate ${(department.zeroRate*100).toFixed(0)}% exceeds the 55% review threshold.`);
  }
  const issues=[...evidenceIssues,...balanceIssues];
  return {
    status:!scored.length?'AWAITING_EVIDENCE':evidenceIssues.length?'PARTIAL_EVIDENCE':balanceIssues.length?'CHANGES_REQUIRED':'READY_FOR_REVIEW',
    scoredAttempts:departments.reduce((sum,department)=>sum+department.samples,0),
    eligibleSessions:eligibleSessions.length,
    independentGroups,
    representedPlayerCounts,
    excludedScoredEvents:allScored.length-scored.length,
    departments,seatMeans,seatSpreadRatio,issues,
  };
}
