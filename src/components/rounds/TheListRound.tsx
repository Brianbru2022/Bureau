import React, { useState } from 'react';
import { TheListChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ListFilter, ShieldCheck, Flame, Send, AlertTriangle } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface TheListProps {
  challenge: TheListChallenge;
  currentPlayer: Player;
  onComplete: (score: number, bankedItems: number) => void;
}

export const TheListRound: React.FC<TheListProps> = ({
  challenge,
  currentPlayer,
  onComplete
}) => {
  const [givenAnswers, setGivenAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentValue, setCurrentValue] = useState(0);
  const [status, setStatus] = useState<'PLAYING' | 'DECIDING' | 'BANKED' | 'BUST'>('PLAYING');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Growth curve for correct answers: 1st=120, 2nd=260, 3rd=420, 4th=600, 5th=780, 6th=920, 7th=1000
  const valueCurve = [120, 260, 420, 600, 780, 920, 1000];

  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) return;

    if (givenAnswers.some(a => a.toLowerCase() === query)) {
      sound.playDisapproval();
      setFeedback(`"${inputValue}" has already been entered.`);
      setInputValue('');
      return;
    }

    const match = challenge.validAnswers.find(v => {
      if (v.name.toLowerCase() === query || query.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(query)) return true;
      return v.aliases.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()));
    });

    if (match) {
      sound.playBrassChime();
      const updated = [...givenAnswers, match.name];
      setGivenAnswers(updated);
      setInputValue('');

      const nextVal = valueCurve[Math.min(valueCurve.length - 1, updated.length - 1)] || (updated.length * 150);
      setCurrentValue(nextVal);
      setFeedback(`Verified: ${match.name}. Current unbanked value: ${nextVal} pts.`);

      // If finished entire list
      if (updated.length >= challenge.validAnswers.length) {
        sound.playVictoryFanfare();
        setStatus('BANKED');
      } else {
        setStatus('DECIDING');
      }
    } else {
      // BUST!
      sound.playDisapproval();
      setFeedback(`Fatal error: "${inputValue}" is invalid. All unbanked points forfeited.`);
      setCurrentValue(0);
      setStatus('BUST');
    }
  };

  const handleBank = () => {
    sound.playBrassChime();
    sound.playStamp();
    setStatus('BANKED');
  };

  const handleContinue = () => {
    sound.playClick();
    setStatus('PLAYING');
    setFeedback('Confidence registered. State your next entry.');
  };

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
      {/* Title */}
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ListFilter className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Vault of Escalation • The List
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          Candidate <strong className="text-[#ffd700]">{currentPlayer.name}</strong>, name items one by one. Bank whenever you dare.
        </p>
      </div>

      {(status === 'PLAYING' || status === 'DECIDING') && (
        <div className="w-full bg-[#0e1724] border-2 border-[#d4af37]/80 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          {/* Pressure Value Meter */}
          <div className="w-full max-w-md bg-[#16253a] border-2 border-[#ffd700] rounded-lg p-4 text-center shadow-lg">
            <span className="font-['Courier_Prime'] text-xs text-amber-300 font-bold uppercase tracking-wider block">
              Current Accumulated Vault Value
            </span>
            <div className="flex items-baseline justify-center gap-2 my-1">
              <span className="font-['Space_Mono'] font-extrabold text-5xl text-[#ffd700]">
                {currentValue}
              </span>
              <span className="font-['Courier_Prime'] text-xs text-slate-300 uppercase font-bold">
                PTS
              </span>
            </div>
            <span className="font-['Courier_Prime'] text-xs text-slate-400">
              Valid items logged: {givenAnswers.length} of {challenge.validAnswers.length}
            </span>
          </div>

          {/* Given answers pills */}
          {givenAnswers.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {givenAnswers.map((a, i) => (
                <span key={i} className="px-3 py-1 rounded bg-[#182a42] border border-[#d4af37]/40 text-xs font-['Cinzel'] text-[#f5deb3] shadow">
                  ✓ {a}
                </span>
              ))}
            </div>
          )}

          {feedback && (
            <div className="p-2.5 rounded bg-[#141f30] border border-amber-500/40 text-xs font-['Courier_Prime'] text-amber-200">
              {feedback}
            </div>
          )}

          {status === 'DECIDING' ? (
            /* Decision Controls: BANK vs CONTINUE */
            <div className="w-full max-w-md flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded text-center">
                <span className="font-['Cinzel'] font-bold text-xs text-amber-300 block mb-0.5">
                  DECISION REQUIRED
                </span>
                <p className="font-['Courier_Prime'] text-xs text-slate-200">
                  Bank {currentValue} points now, or risk total forfeit for the next tier?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBank}
                  className="py-3.5 rounded bg-gradient-to-r from-emerald-700 to-emerald-600 hover:brightness-110 text-white font-['Cinzel'] font-bold text-sm tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 border border-emerald-400"
                >
                  <ShieldCheck size={18} />
                  <span>Bank {currentValue} Pts</span>
                </button>

                <button
                  onClick={handleContinue}
                  className="py-3.5 rounded bg-gradient-to-r from-amber-700 to-amber-600 hover:brightness-110 text-white font-['Cinzel'] font-bold text-sm tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 border border-amber-400"
                >
                  <Flame size={18} />
                  <span>Push On</span>
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleAnswerSubmit} className="w-full max-w-md flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type your next list item..."
                className="w-full px-4 py-3 rounded bg-[#0a111a] border border-[#d4af37] text-white text-base focus:outline-none focus:border-[#ffd700] font-['Plus_Jakarta_Sans']"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-full py-3 rounded bg-[#1e3450] hover:bg-[#284872] disabled:opacity-50 text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider border border-[#d4af37] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Submit to the Registry</span>
              </button>
            </form>
          )}
        </div>
      )}

      {(status === 'BANKED' || status === 'BUST') && (
        <CommentaryPlaque
          score={currentValue}
          playerName={currentPlayer.name}
          roundType="THE_LIST"
          questionPrompt={challenge.prompt}
          explanation={challenge.explanation}
          source={challenge.source}
          isCorrect={currentValue > 0}
          onProceed={() => onComplete(currentValue, givenAnswers.length)}
        />
      )}
    </div>
  );
};
