import React, { useState } from 'react';
import { PutUpOrShutUpChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Gavel, Check, Send } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { scoreBidSuccess } from '../../game/scoring';

interface PutUpOrShutUpProps {
  challenge: PutUpOrShutUpChallenge;
  players: Player[];
  currentPlayerIndex: number;
  onComplete: (winnerId: string, score: number) => void;
}

export const PutUpOrShutUpRound: React.FC<PutUpOrShutUpProps> = ({
  challenge,
  players,
  currentPlayerIndex,
  onComplete
}) => {
  const [phase, setPhase] = useState<'BIDDING' | 'EXECUTION' | 'SUMMARY'>('BIDDING');
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [highestBidderIndex, setHighestBidderIndex] = useState<number>(-1);
  const [passedPlayerIds, setPassedPlayerIds] = useState<string[]>([]);
  const [turnIndex, setTurnIndex] = useState(currentPlayerIndex);
  const [answersGiven, setAnswersGiven] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  const activeBidder = players[turnIndex % (players.length || 1)] || players[0];
  const winningPlayer = (highestBidderIndex >= 0 ? players[highestBidderIndex] : players[0]) || activeBidder;
  if (!activeBidder || !winningPlayer) return null;

  const handlePlaceBid = (bidAmount: number) => {
    const cappedBid = Math.min(challenge.validAnswers.length, bidAmount);
    sound.playStamp();
    setCurrentBid(cappedBid);
    setHighestBidderIndex(turnIndex % players.length);

    if (players.length === 1 || cappedBid >= challenge.validAnswers.length) {
      setPhase('EXECUTION');
      return;
    }

    advanceBiddingTurn(passedPlayerIds);
  };

  const handlePass = () => {
    sound.playClick();
    const newPassed = [...passedPlayerIds, activeBidder.id];
    setPassedPlayerIds(newPassed);

    const remaining = players.filter(p => !newPassed.includes(p.id));
    if (remaining.length <= 1 && currentBid > 0) {
      setPhase('EXECUTION');
      return;
    }

    if (newPassed.length >= players.length) {
      if (currentBid === 0) {
        setCurrentBid(1);
        setHighestBidderIndex(currentPlayerIndex);
      }
      setPhase('EXECUTION');
      return;
    }

    advanceBiddingTurn(newPassed);
  };

  const advanceBiddingTurn = (passed: string[]) => {
    let nextIdx = turnIndex + 1;
    let attempts = 0;
    while (passed.includes(players[nextIdx % players.length].id) && attempts < players.length) {
      nextIdx++;
      attempts++;
    }
    setTurnIndex(nextIdx);
  };

  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) return;

    if (answersGiven.some(a => a.toLowerCase() === query)) {
      sound.playDisapproval();
      setFeedback(`"${inputValue}" was already entered in this testimony.`);
      setInputValue('');
      return;
    }

    const match = challenge.validAnswers.find(v => {
      if (v.name.toLowerCase() === query || query.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(query)) return true;
      return v.aliases.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()));
    });

    if (match) {
      sound.playBrassChime();
      const updated = [...answersGiven, match.name];
      setAnswersGiven(updated);
      setInputValue('');
      setFeedback(`Accepted: ${match.name} (${updated.length} of ${currentBid})`);

      if (updated.length >= currentBid) {
        sound.playVictoryFanfare();
        setFinalScore(scoreBidSuccess(currentBid, challenge.validAnswers.length));
        setIsSuccess(true);
        setPhase('SUMMARY');
      }
    } else {
      sound.playDisapproval();
      setFeedback(`Rejected: "${inputValue}" is not a valid ${challenge.targetUnit}. Contract voided.`);
      setFinalScore(0);
      setIsSuccess(false);
      setPhase('SUMMARY');
    }
  };

  const nextBidValues = [1, 2, 3]
    .map(increment => Math.min(challenge.validAnswers.length, currentBid + increment))
    .filter((value, index, values) => value > currentBid && values.indexOf(value) === index);

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Gavel className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Bidding Chamber • Put Up Or Shut Up
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
      </div>

      {phase === 'BIDDING' && (
        <div className="w-full bg-[#0e1724] border-2 border-[#d4af37]/70 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-full max-w-md bg-[#16253a] border border-[#d4af37] rounded-lg p-4 text-center">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">Current Contract</span>
            <div className="flex items-baseline justify-center gap-2 my-1">
              <span className="font-['Space_Mono'] font-extrabold text-4xl text-[#ffd700]">{currentBid}</span>
              <span className="font-['Cinzel'] font-bold text-sm text-slate-300">{challenge.targetUnit}</span>
            </div>
            {currentBid > 0 && (
              <span className="font-['Courier_Prime'] text-xs text-emerald-300">
                Successful claim value: {scoreBidSuccess(currentBid, challenge.validAnswers.length)} pts
              </span>
            )}
          </div>

          <div className="w-full max-w-md bg-[#101b2a] border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeBidder.avatar}</span>
              <div>
                <span className="font-['Courier_Prime'] text-[10px] text-[#ffd700] uppercase font-bold tracking-widest block">Active Bidding Turn</span>
                <h4 className="font-['Cinzel'] font-bold text-base text-white">{activeBidder.name}</h4>
              </div>
            </div>

            <div className={`grid gap-2 mt-2 ${nextBidValues.length === 1 ? 'grid-cols-1' : nextBidValues.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {nextBidValues.map(value => (
                <button
                  key={value}
                  onClick={() => handlePlaceBid(value)}
                  className="py-2.5 rounded bg-[#1e3450] hover:bg-[#284872] border border-[#d4af37]/60 text-[#ffd700] font-['Space_Mono'] font-bold text-sm transition-all"
                >
                  Bid {value}
                </button>
              ))}
            </div>

            <button
              onClick={handlePass}
              className="w-full py-2.5 mt-1 rounded bg-[#241315] hover:bg-[#381d20] border border-rose-800 text-rose-300 font-['Cinzel'] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Pass (Shut Up)
            </button>
          </div>
        </div>
      )}

      {phase === 'EXECUTION' && (
        <div className="w-full bg-[#0e1724] border-2 border-[#d4af37] rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-slate-400 uppercase font-bold tracking-widest">Execution Phase</span>
            <h3 className="font-['Cinzel'] font-bold text-lg text-white">
              {winningPlayer.name} must name <span className="text-[#ffd700]">{currentBid}</span> valid {challenge.targetUnit}
            </h3>
            <p className="font-['Courier_Prime'] text-xs text-amber-300 mt-1">One wrong answer collapses the entire claim immediately.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: currentBid }).map((_, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded border flex items-center justify-center font-['Space_Mono'] font-bold text-xs ${
                  i < answersGiven.length
                    ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {i < answersGiven.length ? <Check size={16} /> : i + 1}
              </div>
            ))}
          </div>

          {feedback && (
            <div className="p-2.5 rounded bg-[#141f30] border border-amber-500/40 text-xs font-['Courier_Prime'] text-amber-200">{feedback}</div>
          )}

          <form onSubmit={handleAnswerSubmit} className="w-full max-w-md flex flex-col gap-3">
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Enter a valid answer..."
              className="w-full px-4 py-3 rounded bg-[#0a111a] border border-[#d4af37] text-white text-base focus:outline-none focus:border-[#ffd700] font-['Plus_Jakarta_Sans']"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-full py-3 rounded bg-[#1e3450] hover:bg-[#284872] disabled:opacity-50 text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider border border-[#d4af37] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>Verify Answer</span>
            </button>
          </form>
        </div>
      )}

      {phase === 'SUMMARY' && (
        <CommentaryPlaque
          score={finalScore}
          playerName={winningPlayer.name}
          roundType="PUT_UP_OR_SHUT_UP"
          questionPrompt={challenge.prompt}
          explanation={challenge.explanation}
          source={challenge.source}
          isCorrect={isSuccess === true}
          onProceed={() => onComplete(winningPlayer.id, finalScore)}
        />
      )}
    </div>
  );
};
