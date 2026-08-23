import React, { useState } from 'react';
import { ClosestWinsChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Calculator, EyeOff, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface ClosestWinsProps {
  challenge: ClosestWinsChallenge;
  players: Player[];
  onCompleteRound: (playerScores: Record<string, number>, errors: Record<string, number>) => void;
}

export const ClosestWinsRound: React.FC<ClosestWinsProps> = ({
  challenge,
  players,
  onCompleteRound
}) => {
  const [playerInputs, setPlayerInputs] = useState<Record<string, number>>({});
  const [currentInputIdx, setCurrentInputIdx] = useState(0);
  const [currentGuessString, setCurrentGuessString] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [scoresComputed, setScoresComputed] = useState<Record<string, number>>({});
  const [errorsComputed, setErrorsComputed] = useState<Record<string, number>>({});

  const activePlayer = players[currentInputIdx] || players[0];
  const allAnswered = currentInputIdx >= players.length;

  if (!activePlayer) return null;

  const handleRegisterGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(currentGuessString.trim());
    if (isNaN(val)) return;

    sound.playStamp();
    const newInputs = { ...playerInputs, [activePlayer.id]: val };
    setPlayerInputs(newInputs);
    setCurrentGuessString('');

    if (currentInputIdx + 1 < players.length) {
      setCurrentInputIdx(currentInputIdx + 1);
    } else {
      // Calculate scores for all players
      computeAllScores(newInputs);
    }
  };

  const computeAllScores = (inputs: Record<string, number>) => {
    const scores: Record<string, number> = {};
    const errors: Record<string, number> = {};

    players.forEach(p => {
      const guess = inputs[p.id] !== undefined ? inputs[p.id] : 0;
      const absDiff = Math.abs(guess - challenge.correctValue);
      const errorPct = (absDiff / Math.max(1, challenge.correctValue)) * 100;
      errors[p.id] = errorPct;

      // Mathematical continuous scoring 0-1000
      let score = 0;
      if (errorPct <= 1) score = 1000;
      else if (errorPct <= 5) score = Math.round(980 - (errorPct - 1) * 25);
      else if (errorPct <= 15) score = Math.round(880 - (errorPct - 5) * 20);
      else if (errorPct <= 35) score = Math.round(680 - (errorPct - 15) * 15);
      else if (errorPct <= 75) score = Math.round(380 - (errorPct - 35) * 6);
      else if (errorPct <= 150) score = Math.max(10, Math.round(140 - (errorPct - 75) * 1.5));
      else score = 0;

      scores[p.id] = score;
    });

    setScoresComputed(scores);
    setErrorsComputed(errors);
    setIsRevealed(true);
    sound.playVictoryFanfare();
  };

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
      {/* Title */}
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Calculator className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Imperial Statistics Office • Numerical Estimate
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
      </div>

      {!isRevealed ? (
        /* Sequential Hidden Entry Screen */
        <div className="w-full max-w-lg bg-[#0e1724] border-2 border-[#d4af37] rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          {/* Privacy Seal Notice */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-['Courier_Prime']">
            <EyeOff size={15} />
            <span>CONFIDENTIAL ESTIMATE ENTRY — CANDIDATE {currentInputIdx + 1} OF {players.length}</span>
          </div>

          <div className="flex items-center gap-3 w-full border-b border-slate-800 pb-3">
            <span className="text-3xl">{activePlayer.avatar}</span>
            <div>
              <span className="font-['Courier_Prime'] text-[9px] text-[#ffd700] uppercase font-bold tracking-widest block">
                Estimated By
              </span>
              <h3 className="font-['Cinzel'] font-bold text-lg text-white">
                {activePlayer.name}
              </h3>
            </div>
          </div>

          <form onSubmit={handleRegisterGuess} className="w-full flex flex-col gap-4">
            <div>
              <label className="font-['Cinzel'] font-bold text-xs text-slate-300 uppercase block mb-1">
                Your Numerical Value ({challenge.unit}):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={currentGuessString}
                  onChange={e => setCurrentGuessString(e.target.value)}
                  placeholder="e.g. 158"
                  className="w-full px-4 py-3 rounded bg-[#0a111a] border border-[#d4af37] text-white text-xl focus:outline-none focus:border-[#ffd700] font-['Space_Mono']"
                />
                {challenge.unitSuffix && (
                  <span className="absolute right-3 top-3.5 font-['Courier_Prime'] text-xs text-slate-400">
                    {challenge.unitSuffix}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!currentGuessString.trim()}
              className="w-full py-3 rounded bg-[#1e3450] hover:bg-[#284872] disabled:opacity-50 text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider border border-[#d4af37] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Seal Estimate &amp; Hand Over</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* Dramatic Reveal of All Guesses */
        <div className="w-full flex flex-col items-center gap-5">
          {/* True Answer Plaque */}
          <div className="w-full max-w-xl bg-[#16253b] border-2 border-[#ffd700] rounded-lg p-5 text-center shadow-2xl">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-widest block">
              Official Certified Value
            </span>
            <div className="font-['Space_Mono'] font-black text-4xl sm:text-5xl text-[#ffd700] my-1">
              {challenge.correctValue.toLocaleString()} {challenge.unitSuffix || challenge.unit}
            </div>
            <p className="font-['Fraunces'] text-slate-300 text-xs italic">
              Verified by the Central Metric Registry
            </p>
          </div>

          {/* Comparison Cards Grid */}
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map(p => {
              const guess = playerInputs[p.id] || 0;
              const errPct = errorsComputed[p.id] || 0;
              const score = scoresComputed[p.id] || 0;

              return (
                <div
                  key={p.id}
                  className="bg-[#0f1928] border border-[#d4af37]/60 rounded-lg p-4 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <h4 className="font-['Cinzel'] font-bold text-sm text-white">{p.name}</h4>
                      <span className="font-['Space_Mono'] text-xs text-slate-300">
                        Guess: <strong>{guess.toLocaleString()}</strong>
                      </span>
                      <span className="block font-['Courier_Prime'] text-[10px] text-amber-300/80">
                        Error: {errPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-['Space_Mono'] font-bold text-xl text-[#ffd700]">
                      +{score}
                    </span>
                    <span className="block font-['Courier_Prime'] text-[9px] text-slate-400 uppercase">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Commentary */}
          <CommentaryPlaque
            score={scoresComputed[players[0]?.id] || 500}
            playerName="Candidates"
            roundType="CLOSEST_WINS"
            questionPrompt={challenge.prompt}
            explanation={challenge.explanation}
            source={challenge.source}
            errorPercent={errorsComputed[players[0]?.id]}
            isCorrect={true}
            onProceed={() => onCompleteRound(scoresComputed, errorsComputed)}
          />
        </div>
      )}
    </div>
  );
};
