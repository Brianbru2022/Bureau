import { useEffect, useState } from 'react';
import { BookOpenCheck, Eye, LoaderCircle, Stamp } from 'lucide-react';
import type { MissingMinutesChallenge, Player, RoundVisualState, ScorePaceProfile } from '../../types';
import { MISSING_MINUTES_ART } from '../../data/promotedVisualAssets';
import { potentialMissingMinutesScore, scoreMissingMinutes } from '../../game/missingMinutes';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { paceScoreNote } from '../../game/scorePacing';

interface Props { challenge: MissingMinutesChallenge; currentPlayer: Player; scorePaceProfile?: ScorePaceProfile; onComplete: (score: number) => void }
interface Resolution { score: number; correct: boolean; answer: string; viewedMs: number }
type Phase = 'STUDY' | 'ANSWER';

export const MissingMinutesRound = ({ challenge, currentPlayer, scorePaceProfile = 'STANDARD', onComplete }: Props) => {
  const [phase, setPhase] = useState<Phase>('STUDY');
  const [accumulatedViewedMs, setAccumulatedViewedMs] = useState(0);
  const [studyStartedAt, setStudyStartedAt] = useState(() => performance.now());
  const [displayViewedMs, setDisplayViewedMs] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);

  useEffect(() => {
    if (phase !== 'STUDY' || visualState !== 'ACTIVE') return undefined;
    const update = () => setDisplayViewedMs(accumulatedViewedMs + performance.now() - studyStartedAt);
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [accumulatedViewedMs, phase, studyStartedAt, visualState]);

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decision = window.setTimeout(() => {
      setVisualState(pending.correct ? 'ACCEPTED' : 'REJECTED');
      sound.playDepartmentCue('MISSING_MINUTES', pending.correct ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('MISSING_MINUTES', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(decision); window.clearTimeout(dossier); };
  }, [pending]);

  const closeRecord = () => {
    if (phase !== 'STUDY' || visualState !== 'ACTIVE') return;
    const viewedMs = accumulatedViewedMs + performance.now() - studyStartedAt;
    setAccumulatedViewedMs(viewedMs);
    setDisplayViewedMs(viewedMs);
    setPhase('ANSWER');
    sound.playDepartmentCue('MISSING_MINUTES', 'MOVE');
  };

  const reviewAgain = () => {
    if (visualState !== 'ACTIVE') return;
    setStudyStartedAt(performance.now());
    setSelectedAnswer(null);
    setPhase('STUDY');
    sound.playDepartmentCue('MISSING_MINUTES', 'MOVE');
  };

  const submit = () => {
    if (!selectedAnswer || visualState !== 'ACTIVE') return;
    const correctAnswer = challenge.entries[challenge.missingEntryIndex];
    const correct = selectedAnswer === correctAnswer;
    sound.playDepartmentCue('MISSING_MINUTES', 'PROCESSING');
    setVisualState('PROCESSING');
    setPending({ score: scoreMissingMinutes(accumulatedViewedMs, correct, scorePaceProfile), correct, answer: selectedAnswer, viewedMs: accumulatedViewedMs });
  };

  const potentialScore = potentialMissingMinutesScore(displayViewedMs, scorePaceProfile);
  const visibleEntries = phase === 'STUDY'
    ? challenge.entries
    : challenge.entries.filter((_, index) => index !== challenge.missingEntryIndex);

  return <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
    <ApparatusFrame compact state={visualState} scorePaceProfile={scorePaceProfile} eyebrow="Committee Secretariat • Factual Recall Register" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, study the verified general-knowledge record and close it when ready. {paceScoreNote(scorePaceProfile)}</>} icon={<BookOpenCheck size={27}/>} accent="#376d9b" instrumentLabel="FACT RECORDER" decorativeArt={MISSING_MINUTES_ART} dataRoundType="MISSING_MINUTES">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.38fr)_minmax(290px,.62fr)]">
        <section aria-label={phase === 'STUDY' ? 'Complete factual briefing' : 'Factual briefing with one fact missing'} className="relative overflow-hidden rounded-[22px] border-[4px] border-[#65442c] bg-[#173f3d] p-3 shadow-[inset_0_0_0_4px_#477b69,0_7px_0_#65442c] sm:p-4">
          <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={MISSING_MINUTES_ART.compact}/><img src={MISSING_MINUTES_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover"/></picture>
          <div className="relative z-10 mb-3 flex flex-wrap justify-between gap-2 rounded-lg border-2 border-[#65442c] bg-[#e1b95e]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#563d2b] shadow-[0_2px_0_#65442c] sm:text-xs"><span>{challenge.recordTitle}</span><span>{phase === 'STUDY' ? 'Record open' : 'One minute removed'} • {potentialScore} points</span></div>
          <ol className="relative z-10 grid min-h-[310px] content-center gap-2 rounded-2xl border-[3px] border-[#76583f] bg-[#fff1c9]/94 p-4 shadow-inner sm:grid-cols-2" aria-live="polite">
            {visibleEntries.map((entry, index) => <li key={entry} className="bureau-paper-drop flex min-h-16 items-center rounded-xl border-2 border-[#b49464] bg-[#f8e8bd] px-3 py-2 font-['Courier_Prime'] text-[10px] font-bold leading-relaxed text-[#4b4439] shadow-[0_2px_0_#8b6e49]"><span className="mr-2 text-[#376d9b]">{String(index + 1).padStart(2, '0')}.</span>{entry}</li>)}
            {phase === 'ANSWER' ? <li aria-label="Missing fact" className="flex min-h-16 items-center justify-center rounded-xl border-2 border-dashed border-[#9a4d4c] bg-[#e8cfb1] font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#8b453f]">Fact removed</li> : null}
          </ol>
        </section>
        <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
          <strong className="block border-b-2 border-dashed border-[#a7895e] pb-3 font-['Cinzel'] text-sm text-[#604635]">Knowledge Recall Control</strong>
          {phase === 'STUDY' ? <div className="mt-4 space-y-3">
            <div className="rounded-xl border-2 border-[#8b704f] bg-[#f2dfae] p-3 text-center"><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#74573f]">Continuously calculated award</span><strong className="font-['Space_Mono'] text-3xl text-[#30434a]">{potentialScore}</strong></div>
            <button type="button" onClick={closeRecord} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#376d9b] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]"><Stamp size={18}/>Close the fact register</button>
            <p className="font-['Courier_Prime'] text-xs leading-relaxed text-[#77634d]">There are no score bands. {paceScoreNote(scorePaceProfile)}</p>
          </div> : <div className="mt-4 space-y-2">
            <span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#74573f]">Which verified fact was removed?</span>
            {challenge.options.map(option => <button key={option} type="button" aria-pressed={selectedAnswer === option} disabled={visualState !== 'ACTIVE'} onClick={() => { sound.playClick(); setSelectedAnswer(option); }} className={`w-full rounded-lg border-2 px-3 py-3 text-left font-['Cinzel'] text-[10px] font-bold shadow-[0_2px_0_#65442c] ${selectedAnswer === option ? 'border-[#315d80] bg-[#b7d5e6]' : 'border-[#887052] bg-[#f5e8c5]'}`}>{option}</button>)}
            <button type="button" onClick={reviewAgain} disabled={visualState !== 'ACTIVE'} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#65442c] bg-[#dfad43] px-3 py-3 font-['Cinzel'] text-[10px] font-black uppercase text-[#503a29] shadow-[0_3px_0_#65442c]"><Eye size={17}/>Review original again</button>
            <button type="button" disabled={!selectedAnswer || visualState !== 'ACTIVE'} onClick={submit} className="bureau-button mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#376d9b] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">{visualState === 'PROCESSING' ? <><LoaderCircle className="bureau-route-spinner" size={18}/>Checking facts</> : <><Stamp size={18}/>Seal recollection</>}</button>
          </div>}
        </aside>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="MISSING_MINUTES" questionPrompt={challenge.prompt} explanation={`${challenge.explanation} Total viewing time: ${(result.viewedMs / 1000).toFixed(1)} seconds.`} source={challenge.source} playerAnswer={result.answer} correctAnswer={challenge.entries[challenge.missingEntryIndex]} history={currentPlayer.stats} isCorrect={result.correct} onProceed={() => onComplete(result.score)}/> : null}
  </div>;
};
