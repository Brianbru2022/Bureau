import { useEffect, useState } from 'react';
import { Link2, LoaderCircle, RotateCcw, Stamp } from 'lucide-react';
import type { ChainOfCommandChallenge, Player, RoundVisualState, ScorePaceProfile } from '../../types';
import { CHAIN_OF_COMMAND_ART } from '../../data/promotedVisualAssets';
import { isCertifiedChain, potentialChainOfCommandScore, scoreChainOfCommand } from '../../game/chainOfCommand';
import { PRESENTATION_TIMING, RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { paceScoreNote } from '../../game/scorePacing';

interface Props { challenge: ChainOfCommandChallenge; currentPlayer: Player; scorePaceProfile?: ScorePaceProfile; onComplete: (score: number) => void }
interface Resolution { score: number; elapsedMs: number; answer: string }

export const ChainOfCommandRound = ({ challenge, currentPlayer, scorePaceProfile = 'STANDARD', onComplete }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [startedAt] = useState(() => performance.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);

  useEffect(() => {
    if (visualState !== 'ACTIVE' && visualState !== 'REJECTED') return undefined;
    const update = () => setElapsedMs(performance.now() - startedAt);
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [startedAt, visualState]);

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accepted = window.setTimeout(() => {
      setVisualState('ACCEPTED');
      sound.playDepartmentCue('CHAIN_OF_COMMAND', 'ACCEPTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('CHAIN_OF_COMMAND', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(accepted); window.clearTimeout(dossier); };
  }, [pending]);

  const chooseTile = (word: string) => {
    if (selected.length >= 4 || selected.includes(word) || visualState !== 'ACTIVE') return;
    sound.playDepartmentCue('CHAIN_OF_COMMAND', 'MOVE');
    setFeedback('');
    setSelected(words => [...words, word]);
  };

  const undo = () => {
    if (!selected.length || visualState !== 'ACTIVE') return;
    sound.playDepartmentCue('CHAIN_OF_COMMAND', 'MOVE');
    setFeedback('');
    setSelected(words => words.slice(0, -1));
  };

  const inspect = () => {
    if (selected.length !== 4 || visualState !== 'ACTIVE') return;
    const candidate = [challenge.chain[0], ...selected];
    const correct = isCertifiedChain(candidate, challenge.chain);
    const exactElapsed = performance.now() - startedAt;
    if (!correct) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sound.playDepartmentCue('CHAIN_OF_COMMAND', 'REJECTED');
      setFeedback('Sequence rejected. Reconsider the chronology while the clock continues.');
      setVisualState('REJECTED');
      window.setTimeout(() => setVisualState('ACTIVE'), motionDuration(PRESENTATION_TIMING.inputFeedbackMs, reduced));
      return;
    }
    sound.playDepartmentCue('CHAIN_OF_COMMAND', 'PROCESSING');
    setElapsedMs(exactElapsed);
    setVisualState('PROCESSING');
    setPending({ score: scoreChainOfCommand(exactElapsed, true, scorePaceProfile), elapsedMs: exactElapsed, answer: candidate.join(' → ') });
  };

  const potentialScore = potentialChainOfCommandScore(elapsedMs, scorePaceProfile);
  const chainSlots = [challenge.chain[0], ...selected, ...Array<string>(4 - selected.length).fill('')];

  return <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
    <ApparatusFrame compact state={visualState} scorePaceProfile={scorePaceProfile} eyebrow="Directorate of Ordered Knowledge • Chronology Relay" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, route four factual answers after the fixed starting record. Two decoys do not belong in the certified sequence.</>} icon={<Link2 size={27}/>} accent="#c07a36" instrumentLabel="KNOWLEDGE RELAY" decorativeArt={CHAIN_OF_COMMAND_ART} dataRoundType="CHAIN_OF_COMMAND">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.38fr)_minmax(290px,.62fr)]">
        <section aria-label="Chronological knowledge relay" className="relative overflow-hidden rounded-[22px] border-[4px] border-[#65442c] bg-[#173f3d] p-3 shadow-[inset_0_0_0_4px_#477b69,0_7px_0_#65442c] sm:p-4">
          <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={CHAIN_OF_COMMAND_ART.compact}/><img src={CHAIN_OF_COMMAND_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover"/></picture>
          <div className="relative z-10 mb-3 flex justify-between rounded-lg border-2 border-[#65442c] bg-[#e1b95e]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#563d2b] shadow-[0_2px_0_#65442c] sm:text-xs"><span>{selected.length}/4 knowledge links installed</span><span>{potentialScore} points available</span></div>
          <ol className="relative z-10 grid grid-cols-5 gap-1.5 rounded-2xl border-[3px] border-[#76583f] bg-[#173f3d]/88 p-3 shadow-inner" aria-label="Current factual sequence">
            {chainSlots.map((word, index) => <li key={`${index}-${word}`} className={`relative grid min-h-24 place-items-center rounded-full border-[3px] px-1 text-center font-['Cinzel'] text-xs font-black shadow-[0_4px_0_#65442c] sm:min-h-28 sm:text-xs ${word ? index === 0 ? 'border-[#65442c] bg-[#dfad43] text-[#503a29]' : 'bureau-paper-drop border-[#65442c] bg-[#fff1c9] text-[#30434a]' : 'border-dashed border-[#9f8257] bg-[#284d4b] text-[#d9bb6a]'}`}><span>{word || `Link ${index}`}</span>{index < 4 ? <span aria-hidden="true" className="absolute -right-2.5 top-1/2 z-20 h-2 w-4 -translate-y-1/2 rounded bg-[#e6a93e] shadow-[0_0_8px_#f4c764]"/> : null}</li>)}
          </ol>
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#244c50]/94 p-3" aria-label="Available factual answers">{challenge.tileOptions.map(word => <button key={word} type="button" disabled={selected.includes(word) || selected.length >= 4 || visualState !== 'ACTIVE'} onClick={() => chooseTile(word)} className="bureau-button min-h-12 rounded-lg border-2 border-[#65442c] bg-[#f4e2b7] px-2 py-2 font-['Cinzel'] text-[10px] font-black text-[#30434a] shadow-[0_3px_0_#65442c] disabled:opacity-35">{word}</button>)}</div>
        </section>
        <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
          <strong className="block border-b-2 border-dashed border-[#a7895e] pb-3 font-['Cinzel'] text-sm text-[#604635]">Chronology Control</strong>
          <div className="mt-4 space-y-3"><div className="rounded-xl border-2 border-[#8b704f] bg-[#f2dfae] p-3 text-center"><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Continuously calculated award</span><strong className="font-['Space_Mono'] text-3xl text-[#30434a]">{potentialScore}</strong></div>
            <button type="button" onClick={undo} disabled={!selected.length || visualState !== 'ACTIVE'} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#65442c] bg-[#dfad43] px-3 py-3 font-['Cinzel'] text-[10px] font-black uppercase text-[#503a29] shadow-[0_3px_0_#65442c] disabled:opacity-40"><RotateCcw size={17}/>Undo last link</button>
            <button type="button" onClick={inspect} disabled={selected.length !== 4 || visualState !== 'ACTIVE'} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#c15f3f] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">{visualState === 'PROCESSING' ? <><LoaderCircle className="bureau-route-spinner" size={18}/>Checking chronology</> : <><Stamp size={18}/>Inspect factual sequence</>}</button>
            <p role="status" className={`min-h-10 rounded-lg border-2 px-3 py-2 font-['Courier_Prime'] text-xs leading-relaxed ${feedback ? 'border-[#a34d45] bg-[#f2c8bc] text-[#783d38]' : 'border-[#b69a68] bg-[#f3e5bd] text-[#77634d]'}`}>{feedback || `Incorrect inspections do not apply a fixed penalty. ${paceScoreNote(scorePaceProfile)}`}</p>
          </div>
        </aside>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="CHAIN_OF_COMMAND" questionPrompt={challenge.prompt} explanation={`${challenge.explanation} Certified in ${(result.elapsedMs / 1000).toFixed(1)} seconds.`} source={challenge.source} playerAnswer={result.answer} correctAnswer={challenge.chain.join(' → ')} history={currentPlayer.stats} isCorrect onProceed={() => onComplete(result.score)}/> : null}
  </div>;
};
