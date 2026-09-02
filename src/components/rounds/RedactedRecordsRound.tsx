import { useEffect, useState } from 'react';
import { Eye, FileLock2, LoaderCircle, Stamp } from 'lucide-react';
import type { Player, RedactedRecordsChallenge, RoundVisualState } from '../../types';
import { REDACTED_RECORDS_ART } from '../../data/promotedVisualAssets';
import { potentialRedactedScore, scoreRedactedRecords } from '../../game/redactedRecords';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface Props { challenge: RedactedRecordsChallenge; currentPlayer: Player; onComplete: (score: number) => void }
interface Resolution { score:number; correct:boolean; answer:string }

export const RedactedRecordsRound = ({ challenge, currentPlayer, onComplete }: Props) => {
  const [linesVisible,setLinesVisible]=useState(1);
  const [identifying,setIdentifying]=useState(false);
  const [selectedAnswer,setSelectedAnswer]=useState<string|null>(null);
  const [visualState,setVisualState]=useState<RoundVisualState>('ACTIVE');
  const [pending,setPending]=useState<Resolution|null>(null);
  const [result,setResult]=useState<Resolution|null>(null);
  const potentialScore=potentialRedactedScore(linesVisible);

  useEffect(()=>{
    if(!pending)return undefined;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decision=window.setTimeout(()=>{setVisualState(pending.correct?'ACCEPTED':'REJECTED');sound.playDepartmentCue('REDACTED_RECORDS',pending.correct?'ACCEPTED':'REJECTED')},motionDuration(RESULT_SEQUENCE.decisionMs,reduced));
    const dossier=window.setTimeout(()=>{setVisualState('RESULT');sound.playDepartmentCue('REDACTED_RECORDS','RESULT');setResult(pending);setPending(null)},motionDuration(RESULT_SEQUENCE.dossierMs,reduced));
    return()=>{window.clearTimeout(decision);window.clearTimeout(dossier)};
  },[pending]);

  const revealLine=()=>{if(linesVisible>=4||visualState!=='ACTIVE'||identifying)return;sound.playDepartmentCue('REDACTED_RECORDS','MOVE');setLinesVisible(value=>value+1)};
  const submit=()=>{if(!selectedAnswer||visualState!=='ACTIVE')return;const normalized=selectedAnswer.toLowerCase();const correct=normalized===challenge.subjectName.toLowerCase()||challenge.aliases.some(alias=>alias.toLowerCase()===normalized);sound.playDepartmentCue('REDACTED_RECORDS','PROCESSING');setVisualState('PROCESSING');setPending({score:scoreRedactedRecords(linesVisible,correct),correct,answer:selectedAnswer})};

  return <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
    <ApparatusFrame compact state={visualState} eyebrow="Bureau Declassification Office • Controlled Disclosure Desk" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, identify the subject before the file becomes administratively obvious.</>} icon={<FileLock2 size={27}/>} accent="#8b516f" instrumentLabel="REDACTION DESK" decorativeArt={REDACTED_RECORDS_ART} dataRoundType="REDACTED_RECORDS">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
        <section aria-label="Partially declassified document" className="rounded-[22px] border-[4px] border-[#65442c] bg-[#244c50]/95 p-3 shadow-[inset_0_0_0_4px_#4c7775,0_7px_0_#65442c] sm:p-4">
          <div className="relative mb-3 h-28 overflow-hidden rounded-xl border-[3px] border-[#65442c] bg-[#e8d6ac] shadow-inner"><picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={REDACTED_RECORDS_ART.compact}/><img src={REDACTED_RECORDS_ART.desktop} alt="" onError={event=>markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover object-top"/></picture><div className="absolute inset-x-2 bottom-2 flex justify-between rounded-lg border-2 border-[#65442c] bg-[#d8b45e]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#563d2b] shadow-[0_2px_0_#65442c] sm:text-xs"><span>Disclosure authority {linesVisible}/4</span><span>{potentialScore} points available</span></div></div>
          <div className="space-y-2 rounded-xl border-[3px] border-[#65442c] bg-[#fff5d7]/95 p-3 shadow-inner" aria-live="polite">
            {challenge.clues.map((clue,index)=>index<linesVisible?<div key={clue} className="bureau-paper-drop rounded-lg border-2 border-[#a7885f] bg-[#f3e5bd] px-3 py-3 font-['Courier_Prime'] text-[11px] font-bold leading-relaxed text-[#514437]"><span className="mr-2 text-[#9a4d4c]">{String(index+1).padStart(2,'0')}.</span>{clue}</div>:<div key={clue} aria-label={`Classified line ${index+1}`} className="relative h-12 overflow-hidden rounded-lg border-2 border-[#3a3330] bg-[#2e2b29]"><span aria-hidden="true" className="absolute inset-x-4 top-1/2 h-3 -translate-y-1/2 bg-black shadow-[0_0_0_2px_#171615]"/></div>)}
          </div>
        </section>
        <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
          <strong className="block border-b-2 border-dashed border-[#a7895e] pb-3 font-['Cinzel'] text-sm text-[#604635]">Classification Control</strong>
          {!identifying?<div className="mt-4 space-y-3"><button type="button" onClick={()=>{sound.playStamp();setIdentifying(true)}} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#d95850] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]"><Stamp size={18}/>Identify now — {potentialScore}</button>{linesVisible<4?<button type="button" onClick={revealLine} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#dfad43] px-3 py-3 font-['Cinzel'] text-[10px] font-black uppercase text-[#503a29] shadow-[0_4px_0_#65442c]"><Eye size={18}/>Declassify line {linesVisible+1} — {potentialRedactedScore(linesVisible+1)}</button>:null}<p className="font-['Courier_Prime'] text-xs leading-relaxed text-[#77634d]">Once the identification seal is broken, further disclosure is prohibited.</p></div>:<div className="mt-4 space-y-2"><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#74573f]">Select the subject</span>{challenge.options.map(option=><button key={option} type="button" aria-pressed={selectedAnswer===option} disabled={visualState!=='ACTIVE'} onClick={()=>{sound.playClick();setSelectedAnswer(option)}} className={`w-full rounded-lg border-2 px-3 py-3 text-left font-['Cinzel'] text-xs font-bold shadow-[0_2px_0_#65442c] ${selectedAnswer===option?'border-[#7d405b] bg-[#d9a6bd]':'border-[#887052] bg-[#f5e8c5]'}`}>{option}</button>)}<button type="button" disabled={!selectedAnswer||visualState!=='ACTIVE'} onClick={submit} className="bureau-button mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#8b516f] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">{visualState==='PROCESSING'?<><LoaderCircle className="bureau-route-spinner" size={18}/>Checking clearance</>:<><Stamp size={18}/>Seal identification</>}</button></div>}
        </aside>
      </div>
    </ApparatusFrame>
    {result?<CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="REDACTED_RECORDS" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={result.answer} correctAnswer={challenge.subjectName} history={currentPlayer.stats} isCorrect={result.correct} onProceed={()=>onComplete(result.score)}/>:null}
  </div>;
};
