import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Trophy, FileText, RotateCcw, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import type { AdjudicationRecord, HiddenCommendation, Player } from '../../types';
import type { ScoreSnapshot } from '../../data/commendations';
import { evaluateCommendations } from '../../data/commendations';
import { applyDirectiveEvaluation } from '../../game/directives';
import { sound } from '../../sound/audioEngine';
import { COMMENDATION_ART, EVENT_ART } from '../../data/visualAssets';
import { GeneratedArtBackdrop } from '../common/GeneratedArtBackdrop';
import { BureauAvatar } from '../common/BureauAvatar';
import { PostAssessmentDossier } from './PostAssessmentDossier';
import { PlaytestDebrief } from './PlaytestDebrief';

interface AwardsPodiumProps {
  players: Player[];
  hiddenCommendations: HiddenCommendation[];
  scoreHistory: ScoreSnapshot[];
  adjudicationHistory: AdjudicationRecord[];
  onPlayAgain: () => void;
  onPlayAgainSame: () => void;
  simplified?: boolean;
}

export const AwardsPodium: React.FC<AwardsPodiumProps> = ({ players, hiddenCommendations, scoreHistory, adjudicationHistory, onPlayAgain, onPlayAgainSame, simplified = false }) => {
  const [step, setStep] = useState<'DIRECTIVES_REVEAL' | 'COMMENDATIONS_REVEAL' | 'FINAL_PODIUM'>(simplified ? 'FINAL_PODIUM' : 'DIRECTIVES_REVEAL');
  const ceremony = useMemo(() => {
    if (simplified) return { evaluatedPlayers: [...players].sort((first, second) => second.score - first.score), commendationsWithWinners: [] };
    const directiveChecked = players.map(applyDirectiveEvaluation);
    const afterDirectives = directiveChecked.map(player => ({ ...player, score: player.score + (player.secretDirective.isCompleted ? player.secretDirective.bonusPoints : 0) }));
    const historyWithDirectives = [...scoreHistory, { roundNumber: 999, scores: Object.fromEntries(afterDirectives.map(player => [player.id, player.score])) }];
    const { commendationsWithWinners, playerBonusMap } = evaluateCommendations(afterDirectives, hiddenCommendations, historyWithDirectives);
    const evaluatedPlayers = afterDirectives.map(player => ({ ...player, score: player.score + (playerBonusMap[player.id] ?? 0) })).sort((first, second) => second.score - first.score);
    return { evaluatedPlayers, commendationsWithWinners };
  }, [hiddenCommendations, players, scoreHistory, simplified]);
  const revealCommendations = () => { sound.playBrassChime(); setStep('COMMENDATIONS_REVEAL'); };
  const revealPodium = () => { sound.playVictoryFanfare(); confetti({ particleCount: 120, spread: 70, origin: { y: .6 }, colors: ['#d4af37', '#ffd700', '#4fd1c5', '#f6ad55', '#feb2b2'] }); setStep('FINAL_PODIUM'); };
  const winner = ceremony.evaluatedPlayers[0];
  const solo = ceremony.evaluatedPlayers.length === 1;

  return <div className="bureau-ceremony relative min-h-[78vh] flex-1 overflow-hidden rounded-[28px] border-[4px] border-[#765139]">
    <GeneratedArtBackdrop src={EVENT_ART.PODIUM} dim={0.48} animate/>
    <img src="/assets/generated-v2/podium-machine.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] w-full object-cover opacity-[0.34] mix-blend-multiply"/>
    <div className="bureau-ceremony-content relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-8 font-['Plus_Jakarta_Sans']">
      <div className="bureau-ceremony-header bureau-paper mb-6 rounded-[24px] border-[3px] border-[#765139] px-8 py-4 text-center"><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#a9443d]">Concluding Bureau Judgment</span><h1 className="font-['Cinzel'] text-3xl font-black text-[#244b55] sm:text-4xl">{solo?'Annual Bureau Appraisal':'The Grand Bureau Ceremony'}</h1></div>
      {step === 'DIRECTIVES_REVEAL' ? <div className="bureau-paper flex w-full flex-col gap-5 rounded-[26px] border-[4px] border-[#765139] p-6 shadow-2xl"><div className="text-center"><span className="font-['Courier_Prime'] text-xs font-black uppercase text-[#a9443d]">Secret Directive Audit</span><h2 className="font-['Cinzel'] text-xl font-black text-[#244b55]">The Files Are Opened</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{ceremony.evaluatedPlayers.map(player => { const completed = player.secretDirective.isCompleted; return <div key={player.id} className={`rounded-2xl border-[3px] p-4 ${completed ? 'border-[#4f7457] bg-[#eef1d9]' : 'border-[#a9443d] bg-[#f5ddd2]'}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><BureauAvatar player={player} size={46}/><span className="font-['Cinzel'] font-black text-[#244b55]">{player.name}</span></div><span className={`bureau-stamp-in flex items-center gap-1 font-['Courier_Prime'] text-xs font-black ${completed ? 'text-[#3e6e4d]' : 'text-[#a9443d]'}`}>{completed ? <CheckCircle2 size={15}/> : <XCircle size={15}/>} {completed ? `+${player.secretDirective.bonusPoints}` : '+0'}</span></div><div className="mt-3 rounded-xl bg-[#fff7df] p-3 text-xs text-[#5e4d3f]"><strong className="block font-['Cinzel'] text-[#244b55]">{player.secretDirective.title}</strong>{player.secretDirective.description}</div><div className="mt-2 font-['Courier_Prime'] text-[11px] text-[#624f42]"><strong>{completed ? 'PASSED: ' : 'FAILED: '}</strong>{player.secretDirective.progressText}</div></div>; })}</div><button type="button" onClick={revealCommendations} className="bureau-button mx-auto flex items-center gap-2 rounded-xl bg-[#e0a83f] px-8 py-3.5 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-[#463421]"><Sparkles size={16}/>Reveal Hidden Commendations</button></div> : null}
      {step === 'COMMENDATIONS_REVEAL' ? <div className="bureau-paper flex w-full flex-col gap-5 rounded-[26px] border-[4px] border-[#765139] p-6 shadow-2xl"><div className="text-center"><span className="font-['Courier_Prime'] text-xs font-black uppercase text-[#a9443d]">Selected Before Play Began</span><h2 className="font-['Cinzel'] text-xl font-black text-[#244b55]">Hidden Commendations</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{hiddenCommendations.map(selected => { const awarded = ceremony.commendationsWithWinners.find(item => item.commendation.id === selected.id); return <div key={selected.id} className="overflow-hidden rounded-2xl border-[3px] border-[#765139] bg-[#fff7df] shadow-[0_4px_0_#765139]"><img src={COMMENDATION_ART[selected.id]} alt="" aria-hidden="true" className="h-44 w-full object-cover"/><div className="p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-1 font-['Cinzel'] text-sm font-black text-[#244b55]"><Award size={16}/>{selected.title}</span><span className="font-['Space_Mono'] text-xs font-bold text-[#3e6e4d]">{awarded ? `+${selected.bonusPoints}` : '+0'}</span></div><p className="mt-1 text-xs italic text-[#665348]">{selected.description}</p><div className="mt-2 border-t border-[#d4bd93] pt-2 font-['Courier_Prime'] text-xs text-[#5b4a3d]">{awarded ? <><strong>{awarded.winner.name}</strong><br/>{awarded.commendation.evaluationNote}</> : <>Nobody qualified. Standards remain inconveniently intact.</>}</div></div></div>; })}</div><button type="button" onClick={revealPodium} className="bureau-button mx-auto flex items-center gap-2 rounded-xl bg-[#4f7457] px-8 py-3.5 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white"><Trophy size={16}/>Final Standings</button></div> : null}
      {step === 'FINAL_PODIUM' ? <div className="bureau-podium-final flex w-full flex-col items-center gap-6">{winner ? <div className="bureau-podium-winner bureau-paper bureau-float w-full max-w-xl rounded-[28px] border-[4px] border-[#b7882f] p-6 text-center shadow-2xl">{solo?<FileText className="mx-auto mb-2 text-[#b7882f]" size={42}/>:<Trophy className="mx-auto mb-2 text-[#b7882f]" size={42}/>}<span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#a9443d]">{solo?'Personal Bureau Record':'Chief Bureau Adjudicator'}</span><BureauAvatar player={winner} size={92} className="bureau-podium-avatar mx-auto my-3 border-[4px] border-[#b7882f]"/><h2 className="font-['Cinzel'] text-3xl font-black text-[#244b55] sm:text-4xl">{winner.name}</h2><div className="font-['Space_Mono'] text-3xl font-extrabold text-[#376d9b]">{winner.score.toLocaleString()} <span className="text-xs">BUREAU PTS</span></div></div> : null}<div className="bureau-podium-dossiers bureau-paper w-full max-w-5xl rounded-2xl border-[3px] border-[#765139] p-5"><div className="mb-3 flex items-center gap-2 font-['Cinzel'] font-black text-[#244b55]"><FileText size={18}/>Post-assessment dossiers</div><div className="bureau-podium-dossier-grid grid gap-3 sm:grid-cols-2">{ceremony.evaluatedPlayers.map((player, index) => <React.Fragment key={player.id}><PostAssessmentDossier player={player} rank={index + 1} isWinner={index === 0} solo={solo} scoreHistory={scoreHistory} adjudicationHistory={adjudicationHistory}/></React.Fragment>)}</div></div><PlaytestDebrief/><div className="bureau-podium-actions flex flex-wrap justify-center gap-3"><button type="button" onClick={() => { sound.playStamp(); onPlayAgainSame(); }} className="bureau-button flex items-center gap-2 rounded-xl bg-[#376d9b] px-7 py-4 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white"><RotateCcw size={17}/>{solo?'Repeat Solo Assessment':'Same Candidates, New Random Assessment'}</button><button type="button" onClick={() => { sound.playStamp(); onPlayAgain(); }} className="bureau-button flex items-center gap-2 rounded-xl bg-[#d9644f] px-7 py-4 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white"><RotateCcw size={17}/>{solo?'Return to Candidate Registration':'New Candidates and Assessment'}</button></div></div> : null}
    </div>
  </div>;
};
