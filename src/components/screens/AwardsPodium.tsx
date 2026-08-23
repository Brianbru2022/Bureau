import React, { useEffect, useState } from 'react';
import { Player, HiddenCommendation } from '../../types';
import { sound } from '../../sound/audioEngine';
import { evaluateCommendations } from '../../data/commendations';
import { BureauInsignia } from '../common/BureauInsignia';
import confetti from 'canvas-confetti';
import { Trophy, Award, Crown, RotateCcw, ShieldCheck, Flame, Star, Sparkles } from 'lucide-react';

interface AwardsPodiumProps {
  players: Player[];
  onPlayAgain: () => void;
}

export const AwardsPodium: React.FC<AwardsPodiumProps> = ({
  players,
  onPlayAgain
}) => {
  // Step: 'DIRECTIVES_REVEAL' | 'COMMENDATIONS_REVEAL' | 'FINAL_PODIUM'
  const [step, setStep] = useState<'DIRECTIVES_REVEAL' | 'COMMENDATIONS_REVEAL' | 'FINAL_PODIUM'>('DIRECTIVES_REVEAL');
  const [evaluatedPlayers, setEvaluatedPlayers] = useState<Player[]>(players);
  const [awardedCommendations, setAwardedCommendations] = useState<Array<{ commendation: HiddenCommendation; winner: Player }>>([]);

  useEffect(() => {
    // 1. Evaluate Directives bonuses
    const updated = players.map(p => {
      let bonus = 0;
      // Simple fulfillment heuristics
      if (p.stats.roundsPlayed > 0) {
        bonus = p.secretDirective.bonusPoints; // Awarded for completing classified duties
      }
      return {
        ...p,
        score: p.score + bonus
      };
    });

    // 2. Evaluate Commendations
    const { commendationsWithWinners, playerBonusMap } = evaluateCommendations(updated);
    setAwardedCommendations(commendationsWithWinners);

    const finalized = updated.map(p => ({
      ...p,
      score: p.score + (playerBonusMap[p.id] || 0)
    })).sort((a, b) => b.score - a.score);

    setEvaluatedPlayers(finalized);
  }, [players]);

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
      {/* Title */}
      <div className="text-center mb-6">
        <BureauInsignia size={64} />
        <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] uppercase tracking-widest block mt-2 mb-0.5">
          Her Majesty's Concluding Judgment
        </span>
        <h1 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-white tracking-wide">
          The Grand Bureau Ceremony
        </h1>
      </div>

      {step === 'DIRECTIVES_REVEAL' && (
        <div className="w-full bg-[#121c2d] border-2 border-[#d4af37] rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">
              Classification De-escalation
            </span>
            <h2 className="font-['Cinzel'] font-bold text-xl text-white mt-1">
              Secret Directives Audit
            </h2>
            <p className="font-['Fraunces'] text-xs text-slate-300 italic mt-1">
              The Bureau now audits each candidate's classified secondary objective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {evaluatedPlayers.map(p => (
              <div key={p.id} className="p-4 rounded-lg bg-[#0e1624] border border-[#d4af37]/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.avatar || '🕵️'}</span>
                    <span className="font-['Cinzel'] font-bold text-sm text-white">{p.name}</span>
                  </div>
                  <span className="font-['Space_Mono'] text-xs font-bold text-emerald-400">
                    +{p.secretDirective?.bonusPoints || 150} PTS
                  </span>
                </div>
                <div className="p-2 bg-[#172336] rounded text-xs font-['Courier_Prime'] text-slate-300">
                  <strong className="text-[#ffd700] block">{p.secretDirective?.title || 'Classified Directive'}:</strong>
                  "{p.secretDirective?.description || 'Maintain bureaucratic composure under pressure.'}"
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRevealCommendations}
            className="px-8 py-3.5 mt-2 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>Unseal Bureau Commendations</span>
          </button>
        </div>
      )}

      {step === 'COMMENDATIONS_REVEAL' && (
        <div className="w-full bg-[#121c2d] border-2 border-[#d4af37] rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5 animate-in fade-in zoom-in-95">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">
              Extraordinary Bureaucratic Distinctions
            </span>
            <h2 className="font-['Cinzel'] font-bold text-xl text-white mt-1">
              Hidden Commendation Awards
            </h2>
            <p className="font-['Fraunces'] text-xs text-slate-300 italic mt-1">
              Special merits awarded for statistical anomalies, cartographic genius, and sheer audacity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {awardedCommendations.map(({ commendation, winner: w }) => (
              <div key={commendation.id} className="p-4 rounded-lg bg-[#0e1624] border border-[#d4af37]/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Cinzel'] font-black text-sm text-[#ffd700] flex items-center gap-1.5">
                    <Award size={16} />
                    <span>{commendation.title}</span>
                  </span>
                  <span className="font-['Space_Mono'] text-xs font-bold text-emerald-400">
                    +{commendation.bonusPoints || 200} PTS
                  </span>
                </div>
                <p className="text-xs font-['Fraunces'] text-slate-300 italic">
                  "{commendation.description}"
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-xs font-['Courier_Prime'] text-slate-400">
                  <span>Conferred upon:</span>
                  <strong className="text-white flex items-center gap-1">
                    <span>{w?.avatar || '🕵️'}</span>
                    <span>{w?.name || 'Candidate'}</span>
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRevealPodium}
            className="px-8 py-3.5 mt-2 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 border border-emerald-400"
          >
            <Crown size={16} />
            <span>Ascend to the Final Podium</span>
          </button>
        </div>
      )}

      {step === 'FINAL_PODIUM' && (
        <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in-95">
          {/* Winner Banner */}
          {winner && (
            <div className="w-full max-w-xl bg-gradient-to-b from-[#2a1e09] via-[#3d2c0e] to-[#1e1506] border-4 border-[#ffd700] rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(255,215,0,0.4)] relative overflow-hidden">
              <div className="absolute top-2 right-3 text-4xl opacity-20">👑</div>
              <Crown className="text-[#ffd700] mx-auto mb-2 animate-bounce" size={42} />
              <span className="font-['Courier_Prime'] text-xs text-[#ffd700] uppercase font-bold tracking-widest block">
                Her Majesty's Chief Civil Adjudicator
              </span>
              <h2 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-white my-1">
                {winner.name}
              </h2>
              <div className="font-['Space_Mono'] font-extrabold text-3xl text-[#ffd700] my-2">
                {winner.score.toLocaleString()} <span className="text-xs text-amber-200">BUREAU PTS</span>
              </div>
              <p className="font-['Fraunces'] text-xs text-[#f5deb3] italic max-w-md mx-auto">
                "Officially certified by the Bureau. While your peers faltered under bureaucratic scrutiny, you prevailed with marginal distinction."
              </p>
            </div>
          )}

          {/* Full Standings Table */}
          <div className="w-full max-w-2xl bg-[#0f1726] border-2 border-[#d4af37]/60 rounded-xl p-5 shadow-xl flex flex-col gap-3">
            <span className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wider border-b border-slate-700 pb-2 block">
              Certified Final Merit Order
            </span>

            <div className="flex flex-col gap-2.5">
              {evaluatedPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'bg-[#1e2d44] border-[#ffd700] shadow-md'
                      : 'bg-[#121b2b] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-['Space_Mono'] font-bold text-sm ${
                      idx === 0 ? 'bg-[#ffd700] text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <h4 className="font-['Cinzel'] font-bold text-sm text-white">{p.name}</h4>
                      <span className="font-['Courier_Prime'] text-[10px] text-slate-400 block">
                        {p.department}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-['Space_Mono'] font-bold text-xl text-[#ffd700]">
                      {p.score.toLocaleString()}
                    </span>
                    <span className="block font-['Courier_Prime'] text-[9px] text-slate-400 uppercase">
                      Total Pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Play Again Button */}
          <button
            onClick={() => {
              sound.playStamp();
              onPlayAgain();
            }}
            className="px-10 py-4 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 border-2 border-amber-300 transform active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>Convene Another Bureau Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
};
