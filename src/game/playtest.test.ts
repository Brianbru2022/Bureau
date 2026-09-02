import { describe, expect, it } from 'vitest';
import type { PlaytestEvent, PlaytestSession } from '../types';
import { armPlaytestSession, certifyBlindPlaytestEvidence, playtestEventsAsCsv, playtestSessionsAsCsv, sanitisePlaytestSessionForExport, sessionMatchesCohortRequirement, summarisePlaytestSession } from './playtest';

const consent = {version:1 as const,noticeVersion:'RC1-CLOSED-BETA-V1' as const,acceptedAt:90,localRecordingOnly:true as const,excludesNamesAudioAndNetworkData:true as const,manualExportOnly:true as const};
const eligibility = {version:1 as const,confirmedAt:90,participantsUnfamiliarWithDevelopment:true as const,independentGroupConfirmed:true as const,anonymousGroupCodeConfirmed:true as const};
const session: PlaytestSession = {version:4,id:'session-1',groupCode:'GROUP-01',status:'COMPLETED',startedAt:100,matchStartedAt:200,firstQuestionAt:1_200,matchCompletedAt:60_200,endedAt:61_000,playerCount:4,preset:'STANDARD',roundTypes:['TOP_10'],timerSeconds:0,politicsMode:'STANDARD',difficultyProfile:'MIXED',consent,cohortSlot:'FOUR_STANDARD_STANDARD',eligibility,debrief:{enjoymentRating:5,clarityRating:4,pacingRating:4,wouldPlayAgain:true,completedUnassisted:true,leastClearMoment:'A named candidate hesitated.',observerNotes:'Private observer prose.'}};
const event = (type:PlaytestEvent['type']):PlaytestEvent => ({version:1,id:`event-${type}`,sessionId:'session-1',occurredAt:300,type,phase:'PLAYING_ROUND',roundType:'TOP_10',challengeId:'top-1',playerCount:4});
const completeTrail=(filed:PlaytestSession):PlaytestEvent[]=>[
  {...event('MATCH_STARTED'),id:`${filed.id}-started`,sessionId:filed.id,playerCount:filed.playerCount},
  {...event('FIRST_QUESTION_READY'),id:`${filed.id}-ready`,sessionId:filed.id,playerCount:filed.playerCount},
  ...filed.roundTypes.map((roundType,index)=>({...event('ROUND_COMPLETED'),id:`${filed.id}-round-${index}`,sessionId:filed.id,playerCount:filed.playerCount,roundType})),
  {...event('MATCH_COMPLETED'),id:`${filed.id}-completed`,sessionId:filed.id,playerCount:filed.playerCount},
];

describe('play-test export', () => {
  it('refuses to arm recording without explicit consent', () => {
    expect(() => armPlaytestSession('GROUP-01',false,'SOLO_FIRST',true,100)).toThrow(/consent/i);
    expect(() => armPlaytestSession('GROUP-01',true,'SOLO_FIRST',false,100)).toThrow(/eligibility/i);
  });

  it('quotes commas and speech marks in CSV details', () => {
    const csv=playtestEventsAsCsv([{version:1,id:'event-1',occurredAt:1,type:'HOST_ASSISTANCE',phase:'PLAYING_ROUND',roundType:'TOP_10',challengeId:'top-1',playerCount:4,detail:'Host said "accept", then continued'}]);
    expect(csv).toContain('"Host said ""accept"", then continued"');
  });

  it('summarises duration, first-question time and an unassisted completion', () => {
    const summary=summarisePlaytestSession(session,[event('MATCH_STARTED'),event('ROUND_COMPLETED'),event('MATCH_COMPLETED')]);
    expect(summary.matchDurationMs).toBe(60_000);
    expect(summary.timeToFirstQuestionMs).toBe(1_000);
    expect(summary.passedUnassisted).toBe(true);
    expect(summary.enjoymentRating).toBe(5);
  });

  it.each(['CONTROL_CONFUSION','HOST_ASSISTANCE','PROGRESSION_FAILURE'] as const)('fails unassisted certification when %s is recorded', type => {
    expect(summarisePlaytestSession(session,[event(type)]).passedUnassisted).toBe(false);
  });

  it('exports one row per structured session with ratings and incident totals', () => {
    const csv=playtestSessionsAsCsv([session],[event('PAGE_SCROLL'),event('DEAD_TIME')]);
    expect(csv).toContain('sessionId,groupCode,cohortSlot,independentGroupConfirmed,configurationMatchesCohort');
    expect(csv).toContain('"GROUP-01"');
    expect(csv).toContain('"60000"');
    expect(csv).toContain('"5","4","4","true"');
  });

  it('certifies three independent unassisted groups spanning one, two and four players', () => {
    const sessions:PlaytestSession[]=[
      {...session,id:'session-1',groupCode:'GROUP-01',playerCount:1,preset:'FIRST',politicsMode:'OFF',cohortSlot:'SOLO_FIRST'},
      {...session,id:'session-2',groupCode:'GROUP-02',playerCount:2,preset:'QUICK',politicsMode:'LIGHT',cohortSlot:'TWO_QUICK_LIGHT'},
      {...session,id:'session-4',groupCode:'GROUP-03',playerCount:4,preset:'STANDARD',politicsMode:'STANDARD',cohortSlot:'FOUR_STANDARD_STANDARD'},
    ];
    expect(certifyBlindPlaytestEvidence(sessions,sessions.flatMap(completeTrail))).toMatchObject({passed:true,passingGroups:3,passingSessions:3});
  });

  it('does not accept a completed debrief without a full per-department event trail',()=>{
    const result=certifyBlindPlaytestEvidence([session],[event('MATCH_COMPLETED')]);
    expect(result.passed).toBe(false);
    expect(result.issues.some(issue=>issue.includes('full match event trail'))).toBe(true);
  });

  it('rejects a session filed against the wrong cohort configuration', () => {
    expect(sessionMatchesCohortRequirement({...session,playerCount:2})).toBe(false);
    const result=certifyBlindPlaytestEvidence([{...session,playerCount:2}],[]);
    expect(result.passed).toBe(false);
    expect(result.issues.some(issue=>issue.includes('does not match'))).toBe(true);
  });

  it('excludes completed legacy sessions without explicit recording consent', () => {
    const result=certifyBlindPlaytestEvidence([{...session,version:2,consent:undefined,eligibility:undefined}],[]);
    expect(result.passed).toBe(false);
    expect(result.passingSessions).toBe(0);
    expect(result.issues.some(issue=>issue.includes('explicit recording consent'))).toBe(true);
  });

  it('removes observer free text from a consented beta export session', () => {
    const exported=sanitisePlaytestSessionForExport(session);
    expect(exported.debrief?.observerNotes).toBeUndefined();
    expect(exported.debrief?.leastClearMoment).toBeUndefined();
    expect(exported.debrief?.enjoymentRating).toBe(5);
    expect(exported.debrief?.pacingRating).toBe(4);
  });

  it('reports missing session formats and progression failures', () => {
    const failedEvent:PlaytestEvent={...event('PROGRESSION_FAILURE'),sessionId:session.id};
    const result=certifyBlindPlaytestEvidence([session],[failedEvent]);
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Need a passing Solo · First Assessment · Politics off session.');
    expect(result.issues.some(issue=>issue.includes('progression failure'))).toBe(true);
  });
});
