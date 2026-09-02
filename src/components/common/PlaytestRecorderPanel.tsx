import React from 'react';
import { AlertTriangle, CircleHelp, Download, HandHelping, Hourglass, PlayCircle, StopCircle, Trash2 } from 'lucide-react';
import type { GamePhase, PlaytestCohortSlot, RoundType } from '../../types';
import {
  abandonActivePlaytestSession,
  armPlaytestSession,
  clearPlaytestEvents,
  exportPlaytestCsv,
  exportPlaytestJson,
  getActivePlaytestSession,
  loadPlaytestEvents,
  loadPlaytestSessions,
  PLAYTEST_COHORT_REQUIREMENTS,
  recordPlaytestEvent,
} from '../../game/playtest';

interface PlaytestRecorderPanelProps {
  phase: GamePhase;
  playerCount: number;
  roundType?: RoundType;
  challengeId?: string;
}

export const PlaytestRecorderPanel: React.FC<PlaytestRecorderPanelProps> = ({ phase, playerCount, roundType, challengeId }) => {
  const [groupCode, setGroupCode] = React.useState('GROUP-01');
  const [consentAccepted, setConsentAccepted] = React.useState(false);
  const [eligibilityConfirmed, setEligibilityConfirmed] = React.useState(false);
  const [cohortSlot, setCohortSlot] = React.useState<PlaytestCohortSlot>('SOLO_FIRST');
  const [deadTimeSeconds, setDeadTimeSeconds] = React.useState(5);
  const [revision, setRevision] = React.useState(0);
  const activeSession = React.useMemo(() => getActivePlaytestSession(), [revision]);
  const eventCount = React.useMemo(() => loadPlaytestEvents().length, [revision]);
  const sessionCount = React.useMemo(() => loadPlaytestSessions().length, [revision]);
  const refresh = () => setRevision(value => value + 1);
  const fileIncident = (type:'CONTROL_CONFUSION'|'MISTAKEN_INPUT'|'HOST_ASSISTANCE'|'DEAD_TIME', detail:string, durationMs?:number) => {
    recordPlaytestEvent({ type, phase, roundType, challengeId, playerCount, detail, durationMs });
    refresh();
  };

  return <section className="mt-4 rounded-xl border-2 border-[#765139] bg-[#dce9e5] p-4">
    <div className="flex items-start justify-between gap-3"><div><strong className="font-['Cinzel'] text-sm text-[#244b55]">Structured blind play-test</strong><p className="mt-1 font-['Fraunces'] text-xs text-[#53645f]">Local-only session evidence. Record observations without coaching the candidates.</p></div><span className="shrink-0 font-['Courier_Prime'] text-xs font-bold uppercase text-[#64736e]">{sessionCount} sessions · {eventCount} events</span></div>
    {!activeSession ? <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <label className="font-['Courier_Prime'] text-xs font-black uppercase text-[#5d5143]">Independent group code<input value={groupCode} maxLength={40} onChange={event=>setGroupCode(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 font-['Plus_Jakarta_Sans'] text-sm normal-case"/></label>
      <label className="font-['Courier_Prime'] text-xs font-black uppercase text-[#5d5143]">Required cohort session<select value={cohortSlot} onChange={event=>setCohortSlot(event.target.value as PlaytestCohortSlot)} className="mt-1 min-h-11 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 font-['Plus_Jakarta_Sans'] text-sm normal-case">{(Object.keys(PLAYTEST_COHORT_REQUIREMENTS) as PlaytestCohortSlot[]).map(slot=><option key={slot} value={slot}>{PLAYTEST_COHORT_REQUIREMENTS[slot].label}</option>)}</select></label>
      <label className="sm:col-span-2 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border-2 border-[#9b7a48] bg-[#fff7df] p-3 font-['Fraunces'] text-xs text-[#4f463b]"><input type="checkbox" checked={eligibilityConfirmed} onChange={event=>setEligibilityConfirmed(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#2f8f95]"/><span><strong className="font-['Cinzel'] text-[10px] uppercase text-[#244b55]">Independent-group eligibility confirmed</strong><br/>These candidates have not watched development or a previous Bureau test, this group is independent of the other filed groups, and the code above contains no personal identifier.</span></label>
      <label className="sm:col-span-2 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border-2 border-[#9b7a48] bg-[#fff7df] p-3 font-['Fraunces'] text-xs text-[#4f463b]"><input type="checkbox" checked={consentAccepted} onChange={event=>setConsentAccepted(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#2f8f95]"/><span><strong className="font-['Cinzel'] text-[10px] uppercase text-[#244b55]">Candidates consent to local beta diagnostics</strong><br/>This records timings and observer-marked incidents on this PC only. It records no names, audio, network data or automatic transmission. Export is manual and free-text notes are excluded.</span></label>
      <button type="button" disabled={phase!=='TITLE'||!groupCode.trim()||!consentAccepted||!eligibilityConfirmed} onClick={()=>{armPlaytestSession(groupCode,consentAccepted,cohortSlot,eligibilityConfirmed);refresh();}} className="bureau-button sm:col-span-2 rounded-lg bg-[#4f7457] px-4 py-3 text-[10px] font-black uppercase text-white disabled:opacity-40"><PlayCircle size={14} className="mr-1 inline"/>Arm required assessment</button>
      {phase!=='TITLE'?<p className="sm:col-span-2 font-['Fraunces'] text-xs text-[#765139]">Return to the opening screen before arming a new observed session.</p>:null}
    </div> : <div className="mt-3 rounded-lg border-2 border-[#4f7457] bg-[#eef1d9] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-['Courier_Prime'] text-[10px] font-black uppercase text-[#31533b]">{activeSession.groupCode} · eligibility and consent filed · {activeSession.status.replaceAll('_',' ')}</span><button type="button" onClick={()=>{if(window.confirm('Abandon this observed session? Its existing evidence will be retained.')){abandonActivePlaytestSession();refresh();}}} className="bureau-button rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 py-2 text-xs font-black uppercase text-[#765139]"><StopCircle size={13} className="mr-1 inline"/>Abandon</button></div><p className="mt-1 font-['Fraunces'] text-xs text-[#53645f]">Required: {activeSession.cohortSlot ? PLAYTEST_COHORT_REQUIREMENTS[activeSession.cohortSlot].label : 'legacy unassigned session'}. Configuration, duration and first-question time are recorded automatically.</p></div>}
    {activeSession?.status==='ACTIVE'?<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" onClick={()=>fileIncident('CONTROL_CONFUSION','Observer marked a control or instruction that candidates could not explain.')} className="bureau-button rounded-lg bg-[#b45c48] px-2 py-2 text-xs font-black uppercase text-white"><CircleHelp size={14} className="mr-1 inline"/>Control unclear</button><button type="button" onClick={()=>fileIncident('MISTAKEN_INPUT','Observer marked an unintended or mistaken input.')} className="bureau-button rounded-lg bg-[#d9644f] px-2 py-2 text-xs font-black uppercase text-white"><AlertTriangle size={14} className="mr-1 inline"/>Mistaken input</button><div className="grid grid-cols-[1fr_auto] gap-1"><select aria-label="Dead-time duration" value={deadTimeSeconds} onChange={event=>setDeadTimeSeconds(Number(event.target.value))} className="min-h-11 rounded-lg border-2 border-[#765139] bg-[#fff7df] px-1 text-[10px] font-bold">{[5,10,20,30,60].map(seconds=><option key={seconds} value={seconds}>{seconds}s</option>)}</select><button type="button" aria-label={`File ${deadTimeSeconds} seconds of dead time`} onClick={()=>fileIncident('DEAD_TIME',`Observer marked approximately ${deadTimeSeconds} seconds of avoidable waiting.`,deadTimeSeconds*1000)} className="bureau-button rounded-lg bg-[#8a6f9e] px-2 text-xs font-black uppercase text-white"><Hourglass size={14}/></button></div><button type="button" onClick={()=>fileIncident('HOST_ASSISTANCE','Observer had to explain or operate a control for the candidates.')} className="bureau-button rounded-lg bg-[#376d9b] px-2 py-2 text-xs font-black uppercase text-white"><HandHelping size={14} className="mr-1 inline"/>Host assisted</button></div>:null}
    <div className="mt-3 grid grid-cols-3 gap-2"><button type="button" onClick={exportPlaytestJson} className="bureau-button rounded-lg bg-[#376d9b] px-2 py-2 text-[10px] font-black uppercase text-white"><Download size={14} className="mr-1 inline"/>Beta JSON</button><button type="button" onClick={exportPlaytestCsv} className="bureau-button rounded-lg bg-[#2f8f95] px-2 py-2 text-[10px] font-black uppercase text-white"><Download size={14} className="mr-1 inline"/>Beta CSV</button><button type="button" onClick={()=>{if(window.confirm('Clear every locally recorded play-test session and event?')){clearPlaytestEvents();setConsentAccepted(false);setEligibilityConfirmed(false);refresh();}}} className="bureau-button rounded-lg bg-[#a9443d] px-2 py-2 text-[10px] font-black uppercase text-white"><Trash2 size={14} className="mr-1 inline"/>Clear all</button></div>
  </section>;
};
