import { useEffect, useState } from 'react';
import { Eye, Files, LoaderCircle, Stamp } from 'lucide-react';
import type { CommonDossierChallenge, Player, RoundVisualState } from '../../types';
import { COMMON_DOSSIER_ART } from '../../data/promotedVisualAssets';
import { potentialCommonDossierScore, scoreCommonDossier } from '../../game/commonDossier';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface Props { challenge: CommonDossierChallenge; currentPlayer: Player; onComplete: (score: number) => void }
interface Resolution { score: number; correct: boolean; answer: string }

export const CommonDossierRound = ({ challenge, currentPlayer, onComplete }: Props) => {
  const [exhibitsVisible, setExhibitsVisible] = useState(1);
  const [answering, setAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);
  const potentialScore = potentialCommonDossierScore(exhibitsVisible);

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decision = window.setTimeout(() => {
      setVisualState(pending.correct ? 'ACCEPTED' : 'REJECTED');
      sound.playDepartmentCue('COMMON_DOSSIER', pending.correct ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('COMMON_DOSSIER', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(decision); window.clearTimeout(dossier); };
  }, [pending]);

  const discloseExhibit = () => {
    if (exhibitsVisible >= 4 || visualState !== 'ACTIVE' || answering) return;
    sound.playDepartmentCue('COMMON_DOSSIER', 'MOVE');
    setExhibitsVisible(value => value + 1);
  };

  const submit = () => {
    if (!selectedAnswer || visualState !== 'ACTIVE') return;
    const normalized = selectedAnswer.toLocaleLowerCase('en-GB');
    const correct = normalized === challenge.connection.toLocaleLowerCase('en-GB')
      || challenge.aliases.some(alias => alias.toLocaleLowerCase('en-GB') === normalized);
    sound.playDepartmentCue('COMMON_DOSSIER', 'PROCESSING');
    setVisualState('PROCESSING');
    setPending({ score: scoreCommonDossier(exhibitsVisible, correct), correct, answer: selectedAnswer });
  };

  return <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
    <ApparatusFrame compact state={visualState} eyebrow="Office of Commonalities • Evidence Correlation Desk" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, connect the exhibits before the Bureau makes the relationship painfully clear.</>} icon={<Files size={27}/>} accent="#477b5a" instrumentLabel="CORRELATION ENGINE" decorativeArt={COMMON_DOSSIER_ART} dataRoundType="COMMON_DOSSIER">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
        <section aria-label="Evidence correlation apparatus" className="relative overflow-hidden rounded-[22px] border-[4px] border-[#65442c] bg-[#173f3d] p-3 shadow-[inset_0_0_0_4px_#477b69,0_7px_0_#65442c] sm:p-4">
          <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={COMMON_DOSSIER_ART.compact}/><img src={COMMON_DOSSIER_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover"/></picture>
          <div className="relative z-10 mb-3 flex justify-between rounded-lg border-2 border-[#65442c] bg-[#e1b95e]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#563d2b] shadow-[0_2px_0_#65442c] sm:text-xs"><span>Evidence admitted {exhibitsVisible}/4</span><span>{potentialScore} points available</span></div>
          <div className="relative z-10 grid min-h-[310px] grid-cols-2 gap-3" aria-live="polite">
            {challenge.exhibits.map((exhibit, index) => index < exhibitsVisible
              ? <article key={exhibit} className="bureau-paper-drop flex min-h-28 items-center justify-center rounded-2xl border-[3px] border-[#78583c] bg-[#fff1c9]/95 p-4 text-center font-['Fraunces'] text-base font-black text-[#30434a] shadow-[inset_0_0_18px_rgba(108,78,42,.18),0_4px_0_#65442c] sm:text-lg"><span><small className="mb-2 block font-['Courier_Prime'] text-xs uppercase tracking-[.18em] text-[#9a4d4c]">Exhibit {String.fromCharCode(65 + index)}</small>{exhibit}</span></article>
              : <article key={exhibit} aria-label={`Sealed exhibit ${String.fromCharCode(65 + index)}`} className="relative min-h-28 overflow-hidden rounded-2xl border-[3px] border-[#65442c] bg-[#1d3434]/95 shadow-[inset_0_0_0_4px_#315452,0_4px_0_#65442c]"><span aria-hidden="true" className="absolute inset-4 grid place-items-center rounded-xl border-2 border-dashed border-[#9c8053] font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#d8b65d]">Evidence sealed</span></article>)}
          </div>
        </section>
        <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
          <strong className="block border-b-2 border-dashed border-[#a7895e] pb-3 font-['Cinzel'] text-sm text-[#604635]">Correlation Control</strong>
          {!answering ? <div className="mt-4 space-y-3">
            <button type="button" onClick={() => { sound.playStamp(); setAnswering(true); }} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#477b5a] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]"><Stamp size={18}/>File connection — {potentialScore}</button>
            {exhibitsVisible < 4 ? <button type="button" onClick={discloseExhibit} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#dfad43] px-3 py-3 font-['Cinzel'] text-[10px] font-black uppercase text-[#503a29] shadow-[0_4px_0_#65442c]"><Eye size={18}/>Admit exhibit {String.fromCharCode(66 + exhibitsVisible - 1)} — {potentialCommonDossierScore(exhibitsVisible + 1)}</button> : null}
            <p className="font-['Courier_Prime'] text-xs leading-relaxed text-[#77634d]">Every additional exhibit reduces the certified award.</p>
          </div> : <div className="mt-4 space-y-2">
            <span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#74573f]">Select the common connection</span>
            {challenge.options.map(option => <button key={option} type="button" aria-pressed={selectedAnswer === option} disabled={visualState !== 'ACTIVE'} onClick={() => { sound.playClick(); setSelectedAnswer(option); }} className={`w-full rounded-lg border-2 px-3 py-3 text-left font-['Cinzel'] text-xs font-bold shadow-[0_2px_0_#65442c] ${selectedAnswer === option ? 'border-[#356247] bg-[#b9d7bd]' : 'border-[#887052] bg-[#f5e8c5]'}`}>{option}</button>)}
            <button type="button" disabled={!selectedAnswer || visualState !== 'ACTIVE'} onClick={submit} className="bureau-button mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#477b5a] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">{visualState === 'PROCESSING' ? <><LoaderCircle className="bureau-route-spinner" size={18}/>Correlating files</> : <><Stamp size={18}/>Seal connection</>}</button>
          </div>}
        </aside>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="COMMON_DOSSIER" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={result.answer} correctAnswer={challenge.connection} history={currentPlayer.stats} isCorrect={result.correct} onProceed={() => onComplete(result.score)}/> : null}
  </div>;
};
