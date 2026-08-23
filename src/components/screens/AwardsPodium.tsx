import React, { useEffect, useState } from 'react';
import { Player, HiddenCommendation } from '../../types';
import { sound } from '../../sound/audioEngine';
import { evaluateCommendations, type ScoreSnapshot } from '../../data/commendations';
import { applyDirectiveEvaluation } from '../../game/directives';
import { BureauInsignia } from '../common/BureauInsignia';
import confetti from 'canvas-confetti';
import { Award, Crown, RotateCcw, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface AwardsPodiumProps {
  players: Player[];
  hiddenCommendations: HiddenCommendation[];
  scoreHistory: ScoreSnapshot[];
  onPlayAgain: () => void;
}

export const AwardsPodium: React.FC<AwardsPodiumProps> = ({
  players,
  hiddenCommendations,
  scoreHistory,
  onPlayAgain
}) => {
  const [step, setStep] = useState<'DIRECTIVES_REVEAL' | 'COMMENDATIONS_REVEAL' | 'FINAL_PODIUM'>('DIRECTIVES_REVEAL');
  const [evaluatedPlayers, setEvaluatedPlayers] = useState<Player[]>(players);
  const [awardedCommendations, setAwardedCommendations] = useState<Array<{ commendation: HiddenCommendation; winner: Player }>>([]);

  useEffect(() => {
    const directiveChecked = players.map(applyDirectiveEvaluation);
    const afterDirectives = directiveChecked.map(player => ({
      ...player,
      score: player.score + (player.secretDirective.isCompleted ? player.secretDirective.bonusPoints : 0)
    }));

    const finalHistory = [
      ...scoreHistory,
      { roundNumber: 999, scores: Object.fromEntries(afterDirectives.map(player => [player.id, player.score])) }
    ];
    const { commendationsWithWinners, playerBonusMap } = evaluateCommendations(
      afterDirectives,
      hiddenCommendations,
      finalHistory
    );
    setAwardedCommendations(commendationsWithWinners);

    const finalized = afterDirectives
      .map(player => ({
        ...player,
        score: player.score + (playerBonusMap[player.id] || 0)
      }))
      .sort((a, b) => b.score - a.score);

    setEvaluatedPlayers(finalized);
  }, [players, hiddenCommendations, scoreHistory]);

  const handleRevealCommendations = () => {
    sound.playBrassChime();
    setStep('COMMENDATIONS_REVEAL');
  };

  const handleRevealPodium = () => {
    sound.playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffd700', '#4fd1c5', '#f6ad55', '#feb2b2']
    });
    setStep('FINAL_PODIUM');
  };

  const winner = evaluatedPlayers[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto py-6 px-4 font-['Plus_Jakarta_Sans']">
      <div className="text-center mb-6">
        <BureauInsignia size={64} />
        <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] uppercase tracking-widest block mt-2 mb-0.5">
          Concluding Bureau Judgment
        </span>
        <h1 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-white tracking-wide">
          The Grand Bureau Ceremony
        </h1>
      </div>

      {step === 'DIRECTIVES_REVEAL' && (
        <div className="w-full bg-[#121c2d] border-2 border-[#d4af37] rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">Secret Directive Audit</span>
            <h2 className="font-['Cinzel'] font-bold text-xl text-white mt-1">The Files Are Opened</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {evaluatedPlayers.map(player => {
              const completed = player.secretDirective.isCompleted;
              return (
                <div key={player.id} className={`p-4 rounded-lg bg-[#0e1624] border ${completed ? 'border-emerald-500/70' : 'border-rose-500/60'} flex flex-col gap-2`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="font-['Cinzel'] font-bold text-sm text-white">{player.name}</span>
                    </div>
                    <span className={`flex items-center gap-1 font-['Courier_Prime'] text-xs font-bold ${completed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {completed ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                      {completed ? `+${player.secretDirective.bonusPoints}` : '+0'}
                    </span>
                  </div>
                  <div className="p-2 bg-[#172336] rounded text-xs font-['Courier_Prime'] text-slate-300">
                    <strong className="text-[#ffd700] block">{player.secretDirective.title}</strong>
                    {player.secretDirective.description}
                  </div>
                  <div className={`p-2 rounded text-[11px] font-['Courier_Prime'] ${completed ? 'bg-emerald-950/35 text-emerald-200' : 'bg-rose-950/35 text-rose-200'}`}>
                    <strong>{completed ? 'PASSED: ' : 'FAILED: '}</strong>{player.secretDirective.progressText}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleRevealCommendations} className="px-8 py-3.5 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#0a101d] font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
            <Sparkles size={16} /> Reveal the Two Hidden Commendations
          </button>
        </div>
      )}

      {step === 'COMMENDATIONS_REVEAL' && (
        <div className="w-full bg-[#121c2d] border-2 border-[#d4af37] rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">Selected Before Play Began</span>
            <h2 className="font-['Cinzel'] font-bold text-xl text-white mt-1">Hidden Commendations</h2>
            <p className="font-['Fraunces'] text-xs text-slate-300 italic mt-1">No convenient rewriting of history. These were the two awards chosen at the start.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {hiddenCommendations.map(selected => {
              const awarded = awardedCommendations.find(item => item.commendation.id === selected.id);
              return (
                <div key={selected.id} className="p-4 rounded-lg bg-[#0e1624] border border-[#d4af37]/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel'] font-black text-sm text-[#ffd700] flex items-center gap-1.5"><Award size={16} />{selected.title}</span>
                    <span className="font-['Space_Mono'] text-xs font-bold text-emerald-400">{awarded ? `+${selected.bonusPoints}` : '+0'} PTS</span>
                  </div>
                  <p className="text-xs font-['Fraunces'] text-slate-300 italic">{selected.description}</p>
                  {awarded ? (
                    <div className="pt-2 border-t border-slate-800 text-xs font-['Courier_Prime'] text-slate-300">
                      <strong className="text-white">{awarded.winner.name}</strong><br />{awarded.commendation.evaluationNote}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 text-xs font-['Courier_Prime'] text-slate-500">Nobody qualified. The Bureau declines to lower its standards further.</div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={handleRevealPodium} className="px-8 py-3.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 border border-emerald-400">
            <Crown size={16} /> Final Standings
          </button>
        </div>
      )}

      {step === 'FINAL_PODIUM' && (
        <div className="w-full flex flex-col items-center gap-6">
          {winner && (
            <div className="w-full max-w-xl bg-gradient-to-b from-[#2a1e09] via-[#3d2c0e] to-[#1e1506] border-4 border-[#ffd700] rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(255,215,0,0.4)]">
              <Crown className="text-[#ffd700] mx-auto mb-2" size={42} />
              <span className="font-['Courier_Prime'] text-xs text-[#ffd700] uppercase font-bold tracking-widest block">Chief Bureau Adjudicator</span>
              <h2 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-white my-1">{winner.name}</h2>
              <div className="font-['Space_Mono'] font-extrabold text-3xl text-[#ffd700] my-2">{winner.score.toLocaleString()} <span className="text-xs text-amber-200">BUREAU PTS</span></div>
            </div>
          )}

          <div className="w-full max-w-2xl bg-[#0f1726] border-2 border-[#d4af37]/60 rounded-xl p-5 shadow-xl flex flex-col gap-2.5">
            {evaluatedPlayers.map((player, idx) => (
              <div key={player.id} className={`p-3.5 rounded-lg border flex items-center justify-between ${idx === 0 ? 'bg-[#1e2d44] border-[#ffd700]' : 'bg-[#121b2b] border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <span className="font-['Space_Mono'] font-bold text-sm">#{idx + 1}</span>
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-['Cinzel'] font-bold text-sm text-white">{player.name}</span>
                </div>
                <span className="font-['Space_Mono'] font-bold text-xl text-[#ffd700]">{player.score.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { sound.playStamp(); onPlayAgain(); }} className="px-10 py-4 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#0a101d] font-['Cinzel'] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3">
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      )}
    </div>
  );
};
