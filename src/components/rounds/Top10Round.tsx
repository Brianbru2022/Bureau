import React, { useState } from 'react';
import { Top10Challenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Layers, Send, XCircle, Award, CheckCircle } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface Top10RoundProps {
  challenge: Top10Challenge;
  players: Player[];
  currentPlayerIndex: number;
  onCompleteRound: (playerScores: Record<string, number>) => void;
}

export const Top10Round: React.FC<Top10RoundProps> = ({
  challenge,
  players,
  currentPlayerIndex: initialTurnIdx,
  onCompleteRound
}) => {
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [turnIndex, setTurnIndex] = useState(initialTurnIdx);
  const [strikes, setStrikes] = useState<number>(0);
  const maxStrikes = Math.max(3, players.length * 2);
  const [playerRoundScores, setPlayerRoundScores] = useState<Record<string, number>>(() => {
    const acc: Record<string, number> = {};
    players.forEach(p => { acc[p.id] = 0; });
    return acc;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const activePlayer = players[turnIndex % (players.length || 1)] || players[0];
  if (!activePlayer) return null;

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) return;

    // Check against hidden items
    const match = challenge.items.find(item => {
      if (revealedRanks.includes(item.rank)) return false;
      if (item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase())) return true;
      return item.aliases.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()));
    });

    if (match) {
      sound.playBrassChime();
      const baseValue = (11 - match.rank) * 75; // e.g. Rank 1 = 750, Rank 10 = 75
      const scored = Math.round(baseValue * match.rarityMultiplier);

      setRevealedRanks(prev => [...prev, match.rank]);
      setPlayerRoundScores(prev => ({
        ...prev,
        [activePlayer.id]: (prev[activePlayer.id] || 0) + scored
      }));

      setMessage(`Correct! #${match.rank}: ${match.name} revealed (+${scored} pts)`);
      setInputValue('');

      // Check if all 10 completed
      if (revealedRanks.length + 1 >= challenge.items.length) {
        sound.playStamp();
        setIsRoundOver(true);
        return;
      }
    } else {
      sound.playDisapproval();
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage(`Incorrect submission. The Bureau rejects "${inputValue}". Strike ${newStrikes}/${maxStrikes}.`);
      setInputValue('');

      if (newStrikes >= maxStrikes) {
        setIsRoundOver(true);
        return;
      }
    }

    // Advance turn to next player
    setTurnIndex(prev => prev + 1);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-5xl mx-auto font-['Plus_Jakarta_Sans']">
      {/* Title Header */}
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Layers className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Hall of Records • Top 10 Assessment
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          Take turns naming valid entries. Less obvious entries command greater bureaucratic merit.
        </p>
      </div>

      {!isRoundOver ? (
        <div className="w-full flex flex-col lg:flex-row gap-5 items-start">
          {/* Physical Records Board (10 Slots) */}
          <div className="flex-1 w-full bg-[#0d1624] border-2 border-[#d4af37]/60 rounded-lg p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2 mb-3">
              <span className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wider">
                Official Archival Ledger
              </span>
              <div className="flex items-center gap-1">
                <span className="font-['Courier_Prime'] text-[11px] text-slate-400">Strikes:</span>
                {Array.from({ length: maxStrikes }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full border ${
                      i < strikes ? 'bg-rose-600 border-rose-400' : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {challenge.items.map(item => {
                const isRevealed = revealedRanks.includes(item.rank);
                return (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between px-3 py-2.5 rounded border transition-all duration-300 ${
                      isRevealed
                        ? 'bg-gradient-to-r from-[#1c2d44] to-[#2b4162] border-[#d4af37] text-white shadow-md'
                        : 'bg-[#121d2c]/90 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-['Space_Mono'] font-bold text-xs shrink-0 ${
                        isRevealed ? 'bg-[#d4af37] text-[#0a101d]' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                      <span className={`font-['Cinzel'] text-xs font-bold truncate ${
                        isRevealed ? 'text-[#f5deb3]' : 'text-slate-500 italic'
                      }`}>
                        {isRevealed ? item.name : '••••••••••••••••'}
                      </span>
                    </div>

                    <div className="shrink-0 text-right pl-2">
                      <span className="font-['Courier_Prime'] text-[10px] text-slate-400 block">
                        {isRevealed ? item.detail : `x${item.rarityMultiplier.toFixed(1)} val`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Turn Input Panel */}
          <div className="w-full lg:w-80 bg-[#141f30] border border-[#d4af37]/40 rounded-lg p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-700">
              <span className="text-2xl">{activePlayer.avatar}</span>
              <div>
                <span className="font-['Courier_Prime'] text-[9px] text-[#ffd700] uppercase font-bold tracking-widest block">
                  Current Turn
                </span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-white">
                  {activePlayer.name}
                </h4>
              </div>
            </div>

            {message && (
              <div className="p-2.5 rounded bg-[#0c1420] border border-[#d4af37]/30 text-xs font-['Courier_Prime'] text-amber-200">
                {message}
              </div>
            )}

            <form onSubmit={handleGuessSubmit} className="flex flex-col gap-3">
              <label className="font-['Cinzel'] font-bold text-xs text-slate-300 uppercase">
                Propose an Entry:
              </label>
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-3.5 py-2.5 rounded bg-[#0b131f] border border-[#d4af37]/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#ffd700] font-['Plus_Jakarta_Sans']"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-full py-2.5 rounded bg-[#1f3552] hover:bg-[#28466d] disabled:opacity-50 text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider border border-[#d4af37]/50 transition-all flex items-center justify-center gap-2 shadow"
              >
                <Send size={14} />
                <span>Submit to Ledger</span>
              </button>
            </form>

            {/* Current Round Scores */}
            <div className="mt-2 pt-3 border-t border-slate-800">
              <span className="font-['Courier_Prime'] text-[10px] text-slate-400 block mb-1 uppercase font-bold">
                Round Accruals
              </span>
              <div className="flex flex-col gap-1">
                {players.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-['Cinzel']">{p.name}</span>
                    <span className="font-['Space_Mono'] font-bold text-[#ffd700]">
                      +{playerRoundScores[p.id] || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Round Over Summary */
        <div className="w-full flex flex-col items-center">
          {/* Reveal all remaining */}
          <div className="w-full max-w-2xl bg-[#0e1724] border border-[#d4af37]/60 rounded-lg p-4 mb-4">
            <h4 className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wider mb-2">
              Full Archival Top 10 Disclosed
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {challenge.items.map(item => (
                <div key={item.rank} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#162335] text-xs">
                  <span className="font-bold text-[#ffd700]">#{item.rank} {item.name}</span>
                  <span className="text-[10px] text-slate-400 font-['Courier_Prime']">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <CommentaryPlaque
            score={playerRoundScores[players[0]?.id] || 650}
            playerName="Candidates"
            roundType="TOP_10"
            questionPrompt={challenge.prompt}
            explanation={challenge.explanation}
            source={challenge.source}
            isCorrect={revealedRanks.length >= 5}
            onProceed={() => onCompleteRound(playerRoundScores)}
          />
        </div>
      )}
    </div>
  );
};
