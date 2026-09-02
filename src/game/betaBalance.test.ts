import { describe,expect,it } from 'vitest';
import type { PlaytestEvent, PlaytestSession } from '../types';
import { analyseBetaBalance } from './betaBalance';

const event=(roundType:'TOP_10'|'THE_LIST',seatScores:Array<number|null>,durationMs=20_000):PlaytestEvent=>({version:1,id:`${roundType}-${seatScores.join('-')}`,occurredAt:1,type:'ROUND_COMPLETED',phase:'PLAYING_ROUND',roundType,playerCount:seatScores.length,roundNumber:1,durationMs,seatScores});

describe('consented beta balance analysis',()=>{
  it('does not infer balance without scored human evidence',()=>{
    const report=analyseBetaBalance([]);
    expect(report.status).toBe('AWAITING_EVIDENCE');
    expect(report.scoredAttempts).toBe(0);
  });
  it('summarises score, duration and seat evidence without using candidate identity',()=>{
    const events=[event('TOP_10',[400,600]),event('TOP_10',[500,500]),event('THE_LIST',[450,null])];
    const report=analyseBetaBalance(events,2);
    expect(report.departments.find(row=>row.roundType==='TOP_10')).toMatchObject({samples:4,meanScore:500,medianScore:500,meanAttemptSeconds:20,suggestedMultiplier:1});
    expect(report.seatMeans).toEqual([450,550]);
    expect(report.status).toBe('PARTIAL_EVIDENCE');
  });
  it('excludes scores that are not tied to a completed consented independent session',()=>{
    const consent={version:1 as const,noticeVersion:'RC1-CLOSED-BETA-V2' as const,acceptedAt:1,localRecordingOnly:true as const,excludesNamesAudioAndNetworkData:true as const,manualExportOnly:true as const};
    const eligibility={version:1 as const,confirmedAt:1,participantsUnfamiliarWithDevelopment:true as const,independentGroupConfirmed:true as const,anonymousGroupCodeConfirmed:true as const};
    const eligible:PlaytestSession={version:4,id:'eligible',groupCode:'GROUP-01',status:'COMPLETED',startedAt:1,playerCount:2,preset:'QUICK',politicsMode:'LIGHT',roundTypes:['TOP_10'],cohortSlot:'TWO_QUICK_LIGHT',consent,eligibility,debrief:{enjoymentRating:4,clarityRating:4,pacingRating:4,wouldPlayAgain:true,completedUnassisted:true}};
    const marker=(type:PlaytestEvent['type'],id:string):PlaytestEvent=>({version:1,id,sessionId:'eligible',occurredAt:1,type,phase:'PLAYING_ROUND',playerCount:2});
    const events=[marker('MATCH_STARTED','eligible-started'),marker('FIRST_QUESTION_READY','eligible-ready'),{...event('TOP_10',[400,600]),id:'eligible-score',sessionId:'eligible'},marker('MATCH_COMPLETED','eligible-completed'),{...event('TOP_10',[1000,1000]),id:'unfiled-score',sessionId:'unknown'}];
    const report=analyseBetaBalance(events,2,[eligible],1);
    expect(report.departments.find(row=>row.roundType==='TOP_10')).toMatchObject({samples:2,meanScore:500});
    expect(report.excludedScoredEvents).toBe(1);
    expect(report.eligibleSessions).toBe(1);
  });
});
