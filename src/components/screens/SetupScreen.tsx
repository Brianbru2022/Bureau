import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { assignSecretDirectives } from '../../data/secretDirectives';
import { ArrowRight, UserCheck, Shuffle } from 'lucide-react';

interface SetupScreenProps {
  playerCount: number;
  onProceedToDirectives: (players: Player[]) => void;
}

const DEFAULT_AVATARS = ['🧐', '🎩', '🏛️', '👑', '📜', '⚖️', '🧭', '🔬'];
const BRITISH_DEPARTMENTS = [
  'Department of Cartography & Spite',
  'Admiralty Ministry of Obscure Measurements',
  'Board of Reluctant Approval',
  'Office of Unnecessary Precision',
  'Ministry of Sarcastic Oversight',
  'Crown Archive of Questionable Claims'
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  playerCount,
  onProceedToDirectives
}) => {
  const [profiles, setProfiles] = useState<Array<{ name: string; avatar: string; department: string }>>(() => {
    return Array.from({ length: playerCount }).map((_, i) => ({
      name: `Candidate ${i + 1}`,
      avatar: DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
      department: BRITISH_DEPARTMENTS[i % BRITISH_DEPARTMENTS.length]
    }));
  });

  const handleUpdateName = (index: number, name: string) => {
    const next = [...profiles];
    next[index].name = name;
    setProfiles(next);
  };

  const handleCycleAvatar = (index: number) => {
    sound.playClick();
    const next = [...profiles];
    const currentIdx = DEFAULT_AVATARS.indexOf(next[index].avatar);
    next[index].avatar = DEFAULT_AVATARS[(currentIdx + 1) % DEFAULT_AVATARS.length];
    setProfiles(next);
  };

  const handleProceed = () => {
    sound.playStamp();
    const directives = assignSecretDirectives(playerCount);

    const createdPlayers: Player[] = profiles.map((p, i) => ({
      id: `p-${i + 1}`,
      name: p.name.trim() || `Candidate ${i + 1}`,
      avatar: p.avatar,
      color: ['#4fd1c5', '#f6ad55', '#d6bcfa', '#feb2b2'][i % 4],
      department: p.department,
      score: 0,
      assets: ['SECOND_OPINION', 'DOUBLE_ENTRY'], // Start with 2 Bureau credentials
      secretDirective: directives[i],
      stats: {
        roundsPlayed: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        bestScore: 0,
        worstScore: 1000,
        mapDistancesKm: [],
        estimateErrorsPercent: [],
        risksTaken: 0,
        successfulRisks: 0,
        highestBankedList: 0,
        categoriesAttempted: new Set<string>(),
        interceptCount: 0
      }
    }));

    onProceedToDirectives(createdPlayers);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto py-6 px-4 font-['Plus_Jakarta_Sans']">
      <div className="text-center mb-6">
        <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] uppercase tracking-widest block mb-1">
          Registry Registration Protocol
        </span>
        <h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-white">
          Candidate Enrolment Dossiers
        </h2>
        <p className="font-['Fraunces'] text-xs sm:text-sm text-slate-300 italic mt-1">
          Provide your candidate credentials before Her Majesty's inspectors commence the assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        {profiles.map((prof, idx) => (
          <div
            key={idx}
            className="bg-[#121c2c] border-2 border-[#d4af37]/60 rounded-xl p-5 shadow-xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-['Courier_Prime'] font-bold text-[10px] text-[#ffd700] uppercase tracking-wider">
                Candidate #{idx + 1} Dossier
              </span>
              <span className="text-[10px] text-slate-400 font-['Courier_Prime']">
                Clearance: Level 1
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Avatar Selector Button */}
              <button
                type="button"
                onClick={() => handleCycleAvatar(idx)}
                className="w-14 h-14 rounded-lg bg-[#1a293e] border border-[#d4af37] flex items-center justify-center text-3xl shadow hover:brightness-125 transition-all shrink-0 cursor-pointer"
                title="Click to cycle candidate insignia"
              >
                {prof.avatar}
              </button>

              <div className="flex-1 flex flex-col gap-1">
                <label className="font-['Cinzel'] text-xs font-bold text-slate-300 uppercase">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={prof.name}
                  onChange={e => handleUpdateName(idx, e.target.value)}
                  placeholder={`Candidate ${idx + 1}`}
                  className="w-full px-3 py-1.5 rounded bg-[#0a111a] border border-[#d4af37]/50 text-white text-sm font-['Plus_Jakarta_Sans'] focus:outline-none focus:border-[#ffd700]"
                />
              </div>
            </div>

            {/* Department Moniker */}
            <div className="bg-[#0b1320] p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-['Courier_Prime'] text-[10px] text-slate-400 truncate">
                {prof.department}
              </span>
              <span className="text-[#ffd700] text-[9px] font-bold font-['Courier_Prime'] uppercase shrink-0 pl-2">
                ASSIGNED
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleProceed}
        className="px-10 py-4 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 border-2 border-amber-300 transform active:scale-95 transition-all cursor-pointer"
      >
        <span>Authorize Credentials &amp; Receive Directives</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
