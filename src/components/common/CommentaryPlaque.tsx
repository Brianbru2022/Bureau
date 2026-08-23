import React, { useEffect } from 'react';
import { sound } from '../../sound/audioEngine';
import { CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { generateBureauAssessment, type BureauPlayerHistory } from '../../data/commentaryEngine';

interface CommentaryPlaqueProps {
  score: number;
  playerName: string;
  roundType: string;
  questionPrompt?: string;
  explanation: string;
  source?: string;
  playerAnswer?: string | number;
  correctAnswer?: string | number;
  errorKm?: number;
  errorPercent?: number;
  riskedValue?: number;
  isCorrect?: boolean;
  history?: BureauPlayerHistory;
  onProceed: () => void;
}

export const CommentaryPlaque: React.FC<CommentaryPlaqueProps> = ({
  score,
  playerName,
  roundType,
  questionPrompt,
  explanation,
  source,
  playerAnswer,
  correctAnswer,
  errorKm,
  errorPercent,
  riskedValue,
  isCorrect = true,
  history,
  onProceed
}) => {
  useEffect(() => {
    sound.playStamp();
  }, []);

  const assessment = generateBureauAssessment({
    score,
    playerName,
    roundType,
    questionPrompt,
    playerAnswer,
    correctAnswer,
    explanation,
    errorKm,
    errorPercent,
    riskedValue,
    isCorrect,
    history
  });

  const hasAnswerComparison = playerAnswer !== undefined || correctAnswer !== undefined;

  return (
    <div className="w-full max-w-3xl mx-auto my-4 overflow-hidden rounded-[24px] border-[4px] border-[#6e4b31] bg-[#f5e8c9] shadow-[0_10px_0_#5a3925,0_24px_40px_rgba(57,35,20,.25)] font-['Plus_Jakarta_Sans'] animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#6e4b31] bg-[#2f9ea5] px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-2">
          <FileText size={20} />
          <span className="font-['Cinzel'] text-sm font-black uppercase tracking-widest sm:text-base">Bureau Finding</span>
        </div>
        <span className="font-['Courier_Prime'] text-xs">Candidate: <strong>{playerName}</strong></span>
      </div>

      <div className="flex flex-col gap-4 bg-[#fff8e7] p-4 text-[#30434a] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#d4bd8c] pb-4">
          <div>
            <span className="block font-['Courier_Prime'] text-[10px] font-black uppercase tracking-wider text-[#7b6248]">Points certified</span>
            <span className="font-['Space_Mono'] text-4xl font-black text-[#30434a]">+{score.toLocaleString()}</span>
          </div>
          <div className={`-rotate-3 rounded-lg border-[3px] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest ${
            isCorrect
              ? score >= 800
                ? 'border-[#29795f] bg-[#d9efdf] text-[#23634e]'
                : 'border-[#ad7b2d] bg-[#f8e6ab] text-[#76541e]'
              : 'border-[#a74339] bg-[#f5d4cb] text-[#873a33]'
          }`}>
            <span className="flex items-center gap-1.5">
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? (score >= 800 ? 'DISTURBINGLY GOOD' : 'ACCEPTED') : 'REALITY DISAGREES'}
            </span>
          </div>
        </div>

        {hasAnswerComparison && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {playerAnswer !== undefined && (
              <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#f0d36f] p-3 shadow-[0_4px_0_#6e4b31]">
                <span className="font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest text-[#725131]">Submitted</span>
                <div className="mt-1 break-words font-['Fraunces'] text-base font-bold text-[#3c4b4f]">{String(playerAnswer)}</div>
              </div>
            )}
            {correctAnswer !== undefined && (
              <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#a9d6c5] p-3 shadow-[0_4px_0_#6e4b31]">
                <span className="font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest text-[#456351]">Certified answer</span>
                <div className="mt-1 break-words font-['Fraunces'] text-base font-bold text-[#30434a]">{String(correctAnswer)}</div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border-l-[6px] border-[#d19b3b] bg-[#f2e6c8] p-4">
          <span className="mb-1 block font-['Cinzel'] text-xs font-black uppercase tracking-wider text-[#6a4d22]">Archival record</span>
          <p className="font-['Fraunces'] text-sm leading-relaxed text-[#51483e] sm:text-base">{explanation}</p>
          {source && <span className="mt-2 block font-['Courier_Prime'] text-[10px] italic text-[#81715e]">Source: {source}</span>}
        </div>

        <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#334d55] p-4 text-[#fff4d2] shadow-[0_5px_0_#6e4b31]">
          <span className="mb-1 block font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.18em] text-[#f0cf68]">Supervisor's finding</span>
          <p className="font-['Fraunces'] text-sm leading-relaxed sm:text-base">{assessment}</p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => { sound.playClick(); onProceed(); }}
            className="flex items-center gap-2 rounded-xl border-[3px] border-[#6e4b31] bg-[#e55f50] px-6 py-3 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white shadow-[0_5px_0_#6e4b31] active:translate-y-1 active:shadow-none"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
