import type {
  GamePhase,
  MatchConfig,
  PlaytestDebrief,
  PlaytestCohortSlot,
  PlaytestEvent,
  PlaytestEventType,
  PlaytestConsent,
  PlaytestSession,
  PlaytestSessionSummary,
  RoundType,
} from '../types';

const PLAYTEST_EVENT_KEY = 'the-bureau.playtest-events-v1';
const PLAYTEST_SESSION_KEY = 'the-bureau.playtest-sessions-v2';
const ACTIVE_SESSION_KEY = 'the-bureau.active-playtest-session-v2';
const MAX_EVENTS = 2_000;
const MAX_SESSIONS = 100;

export const PLAYTEST_COHORT_REQUIREMENTS: Record<PlaytestCohortSlot, {label:string;playerCount:1|2|4;preset:'FIRST'|'QUICK'|'STANDARD'|'FULL';politicsMode:'OFF'|'LIGHT'|'STANDARD';releaseRequired:boolean}> = {
  SOLO_FIRST: {label:'Solo · First Assessment · Politics off',playerCount:1,preset:'FIRST',politicsMode:'OFF',releaseRequired:true},
  TWO_QUICK_LIGHT: {label:'Two candidates · Quick · Light Politics',playerCount:2,preset:'QUICK',politicsMode:'LIGHT',releaseRequired:true},
  FOUR_STANDARD_STANDARD: {label:'Four candidates · Standard · Standard Politics',playerCount:4,preset:'STANDARD',politicsMode:'STANDARD',releaseRequired:true},
  FOUR_FULL_BALANCE: {label:'Four candidates · Full Bureau · Standard Politics · balance coverage',playerCount:4,preset:'FULL',politicsMode:'STANDARD',releaseRequired:false},
};

const EVENT_TYPES: PlaytestEventType[] = ['SESSION_STARTED','MATCH_STARTED','FIRST_QUESTION_READY','PAGE_SCROLL','CONTROL_CONFUSION','MISTAKEN_INPUT','HOST_ASSISTANCE','DEAD_TIME','PROGRESSION_FAILURE','ROUND_COMPLETED','MATCH_COMPLETED'];

export const playtestRequirementFor = (slot: PlaytestCohortSlot | undefined) => slot ? PLAYTEST_COHORT_REQUIREMENTS[slot] : undefined;

export const sessionMatchesCohortRequirement = (session: PlaytestSession) => {
  const requirement = playtestRequirementFor(session.cohortSlot);
  return Boolean(requirement && session.playerCount === requirement.playerCount && session.preset === requirement.preset && (session.politicsMode ?? 'OFF') === requirement.politicsMode);
};

export interface RecordPlaytestEvent {
  type: PlaytestEventType;
  phase: GamePhase;
  roundType?: RoundType;
  challengeId?: string;
  playerCount: number;
  durationMs?: number;
  roundNumber?: number;
  seatScores?: Array<number | null>;
  detail?: string;
}

const storageAvailable = () => typeof localStorage !== 'undefined';
const newId = (prefix: string, now = Date.now()) => `${prefix}-${now}-${Math.random().toString(36).slice(2, 8)}`;
const cleanGroupCode = (value: string) => value.trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'UNFILED';

export const loadPlaytestEvents = (): PlaytestEvent[] => {
  if (!storageAvailable()) return [];
  try {
    const value = JSON.parse(localStorage.getItem(PLAYTEST_EVENT_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(event => event?.version === 1 && typeof event.id === 'string') : [];
  } catch { return []; }
};

export const loadPlaytestSessions = (): PlaytestSession[] => {
  if (!storageAvailable()) return [];
  try {
    const value = JSON.parse(localStorage.getItem(PLAYTEST_SESSION_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(session => [2,3,4].includes(session?.version) && typeof session.id === 'string') : [];
  } catch { return []; }
};

const saveSessions = (sessions: PlaytestSession[]) => {
  if (!storageAvailable()) return;
  try { localStorage.setItem(PLAYTEST_SESSION_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS))); } catch { /* local diagnostics must never interrupt play */ }
};

const activeSessionId = () => {
  if (!storageAvailable()) return null;
  try { return localStorage.getItem(ACTIVE_SESSION_KEY); } catch { return null; }
};

export const getActivePlaytestSession = () => {
  const id = activeSessionId();
  return id ? loadPlaytestSessions().find(session => session.id === id) ?? null : null;
};

const updateSession = (id: string, update: (session: PlaytestSession) => PlaytestSession) => {
  let updated: PlaytestSession | null = null;
  saveSessions(loadPlaytestSessions().map(session => {
    if (session.id !== id) return session;
    updated = update(session);
    return updated;
  }));
  return updated;
};

export const recordPlaytestEvent = (event: RecordPlaytestEvent): PlaytestEvent => {
  const session = getActivePlaytestSession();
  const recorded: PlaytestEvent = {
    version: 1,
    id: newId('event'),
    occurredAt: Date.now(),
    sessionId: session?.id,
    ...event,
  };
  if (storageAvailable() && session?.consent) {
    try { localStorage.setItem(PLAYTEST_EVENT_KEY, JSON.stringify([...loadPlaytestEvents(), recorded].slice(-MAX_EVENTS))); } catch { /* local diagnostics must never interrupt play */ }
  }
  if (session && event.type === 'FIRST_QUESTION_READY' && session.firstQuestionAt === undefined) {
    updateSession(session.id, current => ({ ...current, firstQuestionAt: recorded.occurredAt }));
  }
  return recorded;
};

export const armPlaytestSession = (groupCode: string, consentAccepted: boolean, cohortSlot: PlaytestCohortSlot, eligibilityConfirmed: boolean, now = Date.now()) => {
  if (!consentAccepted) throw new Error('Explicit closed-beta recording consent is required.');
  if (!eligibilityConfirmed) throw new Error('Independent-group eligibility must be confirmed.');
  const consent: PlaytestConsent = {
    version:1,
    noticeVersion:'RC1-CLOSED-BETA-V2',
    acceptedAt:now,
    localRecordingOnly:true,
    excludesNamesAudioAndNetworkData:true,
    manualExportOnly:true,
  };
  const session: PlaytestSession = {
    version: 4,
    id: newId('session', now),
    groupCode: cleanGroupCode(groupCode),
    status: 'ARMED',
    startedAt: now,
    playerCount: 0,
    roundTypes: [],
    consent,
    cohortSlot,
    eligibility:{version:1,confirmedAt:now,participantsUnfamiliarWithDevelopment:true,independentGroupConfirmed:true,anonymousGroupCodeConfirmed:true},
  };
  saveSessions([...loadPlaytestSessions(), session]);
  if (storageAvailable()) {
    try { localStorage.setItem(ACTIVE_SESSION_KEY, session.id); } catch { /* ignored */ }
  }
  recordPlaytestEvent({ type:'SESSION_STARTED', phase:'TITLE', playerCount:0, detail:`Structured blind play-test armed for ${session.groupCode}.` });
  return session;
};

export const configureActivePlaytestSession = (config: MatchConfig, playerCount: number, now = Date.now()) => {
  const active = getActivePlaytestSession();
  if (!active || !['ARMED','ACTIVE'].includes(active.status)) return null;
  const firstStart = active.status === 'ARMED';
  const updated = updateSession(active.id, session => ({
    ...session,
    status:'ACTIVE',
    matchStartedAt:firstStart ? now : session.matchStartedAt,
    playerCount,
    preset:config.preset,
    roundTypes:[...config.roundTypes],
    timerSeconds:config.timerSeconds,
    politicsMode:config.politicsMode,
    difficultyProfile:config.difficultyProfile,
    scorePaceProfile:config.scorePaceProfile,
  }));
  if (firstStart) recordPlaytestEvent({ type:'MATCH_STARTED', phase:'SETUP', playerCount, detail:`${config.preset} assessment with ${config.politicsMode} Office Politics.` });
  return updated;
};

export const markActivePlaytestMatchComplete = (playerCount: number, now = Date.now()) => {
  const active = getActivePlaytestSession();
  if (!active || active.status !== 'ACTIVE') return null;
  const updated = updateSession(active.id, session => ({ ...session, status:'AWAITING_DEBRIEF', matchCompletedAt:now }));
  recordPlaytestEvent({ type:'MATCH_COMPLETED', phase:'PODIUM', playerCount, durationMs:active.matchStartedAt ? now-active.matchStartedAt : undefined, detail:'Assessment reached the final podium.' });
  return updated;
};

export const completeActivePlaytestSession = (debrief: PlaytestDebrief, now = Date.now()) => {
  const active = getActivePlaytestSession();
  if (!active) return null;
  const updated = updateSession(active.id, session => ({ ...session, status:'COMPLETED', endedAt:now, debrief }));
  if (storageAvailable()) {
    try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch { /* ignored */ }
  }
  return updated;
};

export const abandonActivePlaytestSession = (now = Date.now()) => {
  const active = getActivePlaytestSession();
  if (!active) return null;
  const updated = updateSession(active.id, session => ({ ...session, status:'ABANDONED', endedAt:now }));
  if (storageAvailable()) {
    try { localStorage.removeItem(ACTIVE_SESSION_KEY); } catch { /* ignored */ }
  }
  return updated;
};

export const summarisePlaytestSession = (session: PlaytestSession, events: PlaytestEvent[]): PlaytestSessionSummary => {
  const sessionEvents = events.filter(event => event.sessionId === session.id);
  const eventCounts = sessionEvents.reduce<Partial<Record<PlaytestEventType, number>>>((counts, event) => {
    counts[event.type] = (counts[event.type] ?? 0) + 1;
    return counts;
  }, Object.fromEntries(EVENT_TYPES.map(type => [type,0])) as Record<PlaytestEventType, number>);
  const blockers = (eventCounts.PROGRESSION_FAILURE ?? 0) + (eventCounts.CONTROL_CONFUSION ?? 0) + (eventCounts.HOST_ASSISTANCE ?? 0);
  const completedRoundTypes=new Set(sessionEvents.filter(event=>event.type==='ROUND_COMPLETED').map(event=>event.roundType));
  const eventEvidenceComplete=Boolean(
    sessionEvents.some(event=>event.type==='MATCH_STARTED')&&
    sessionEvents.some(event=>event.type==='FIRST_QUESTION_READY')&&
    sessionEvents.some(event=>event.type==='MATCH_COMPLETED')&&
    session.roundTypes.length>0&&session.roundTypes.every(roundType=>completedRoundTypes.has(roundType))
  );
  return {
    sessionId:session.id,
    groupCode:session.groupCode,
    status:session.status,
    playerCount:session.playerCount,
    preset:session.preset,
    cohortSlot:session.cohortSlot,
    consented:Boolean(session.consent),
    independentGroupConfirmed:Boolean(session.eligibility?.participantsUnfamiliarWithDevelopment && session.eligibility.independentGroupConfirmed && session.eligibility.anonymousGroupCodeConfirmed),
    configurationMatchesCohort:sessionMatchesCohortRequirement(session),
    eventEvidenceComplete,
    matchDurationMs:session.matchStartedAt && session.matchCompletedAt ? session.matchCompletedAt-session.matchStartedAt : undefined,
    timeToFirstQuestionMs:session.matchStartedAt && session.firstQuestionAt ? session.firstQuestionAt-session.matchStartedAt : undefined,
    eventCounts,
    passedUnassisted:session.status === 'COMPLETED' && session.debrief?.completedUnassisted === true && blockers === 0,
    enjoymentRating:session.debrief?.enjoymentRating,
    clarityRating:session.debrief?.clarityRating,
    pacingRating:session.debrief?.pacingRating,
    wouldPlayAgain:session.debrief?.wouldPlayAgain,
    favouriteDepartment:session.debrief?.favouriteDepartment,
    mostConfusingDepartment:session.debrief?.mostConfusingDepartment,
  };
};

export const certifyBlindPlaytestEvidence = (sessions: PlaytestSession[], events: PlaytestEvent[]) => {
  const completed = sessions.filter(session => session.status === 'COMPLETED');
  const summaries = completed.map(session => summarisePlaytestSession(session, events));
  const passing = summaries.filter(summary => summary.consented && summary.independentGroupConfirmed && summary.configurationMatchesCohort && summary.eventEvidenceComplete && summary.passedUnassisted && summary.enjoymentRating !== undefined && summary.clarityRating !== undefined && summary.pacingRating !== undefined && summary.wouldPlayAgain !== undefined && summary.matchDurationMs !== undefined && summary.timeToFirstQuestionMs !== undefined);
  const passingGroups = new Set(passing.map(summary => summary.groupCode));
  const issues:string[] = [];
  const unconsentedCompleted = summaries.filter(summary => !summary.consented).length;
  if (unconsentedCompleted) issues.push(`${unconsentedCompleted} completed session${unconsentedCompleted===1?' is':'s are'} excluded because explicit recording consent was not filed.`);
  const unattestedCompleted = summaries.filter(summary => !summary.independentGroupConfirmed).length;
  if (unattestedCompleted) issues.push(`${unattestedCompleted} completed session${unattestedCompleted===1?' lacks':'s lack'} independent-group eligibility attestation.`);
  const wrongConfiguration = summaries.filter(summary => summary.cohortSlot && !summary.configurationMatchesCohort).length;
  if (wrongConfiguration) issues.push(`${wrongConfiguration} completed session${wrongConfiguration===1?' does':'s do'} not match its filed cohort configuration.`);
  const incompleteEvidence=summaries.filter(summary=>!summary.eventEvidenceComplete).length;
  if(incompleteEvidence)issues.push(`${incompleteEvidence} completed session${incompleteEvidence===1?' lacks':'s lack'} a full match event trail covering every scheduled department.`);
  if (passingGroups.size < 3) issues.push(`Need three independent passing groups; found ${passingGroups.size}.`);
  for (const slot of (Object.keys(PLAYTEST_COHORT_REQUIREMENTS) as PlaytestCohortSlot[]).filter(slot=>PLAYTEST_COHORT_REQUIREMENTS[slot].releaseRequired)) {
    if (!passing.some(summary => summary.cohortSlot === slot)) issues.push(`Need a passing ${PLAYTEST_COHORT_REQUIREMENTS[slot].label} session.`);
  }
  const mean=(values:number[])=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;
  if(passing.length){
    const meanEnjoyment=mean(passing.map(summary=>summary.enjoymentRating as number));
    const meanClarity=mean(passing.map(summary=>summary.clarityRating as number));
    const meanPacing=mean(passing.map(summary=>summary.pacingRating as number));
    const replayRate=passing.filter(summary=>summary.wouldPlayAgain).length/passing.length;
    if(meanEnjoyment<3.5)issues.push(`Mean enjoyment is ${meanEnjoyment.toFixed(2)}/5; release threshold is 3.50.`);
    if(meanClarity<3.5)issues.push(`Mean clarity is ${meanClarity.toFixed(2)}/5; release threshold is 3.50.`);
    if(meanPacing<3)issues.push(`Mean pacing is ${meanPacing.toFixed(2)}/5; release threshold is 3.00.`);
    if(replayRate<2/3)issues.push(`Would-play-again rate is ${(replayRate*100).toFixed(0)}%; release threshold is 67%.`);
  }
  const progressionFailures = events.filter(event => event.sessionId && completed.some(session => session.id === event.sessionId) && event.type === 'PROGRESSION_FAILURE').length;
  if (progressionFailures) issues.push(`${progressionFailures} progression failure event${progressionFailures===1?'':'s'} remain in completed evidence.`);
  return { passed:issues.length===0, completedSessions:completed.length, passingSessions:passing.length, passingGroups:passingGroups.size, issues, summaries };
};

export const sanitisePlaytestSessionForExport = (session: PlaytestSession): PlaytestSession => ({
  ...session,
  debrief:session.debrief ? {
    enjoymentRating:session.debrief.enjoymentRating,
    clarityRating:session.debrief.clarityRating,
    pacingRating:session.debrief.pacingRating,
    wouldPlayAgain:session.debrief.wouldPlayAgain,
    completedUnassisted:session.debrief.completedUnassisted,
    favouriteDepartment:session.debrief.favouriteDepartment,
    mostConfusingDepartment:session.debrief.mostConfusingDepartment,
  } : undefined,
});

export const buildPlaytestReport = () => {
  const sessions = loadPlaytestSessions();
  const events = loadPlaytestEvents();
  const consentedSessionIds = new Set(sessions.filter(session => session.consent).map(session => session.id));
  const consentedSessions = sessions.filter(session => session.consent).map(sanitisePlaytestSessionForExport);
  const consentedEvents = events.filter(event => event.sessionId && consentedSessionIds.has(event.sessionId)).map(({ detail: _detail, ...event }) => event);
  return {
    schemaVersion:5 as const,
    exportedAt:Date.now(),
    privacy:{
      consentRequired:true,
      playerNamesIncluded:false,
      recoveryDataIncluded:false,
      freeTextIncluded:false,
      transmission:'MANUAL_EXPORT_ONLY' as const,
    },
    sessions:consentedSessions,
    summaries:consentedSessions.map(session => summarisePlaytestSession(session, consentedEvents)),
    events:consentedEvents,
  };
};

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const playtestEventsAsCsv = (events = loadPlaytestEvents()) => {
  const fields: Array<keyof PlaytestEvent> = ['id','sessionId','occurredAt','type','phase','roundType','challengeId','playerCount','roundNumber','durationMs','seatScores','detail'];
  return [fields.join(','), ...events.map(event => fields.map(field => csvCell(event[field])).join(','))].join('\r\n');
};

export const playtestSessionsAsCsv = (sessions = loadPlaytestSessions(), events = loadPlaytestEvents()) => {
  const consentedSessions = sessions.filter(session => session.consent);
  const headings = ['sessionId','groupCode','cohortSlot','independentGroupConfirmed','configurationMatchesCohort','consentNotice','consentAcceptedAt','status','playerCount','preset','politicsMode','startedAt','matchDurationMs','timeToFirstQuestionMs','pageScrolls','controlConfusion','mistakenInputs','hostAssistance','deadTime','deadTimeMs','progressionFailures','enjoyment','clarity','pacing','wouldPlayAgain','favouriteDepartment','mostConfusingDepartment','passedUnassisted'];
  const rows = consentedSessions.map(session => {
    const summary = summarisePlaytestSession(session, events);
    const deadTimeMs=events.filter(event=>event.sessionId===session.id&&event.type==='DEAD_TIME').reduce((sum,event)=>sum+(event.durationMs??0),0);
    return [session.id,session.groupCode,session.cohortSlot,summary.independentGroupConfirmed,summary.configurationMatchesCohort,session.consent?.noticeVersion,session.consent?.acceptedAt,session.status,session.playerCount,session.preset,session.politicsMode,session.startedAt,summary.matchDurationMs,summary.timeToFirstQuestionMs,summary.eventCounts.PAGE_SCROLL,summary.eventCounts.CONTROL_CONFUSION,summary.eventCounts.MISTAKEN_INPUT,summary.eventCounts.HOST_ASSISTANCE,summary.eventCounts.DEAD_TIME,deadTimeMs,summary.eventCounts.PROGRESSION_FAILURE,summary.enjoymentRating,summary.clarityRating,summary.pacingRating,summary.wouldPlayAgain,summary.favouriteDepartment,summary.mostConfusingDepartment,summary.passedUnassisted].map(csvCell).join(',');
  });
  return [headings.join(','), ...rows].join('\r\n');
};

const download = (contents: string, type: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
};

export const exportPlaytestJson = () => download(JSON.stringify(buildPlaytestReport(), null, 2), 'application/json', 'bureau-consented-beta-report.json');
export const exportPlaytestCsv = () => download(playtestSessionsAsCsv(), 'text/csv;charset=utf-8', 'bureau-consented-beta-sessions.csv');
export const clearPlaytestEvents = () => {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(PLAYTEST_EVENT_KEY);
    localStorage.removeItem(PLAYTEST_SESSION_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch { /* ignored */ }
};
