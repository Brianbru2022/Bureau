import React, { useEffect } from 'react';
import { sound } from '../../sound/audioEngine';
import { CheckCircle2, XCircle, FileText, ArrowRight, Shield } from 'lucide-react';
import { generateBureauAssessment } from '../../data/commentaryEngine';

interface CommentaryPlaqueProps {
  score: number;
  playerName: string;
  roundType: string;
  questionPrompt?: string;
  explanation: string;
  source?: string;
  errorKm?: number;
  errorPercent?: number;
  isCorrect?: boolean;
  onProceed: () => void;
  doubleEntryActive?: boolean;
}

export const CommentaryPlaque: React.FC<CommentaryPlaqueProps> = ({
  score,
  playerName,
  roundType,
  questionPrompt,
  explanation,
  source,
  errorKm,
  errorPercent,
  isCorrect = true,
  onProceed,
  doubleEntryActive = false
}) => {
  useEffect(() => {
    sound.playStamp();
  }, []);

  const assessment = generateBureauAssessment({
    score,
    playerName,
    roundType,
    questionPrompt,
    errorKm,
    errorPercent,
    isCorrect
  });

  return (
    <div className="w-full max-w-3xl mx-auto my-4 bg-[#141e2e] border-2 border-[#d4af37] rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden font-['Plus_Jakarta_Sans'] animate-in fade-in zoom-in-95 duration-300">
      {/* Brass Header Plate */}
      <div className="bg-gradient-to-r from-[#1b2a41] via-[#243b55] to-[#1b2a41] px-4 sm:px-6 py-3 border-b border-[#d4af37]/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="text-[#e6c875]" size={20} />
          <span className="font-['Cinzel'] font-bold text-sm sm:text-base text-[#e6c875] tracking-widest uppercase">
            Official Bureau Assessment Dossier
          </span>
        </div>

        <div className="flex items-center gap-3">
          {doubleEntryActive && (
            <span className="flex items-center gap-1 text-[10px] font-['Courier_Prime'] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500">
              <Shield size={12} /> DOUBLE ENTRY APPLIED
            </span>
          )}
          <span className="font-['Courier_Prime'] text-xs text-slate-300">
            Candidate: <strong className="text-white">{playerName}</strong>
          </span>
        </div>
      </div>

      {/* Main Parchment Assessment Sheet */}
      <div className="p-4 sm:p-6 bg-[#fcf8ed] text-slate-900 flex flex-col gap-4">
        {/* Score Plaque & Ink Stamp */}
        <div className="flex items-center justify-between border-b border-stone-300 pb-3 flex-wrap gap-3">
          <div>
            <span className="block font-['Courier_Prime'] text-xs font-bold uppercase tracking-wider text-stone-500">
              Points Certified by Whitehall
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Mono'] font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                +{score.toLocaleString()}
              </span>
              <span className="font-['Courier_Prime'] text-xs text-stone-600 font-bold">/ 1,000</span>
            </div>
          </div>

          {/* Stamped Ink Seal */}
          <div className={`transform -rotate-6 px-3 py-1.5 rounded border-2 font-['Courier_Prime'] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${
            score > 500 
              ? 'border-emerald-800 text-emerald-900 bg-emerald-100/70' 
              : score > 0 
                ? 'border-amber-800 text-amber-900 bg-amber-100/70' 
                : 'border-rose-800 text-rose-900 bg-rose-100/70'
          }`}>
            {score > 0 ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{score >= 800 ? 'EXEMPLARY' : score > 400 ? 'ACCEPTED' : score > 0 ? 'SUB-STANDARD' : 'CATASTROPHIC'}</span>
          </div>
        </div>

        {/* The Factual Explanation (Weaved with dry British context) */}
        <div className="bg-[#f2ebdc] border-l-4 border-[#8b6b23] p-3.5 rounded-r">
          <span className="font-['Cinzel'] font-bold text-xs text-[#614710] block mb-1 uppercase tracking-wider">
            Archival Record &amp; Context
          </span>
          <p className="font-['Fraunces'] text-stone-800 text-sm sm:text-base leading-relaxed">
            {explanation}
          </p>
          {source && (
            <span className="block mt-2 font-['Courier_Prime'] text-[10px] text-stone-500 italic">
              Source: {source}
            </span>
          )}
        </div>

        {/* Bureau Sarcastic Assessment (Merciless British Supervisor) */}
        <div className="bg-stone-900 text-amber-100 p-3.5 rounded border border-amber-700/40">
          <span className="font-['Courier_Prime'] font-bold text-[11px] text-amber-400 block mb-1 tracking-widest uppercase">
            Supervisor's Confidential Appraisal
          </span>
          <p className="font-['Courier_Prime'] text-xs sm:text-sm text-stone-200 leading-relaxed italic">
            "{assessment}"
          </p>
        </div>

        {/* Proceed Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onProceed();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded bg-[#1b2a41] hover:bg-[#253a5b] text-[#ffd700] font-['Cinzel'] font-bold text-sm tracking-widest uppercase border border-[#d4af37] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Affix Seal &amp; Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
