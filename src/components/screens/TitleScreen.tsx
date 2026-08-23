import React from 'react';
import { BureauInsignia } from '../common/BureauInsignia';
import { sound } from '../../sound/audioEngine';
import { Play, Users, BookOpen, Shield, Award, HelpCircle } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (playerCount: number) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-6 sm:py-10 px-4 font-['Plus_Jakarta_Sans']">
      {/* Grand Insignia */}
      <div className="mb-4 transform hover:scale-105 transition-transform duration-500">
        <BureauInsignia size={110} />
      </div>

      {/* Royal / Institutional Moniker */}
      <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b263b]/80 border border-[#d4af37]/40 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-['Courier_Prime'] text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#e6c875] uppercase">
          Department of Assessment &amp; Cataloguing
        </span>
      </div>

      {/* Main Title Typography */}
      <h1 className="font-['Cinzel'] font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-wider uppercase mb-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
        The Bureau
      </h1>

      <p className="font-['Fraunces'] text-base sm:text-xl text-[#f5deb3] max-w-2xl leading-relaxed mb-8 italic">
        "Her Majesty's prestigious institution established to test, catalogue, and mercilessly judge human knowledge."
      </p>

      {/* Player Selection / Enter Bureau Box */}
      <div className="w-full max-w-lg bg-[#141f30] border-2 border-[#d4af37] rounded-xl p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.85)] flex flex-col items-center gap-5">
        <span className="font-['Cinzel'] font-bold text-xs sm:text-sm text-[#ffd700] uppercase tracking-[0.2em]">
          Select Number of Local Candidates (1–4)
        </span>

        <div className="grid grid-cols-4 gap-3 w-full">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => {
                sound.playStamp();
                onStartGame(num);
              }}
              className="py-4 rounded-lg bg-gradient-to-b from-[#1b2f48] to-[#122236] hover:from-[#243f60] hover:to-[#1a314d] border border-[#d4af37]/60 hover:border-[#ffd700] text-white font-['Space_Mono'] font-extrabold text-xl sm:text-2xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer flex flex-col items-center gap-1 group"
            >
              <span className="group-hover:text-[#ffd700] transition-colors">{num}</span>
              <span className="font-['Courier_Prime'] text-[9px] text-slate-400 font-normal uppercase">
                {num === 1 ? 'Solo' : `${num} Players`}
              </span>
            </button>
          ))}
        </div>

        <p className="font-['Courier_Prime'] text-[11px] text-slate-400">
          Shared on 1 screen / tablet • No rapid timers during handovers • 100% British Institutional Severity
        </p>
      </div>

      {/* Feature Highlights Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-8">
        <div className="p-3.5 bg-[#0f1726]/80 rounded-lg border border-[#d4af37]/20 text-left">
          <div className="flex items-center gap-2 text-[#ffd700] mb-1 font-['Cinzel'] font-bold text-xs uppercase">
            <Shield size={14} />
            <span>Mathematical Rigour</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-400">
            0–1000 continuous score curve calculated directly from geographical &amp; numerical error.
          </p>
        </div>

        <div className="p-3.5 bg-[#0f1726]/80 rounded-lg border border-[#d4af37]/20 text-left">
          <div className="flex items-center gap-2 text-[#ffd700] mb-1 font-['Cinzel'] font-bold text-xs uppercase">
            <Users size={14} />
            <span>Party Mechanics</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-400">
            Secret Directives, Bureau Assets, Underdog Reviews, and the Grand Chamber Final Case.
          </p>
        </div>

        <div className="p-3.5 bg-[#0f1726]/80 rounded-lg border border-[#d4af37]/20 text-left">
          <div className="flex items-center gap-2 text-[#ffd700] mb-1 font-['Cinzel'] font-bold text-xs uppercase">
            <Award size={14} />
            <span>Merciless Voice</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-400">
            Context-specific dry British wit evaluating triumphs, mediocre attempts, and total collapses.
          </p>
        </div>
      </div>
    </div>
  );
};
