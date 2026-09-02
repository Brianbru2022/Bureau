import { useEffect, useMemo, useState } from 'react';
import { Eye, LoaderCircle, Mic2, ShieldQuestion, Stamp } from 'lucide-react';
import type { Player, PublicEnquiryChallenge, RoundVisualState } from '../../types';
import { PUBLIC_ENQUIRY_ART } from '../../data/promotedVisualAssets';
import { scorePublicEnquiryJuror, scorePublicEnquiryWitness } from '../../game/publicEnquiry';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { PrivacyCurtain } from '../common/PrivacyCurtain';

interface Props { challenge: PublicEnquiryChallenge; players: Player[]; currentPlayerIndex: number; privacyCurtainEnabled?: boolean; onComplete: (scores: Record<string, number>) => void }
type Phase = 'PRIVATE' | 'HANDOFF' | 'VOTE';
interface Resolution { scores: Record<string, number>; meanBelief: number }

export const PublicEnquiryRound = ({ challenge, players, currentPlayerIndex, privacyCurtainEnabled = true, onComplete }: Props) => {
  const witness = players.length > 1 ? players[currentPlayerIndex % players.length] : null;
  const jurors = useMemo(() => witness ? players.filter(player => player.id !== witness.id) : players, [players, witness]);
  const [phase, setPhase] = useState<Phase>(witness ? 'PRIVATE' : 'VOTE');
  const [briefRevealed, setBriefRevealed] = useState(false);
  const [jurorIndex, setJurorIndex] = useState(0);
  const [confidence, setConfidence] = useState(50);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pending, setPending] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);
  const [handoverConfirmed, setHandoverConfirmed] = useState(!privacyCurtainEnabled || !witness);
  const currentJuror = jurors[jurorIndex];

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decision = window.setTimeout(() => {
      setVisualState('ACCEPTED');
      sound.playDepartmentCue('PUBLIC_ENQUIRY', 'ACCEPTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reduced));
    const dossier = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('PUBLIC_ENQUIRY', 'RESULT');
      setResult(pending);
      setPending(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reduced));
    return () => { window.clearTimeout(decision); window.clearTimeout(dossier); };
  }, [pending]);

  const sealBallot = () => {
    if (!currentJuror || visualState !== 'ACTIVE') return;
    const nextVotes = { ...votes, [currentJuror.id]: confidence };
    setVotes(nextVotes);
    sound.playDepartmentCue('PUBLIC_ENQUIRY', jurorIndex + 1 < jurors.length ? 'MOVE' : 'PROCESSING');
    if (jurorIndex + 1 < jurors.length) {
      setJurorIndex(index => index + 1);
      setConfidence(50);
      setPhase(privacyCurtainEnabled ? 'HANDOFF' : 'VOTE');
      return;
    }
    const confidences = jurors.map(juror => nextVotes[juror.id]);
    const scores = Object.fromEntries(jurors.map(juror => [juror.id, scorePublicEnquiryJuror(nextVotes[juror.id], challenge.isTrue)]));
    if (witness) scores[witness.id] = scorePublicEnquiryWitness(confidences);
    setVisualState('PROCESSING');
    setPending({ scores, meanBelief: confidences.reduce((sum, value) => sum + value, 0) / confidences.length });
  };

  const leadPlayer = witness ?? jurors[0];
  const leadScore = result ? result.scores[leadPlayer.id] : 0;

  if (privacyCurtainEnabled && witness && phase === 'PRIVATE' && !handoverConfirmed) return <PrivacyCurtain recipient={witness} purpose="The witness has a confidential factual brief to inspect before the jury votes." confirmationLabel={`I am ${witness.name} — receive witness brief`} onConfirm={() => setHandoverConfirmed(true)}/>;
  if (privacyCurtainEnabled && phase === 'HANDOFF' && currentJuror) return <PrivacyCurtain recipient={currentJuror} purpose="A private confidence ballot is ready. Earlier ballots remain sealed." confirmationLabel={`I am ${currentJuror.name} — cast private ballot`} onConfirm={() => { setHandoverConfirmed(true); setPhase('VOTE'); }}/>;

  return <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
    <ApparatusFrame compact state={visualState} eyebrow="Office of Public Confidence • Enquiry Chamber" title={challenge.prompt} subtitle={witness ? <><strong>{witness.name}</strong> is the departmental witness. Every other candidate forms the enquiry jury.</> : <>Record a calibrated probability. The Bureau accepts percentages but not certainty without paperwork.</>} icon={<Mic2 size={27}/>} accent="#a14f61" instrumentLabel="ENQUIRY LECTERN" decorativeArt={PUBLIC_ENQUIRY_ART} dataRoundType="PUBLIC_ENQUIRY">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.36fr)_minmax(300px,.64fr)]">
        <section aria-label="Public enquiry statement" className="relative overflow-hidden rounded-[22px] border-[4px] border-[#65442c] bg-[#173f3d] p-3 shadow-[inset_0_0_0_4px_#477b69,0_7px_0_#65442c] sm:p-4">
          <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={PUBLIC_ENQUIRY_ART.compact}/><img src={PUBLIC_ENQUIRY_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover"/></picture>
          <div className="relative z-10 mb-3 flex justify-between rounded-lg border-2 border-[#65442c] bg-[#e1b95e]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#563d2b] shadow-[0_2px_0_#65442c] sm:text-xs"><span>Claim entered into evidence</span><span>{Object.keys(votes).length}/{jurors.length} ballots sealed</span></div>
          <div className="relative z-10 grid min-h-[270px] place-items-center rounded-2xl border-[3px] border-[#76583f] bg-[#fff1c9]/95 p-5 text-center shadow-inner"><div><span className="mb-3 block font-['Courier_Prime'] text-xs font-black uppercase tracking-[.2em] text-[#8d5748]">Official claim</span><blockquote className="font-['Fraunces'] text-xl font-black leading-snug text-[#30434a] sm:text-2xl">“{challenge.claim}”</blockquote><Mic2 className="mx-auto mt-5 text-[#a14f61]" size={32}/></div></div>
          <div className="relative z-10 mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{players.map(player => <div key={player.id} className="rounded-lg border-2 border-[#65442c] bg-[#f3dfad]/95 px-2 py-2 text-center font-['Courier_Prime'] text-xs font-black uppercase text-[#594634]"><span className="block truncate">{player.name}</span><span className={witness?.id === player.id ? 'text-[#a14f61]' : votes[player.id] !== undefined ? 'text-[#477b5a]' : 'text-[#8c7658]'}>{witness?.id === player.id ? 'Witness' : votes[player.id] !== undefined ? 'Ballot sealed' : 'Juror waiting'}</span></div>)}</div>
        </section>
        <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
          <strong className="block border-b-2 border-dashed border-[#a7895e] pb-3 font-['Cinzel'] text-sm text-[#604635]">Enquiry Control</strong>
          {phase === 'PRIVATE' ? <div className="mt-4 space-y-3">
            {!briefRevealed ? <><div className="rounded-xl border-2 border-[#8b704f] bg-[#2e4a4d] p-4 text-center text-[#fff2ce]"><ShieldQuestion className="mx-auto mb-2"/><strong className="font-['Cinzel'] text-xs">Private witness brief</strong><p className="mt-2 font-['Courier_Prime'] text-xs">Recipient confirmed. Reveal the brief only when the screen is private.</p></div><button type="button" onClick={() => { sound.playPneumatic(); setBriefRevealed(true); }} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#a14f61] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]"><Eye size={18}/>Reveal private brief</button></> : <><div className="rounded-xl border-[3px] border-[#7e3e4e] bg-[#f1cfca] p-3 font-['Courier_Prime'] text-xs font-bold leading-relaxed text-[#583b39]">{challenge.witnessBrief}</div><button type="button" onClick={() => { sound.playStamp(); setHandoverConfirmed(false); setPhase(privacyCurtainEnabled ? 'HANDOFF' : 'VOTE'); }} className="bureau-button w-full rounded-xl border-[3px] border-[#65442c] bg-[#477b5a] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]">Seal brief and prepare handover</button></>}
          </div> : phase === 'HANDOFF' ? null : <div className="mt-4 space-y-3">
            <label className="block rounded-xl border-2 border-[#8b704f] bg-[#f2dfae] p-3 text-center"><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Probability the claim is true</span><strong className="font-['Space_Mono'] text-3xl text-[#30434a]">{confidence}%</strong><input aria-label="Probability the claim is true" type="range" min="0" max="100" step="1" value={confidence} onChange={event => setConfidence(Number(event.target.value))} className="mt-3 w-full accent-[#a14f61]"/></label>
            <p className="font-['Courier_Prime'] text-xs leading-relaxed text-[#77634d]">Juror score uses the exact probability and the eventual truth. Fifty per cent earns nothing because it makes no finding.</p>
            <button type="button" onClick={sealBallot} disabled={visualState !== 'ACTIVE'} className="bureau-button flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#a14f61] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase text-white shadow-[0_5px_0_#65442c]">{visualState === 'PROCESSING' ? <><LoaderCircle className="bureau-route-spinner" size={18}/>Calculating confidence</> : <><Stamp size={18}/>Seal {currentJuror?.name} ballot</>}</button>
          </div>}
        </aside>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={leadScore} playerName={leadPlayer.name} roundType="PUBLIC_ENQUIRY" questionPrompt={challenge.prompt} explanation={`${challenge.explanation} The jury’s mean belief was ${result.meanBelief.toFixed(1)}%. Scores: ${players.map(player => `${player.name} ${result.scores[player.id] ?? 0}`).join(', ')}.`} source={challenge.source} playerAnswer={`${result.meanBelief.toFixed(1)}% jury belief`} correctAnswer={challenge.isTrue ? 'Claim true' : 'Claim false'} history={leadPlayer.stats} isCorrect={witness ? result.meanBelief >= 50 : challenge.isTrue ? result.meanBelief >= 50 : result.meanBelief < 50} onProceed={() => onComplete(result.scores)}/> : null}
  </div>;
};
