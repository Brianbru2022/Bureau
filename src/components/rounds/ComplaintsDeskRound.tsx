import { useEffect, useState } from 'react';
import { LoaderCircle, MessageSquareWarning, Scale, Stamp } from 'lucide-react';
import type { ComplaintsDeskChallenge, Player, RoundVisualState, ScorePaceProfile } from '../../types';
import { COMPLAINTS_DESK_ART } from '../../data/promotedVisualAssets';
import { potentialComplaintsDeskScore, scoreComplaintsDesk } from '../../game/complaintsDesk';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { paceScoreNote } from '../../game/scorePacing';

interface Props { challenge: ComplaintsDeskChallenge; currentPlayer: Player; scorePaceProfile?: ScorePaceProfile; onComplete: (score: number) => void }
interface Resolution { score: number; elapsedMs: number; confidence: number; selectedIndex: number; correct: boolean }

const statementLetter = (index: number) => String.fromCharCode(65 + index);

export const ComplaintsDeskRound = ({ challenge, currentPlayer, scorePaceProfile = 'STANDARD', onComplete }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [startedAt] = useState(() => performance.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);

  useEffect(() => {
    if (visualState !== 'ACTIVE') return undefined;
    const update = () => setElapsedMs(performance.now() - startedAt);
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [startedAt, visualState]);

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decision = window.setTimeout(() => {
      setVisualState(pending.correct ? 'ACCEPTED' : 'REJECTED');
      sound.playDepartmentCue('COMPLAINTS_DESK', pending.correct ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('COMPLAINTS_DESK', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(decision); window.clearTimeout(dossier); };
  }, [pending]);

  const lodgeObjection = () => {
    if (selectedIndex === null || visualState !== 'ACTIVE') return;
    const exactElapsed = performance.now() - startedAt;
    const correct = selectedIndex === challenge.falseStatementIndex;
    sound.playDepartmentCue('COMPLAINTS_DESK', 'PROCESSING');
    setElapsedMs(exactElapsed);
    setVisualState('PROCESSING');
    setPending({
      score: scoreComplaintsDesk(exactElapsed, confidence, correct, scorePaceProfile),
      elapsedMs: exactElapsed,
      confidence,
      selectedIndex,
      correct,
    });
  };

  const potentialScore = potentialComplaintsDeskScore(elapsedMs, confidence, scorePaceProfile);

  return <>
    <ApparatusFrame compact state={visualState} scorePaceProfile={scorePaceProfile} eyebrow="Office of Public Objections • Fact-Checking Analyser" title={challenge.caseTitle} subtitle={<><strong>{currentPlayer.name}</strong>, find the single inaccurate general-knowledge statement, then calibrate how certain you are.</>} icon={<MessageSquareWarning size={27}/>} accent="#b94d56" instrumentLabel="COMPLAINTS DESK" decorativeArt={COMPLAINTS_DESK_ART} dataRoundType="COMPLAINTS_DESK">
      <div className="relative min-h-[520px] overflow-hidden rounded-2xl border-[3px] border-[#65442c] bg-[#203f48] p-3 sm:p-5">
        <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={COMPLAINTS_DESK_ART.compact}/><img src={COMPLAINTS_DESK_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover opacity-45"/></picture>
        <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(270px,.55fr)]">
          <section className="rounded-xl border-[3px] border-[#755137] bg-[#fff7df]/95 p-3 shadow-[0_7px_0_#5c3825]" aria-label="Case evidence">
            <div className="mb-3 rounded-lg border-2 border-[#8b6743] bg-[#ead8a8] p-3">
              <div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[.18em]">Fact-checking terms</div>
              <ol className="mt-2 grid gap-1 font-['Fraunces'] text-sm font-semibold text-[#3e4543]">
                {challenge.certifiedFacts.map((fact, index) => <li key={fact}><span className="mr-2 font-['Courier_Prime'] text-xs font-black">{index + 1}.</span>{fact}</li>)}
              </ol>
            </div>
            <div className="grid gap-2" role="radiogroup" aria-label="Statements under complaint">
              {challenge.statements.map((statement, index) => {
                const selected = selectedIndex === index;
                return <button key={statement} type="button" role="radio" aria-checked={selected} disabled={visualState !== 'ACTIVE'} onClick={() => { sound.playClick(); setSelectedIndex(index); }} className={`bureau-button flex min-h-12 items-center gap-3 rounded-lg border-2 px-3 py-2 text-left font-['Fraunces'] text-sm font-semibold ${selected ? 'border-[#fff0b6] bg-[#b94d56] text-white shadow-[0_4px_0_#6a3035]' : 'border-[#785438] bg-[#f9ebc5] text-[#30434a] shadow-[0_3px_0_#785438]'}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-['Courier_Prime'] font-black ${selected ? 'border-white bg-[#76343a]' : 'border-[#785438] bg-[#e1b956]'}`}>{statementLetter(index)}</span>
                  {statement}
                </button>;
              })}
            </div>
          </section>

          <aside className="rounded-xl border-[3px] border-[#65442c] bg-[#fff4d4]/95 p-4 shadow-[0_7px_0_#5c3825]">
            <div className="flex items-center gap-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest"><Scale size={18}/> Confidence calibration</div>
            <output htmlFor="complaint-confidence" className="mt-3 block text-center font-['Cinzel'] text-4xl font-black text-[#b94d56]">{confidence}%</output>
            <input id="complaint-confidence" type="range" min="0" max="100" step="1" value={confidence} disabled={visualState !== 'ACTIVE'} onChange={event => setConfidence(Number(event.target.value))} aria-label="Confidence percentage" className="mt-3 min-h-11 w-full accent-[#b94d56]"/>
            <div className="mt-3 rounded-lg border-2 border-[#8b6743] bg-[#294d57] p-3 text-center text-[#fff4d4]">
              <div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Current calibrated award</div>
              <div className="font-['Cinzel'] text-3xl font-black">{potentialScore}</div>
              <div className="font-['Courier_Prime'] text-xs">if the objection is upheld</div>
            </div>
            <p className="mt-3 font-['Courier_Prime'] text-xs leading-relaxed text-[#655543]">{paceScoreNote(scorePaceProfile)} Every exact confidence point still matters; an unsupported objection receives zero.</p>
            <button type="button" disabled={selectedIndex === null || visualState !== 'ACTIVE'} onClick={lodgeObjection} className="bureau-button mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#65442c] bg-[#b94d56] px-4 py-3 font-['Courier_Prime'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:cursor-not-allowed disabled:opacity-45">
              {visualState === 'PROCESSING' ? <LoaderCircle className="animate-spin" size={18}/> : <Stamp size={18}/>} Lodge objection
            </button>
          </aside>
        </div>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="COMPLAINTS_DESK" questionPrompt={challenge.prompt} explanation={`${challenge.explanation} Confidence was ${result.confidence}% after ${(result.elapsedMs / 1000).toFixed(1)} seconds.`} source={challenge.source} playerAnswer={`Statement ${statementLetter(result.selectedIndex)}: ${challenge.statements[result.selectedIndex]}`} correctAnswer={`Statement ${statementLetter(challenge.falseStatementIndex)}: ${challenge.statements[challenge.falseStatementIndex]}`} history={currentPlayer.stats} isCorrect={result.correct} onProceed={() => onComplete(result.score)}/> : null}
  </>;
};
