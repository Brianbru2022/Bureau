import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Armchair, ClipboardCheck, LoaderCircle, Stamp } from 'lucide-react';
import type { Player, RoundVisualState, ScorePaceProfile, SeatingCommitteeChallenge } from '../../types';
import { SEATING_COMMITTEE_ART } from '../../data/promotedVisualAssets';
import { scoreSeatingCommittee, seatingAccuracy } from '../../game/seatingCommittee';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { paceScoreNote } from '../../game/scorePacing';

interface Props { challenge: SeatingCommitteeChallenge; currentPlayer: Player; scorePaceProfile?: ScorePaceProfile; onComplete: (score: number) => void }
interface Resolution { score: number; elapsedMs: number; order: string[]; accuracy: number; correct: boolean }

export const SeatingCommitteeRound = ({ challenge, currentPlayer, scorePaceProfile = 'STANDARD', onComplete }: Props) => {
  const [order, setOrder] = useState<string[]>(() => [...challenge.officials]);
  const [startedAt] = useState(() => performance.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState('');

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
      sound.playDepartmentCue('SEATING_COMMITTEE', pending.correct ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('SEATING_COMMITTEE', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(decision); window.clearTimeout(dossier); };
  }, [pending]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length || visualState !== 'ACTIVE') return;
    sound.playDepartmentCue('SEATING_COMMITTEE', 'MOVE');
    setMoveAnnouncement(`${order[index]} moved to position ${target + 1} of ${order.length}.`);
    setOrder(current => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const certify = () => {
    if (visualState !== 'ACTIVE') return;
    const exactElapsed = performance.now() - startedAt;
    const accuracy = seatingAccuracy(order, challenge.correctOrder);
    const correct = accuracy === 1;
    sound.playDepartmentCue('SEATING_COMMITTEE', 'PROCESSING');
    setElapsedMs(exactElapsed);
    setVisualState('PROCESSING');
    setPending({ score: scoreSeatingCommittee(order, challenge.correctOrder, exactElapsed, scorePaceProfile), elapsedMs: exactElapsed, order: [...order], accuracy, correct });
  };

  return <>
    <ApparatusFrame compact state={visualState} scorePaceProfile={scorePaceProfile} eyebrow="Directorate of Historical Precedence • Chronology Chamber" title={challenge.hearingTitle} subtitle={<><strong>{currentPlayer.name}</strong>, arrange all five factual records from earliest to latest. Every displaced record proportionally reduces the award. {paceScoreNote(scorePaceProfile)}</>} icon={<Armchair size={27}/>} accent="#477b5a" instrumentLabel="ORDERING COMMITTEE" decorativeArt={SEATING_COMMITTEE_ART} dataRoundType="SEATING_COMMITTEE">
      <div className="relative min-h-[480px] overflow-hidden rounded-2xl border-[3px] border-[#65442c] bg-[#233e38] p-3 sm:p-4">
        <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={SEATING_COMMITTEE_ART.compact}/><img src={SEATING_COMMITTEE_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover opacity-50"/></picture>
        <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
          <section aria-label="Chronological ordering plan" className="rounded-xl border-[3px] border-[#6e4b31] bg-[#173f3b]/95 p-3 shadow-[0_7px_0_#4d3022]">
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{moveAnnouncement}</div>
            <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-[#7d5b37] bg-[#ead7a6] px-3 py-2">
              <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Earliest</span>
              <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Latest</span>
            </div>
            <ol className="grid grid-cols-5 gap-2">
              {order.map((official, index) => <li key={official} className="min-w-0 rounded-xl border-2 border-[#a57b42] bg-[#f7e7bd] p-2 text-center shadow-[0_5px_0_#7a4c2d]">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#745034] bg-[#477b5a] font-['Courier_Prime'] text-sm font-black text-white">{index + 1}</div>
                <div className="mt-2 truncate font-['Cinzel'] text-xs font-black text-[#293e45] sm:text-sm" title={official}>{official}</div>
                <div className="mt-2 flex justify-center gap-1">
                  <button type="button" disabled={index === 0 || visualState !== 'ACTIVE'} onClick={() => move(index, -1)} aria-label={`Move ${official} left`} className="bureau-button flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[#65442c] bg-[#f2ca62] disabled:opacity-30"><ArrowLeft size={18}/></button>
                  <button type="button" disabled={index === order.length - 1 || visualState !== 'ACTIVE'} onClick={() => move(index, 1)} aria-label={`Move ${official} right`} className="bureau-button flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[#65442c] bg-[#f2ca62] disabled:opacity-30"><ArrowRight size={18}/></button>
                </div>
              </li>)}
            </ol>
            <p className="mt-3 text-center font-['Courier_Prime'] text-xs font-bold text-[#fff4d4]">Use the arrow controls to exchange neighbouring records.</p>
          </section>

          <aside className="rounded-xl border-[3px] border-[#65442c] bg-[#fff4d4]/95 p-3 shadow-[0_7px_0_#4d3022]">
            <div className="flex items-center gap-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest"><ClipboardCheck size={18}/> Archive notes</div>
            <ol className="mt-3 grid gap-2">
              {challenge.clues.map((clue, index) => <li key={clue} className="flex gap-2 rounded-lg border-2 border-[#a47c49] bg-[#f4e2b7] p-2 font-['Fraunces'] text-xs font-semibold text-[#45504c]"><strong className="font-['Courier_Prime']">{index + 1}.</strong>{clue}</li>)}
            </ol>
            <div className="mt-3 rounded-lg bg-[#294d57] p-2 text-center text-[#fff4d4]"><span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Inspection time</span><strong className="ml-2 font-['Cinzel']">{(elapsedMs / 1000).toFixed(1)}s</strong></div>
            <button type="button" disabled={visualState !== 'ACTIVE'} onClick={certify} className="bureau-button mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#65442c] bg-[#477b5a] px-4 py-3 font-['Courier_Prime'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">
              {visualState === 'PROCESSING' ? <LoaderCircle className="animate-spin" size={18}/> : <Stamp size={18}/>} Certify chronology
            </button>
          </aside>
        </div>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="SEATING_COMMITTEE" questionPrompt={challenge.prompt} explanation={`${challenge.explanation} The submitted plan was ${(result.accuracy * 100).toFixed(1)}% positionally accurate after ${(result.elapsedMs / 1000).toFixed(1)} seconds.`} source={challenge.source} playerAnswer={result.order.join(' → ')} correctAnswer={challenge.correctOrder.join(' → ')} history={currentPlayer.stats} isCorrect={result.correct} onProceed={() => onComplete(result.score)}/> : null}
  </>;
};
