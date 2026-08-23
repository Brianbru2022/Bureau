import React, { useState } from 'react';
import { RankItChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ArrowUpDown, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { scoreRanking } from '../../game/scoring';

interface RankItProps {
  challenge: RankItChallenge;
  currentPlayer: Player;
  onComplete: (score: number) => void;
}

export const RankItRound: React.FC<RankItProps> = ({
  challenge,
  currentPlayer,
  onComplete
}) => {
  const [itemsOrder, setItemsOrder] = useState(() => {
    return [...challenge.items].sort(() => Math.random() - 0.5);
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    sound.playClick();
    const newItems = [...itemsOrder];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItemsOrder(newItems);
  };

  const handleConfirmOrder = () => {
    sound.playStamp();
    setEarnedScore(scoreRanking(itemsOrder));
    setIsSubmitted(true);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-3xl mx-auto font-['Plus_Jakarta_Sans']">
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ArrowUpDown className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Sequential Registry • Rank It
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          Candidate <strong className="text-[#ffd700]">{currentPlayer.name}</strong>, arrange the plaques in precise ascending order.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="w-full bg-[#0e1724] border-2 border-[#d4af37]/80 rounded-lg p-5 flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-full flex flex-col gap-2.5">
            {itemsOrder.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#152336] border border-[#d4af37]/40 hover:border-[#d4af37] rounded-lg p-3 flex items-center justify-between gap-3 shadow transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#d4af37] text-[#0a101d] font-['Space_Mono'] font-bold text-xs flex items-center justify-center shadow">
                    #{idx + 1}
                  </span>
                  <span className="font-['Cinzel'] font-bold text-sm sm:text-base text-white tracking-wide">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'UP')}
                    className="p-2 rounded bg-[#1e3450] hover:bg-[#284872] disabled:opacity-30 text-[#ffd700] transition-colors"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    disabled={idx === itemsOrder.length - 1}
                    onClick={() => moveItem(idx, 'DOWN')}
                    className="p-2 rounded bg-[#1e3450] hover:bg-[#284872] disabled:opacity-30 text-[#ffd700] transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmOrder}
            className="w-full max-w-md py-3.5 mt-2 rounded bg-[#1e3450] hover:bg-[#284872] text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-widest border border-[#d4af37] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Lock Sequence in Archival Order</span>
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full max-w-xl bg-[#0e1724] border border-[#d4af37] rounded-lg p-4">
            <span className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wider block mb-2">
              Certified Chronological / Hierarchical Order
            </span>
            <div className="flex flex-col gap-2">
              {[...challenge.items].sort((a, b) => a.correctRank - b.correctRank).map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 rounded bg-[#152336] text-xs">
                  <span className="font-bold text-[#ffd700]">#{item.correctRank} {item.label}</span>
                  <span className="text-slate-400 font-['Courier_Prime']">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <CommentaryPlaque
            score={earnedScore}
            playerName={currentPlayer.name}
            roundType="RANK_IT"
            questionPrompt={challenge.prompt}
            explanation={challenge.explanation}
            source={challenge.source}
            isCorrect={earnedScore >= 600}
            onProceed={() => onComplete(earnedScore)}
          />
        </div>
      )}
    </div>
  );
};
