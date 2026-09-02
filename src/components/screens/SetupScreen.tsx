import React, { useState } from 'react';
import { Player, BureauAssetKey } from '../../types';
import { sound } from '../../sound/audioEngine';
import { assignSecretDirectives } from '../../data/secretDirectives';
import { gameRandom } from '../../game/random';
import { ArrowRight } from 'lucide-react';
import { BureauAvatar } from '../common/BureauAvatar';

interface SetupScreenProps {
  playerCount: number;
  onProceedToDirectives: (players: Player[]) => void;
  firstAssessment?: boolean;
}

const DEFAULT_AVATARS = ['🧭', '📚', '🔬', '🔎', '⚙️', '👑', '🏛️', '🌐'];
const BRITISH_DEPARTMENTS = [
  'Department of Cartography & Spite',
  'Admiralty Ministry of Obscure Measurements',
  'Board of Reluctant Approval',
  'Office of Unnecessary Precision',
  'Ministry of Sarcastic Oversight',
  'Independent Archive of Questionable Claims'
];
const STARTER_ASSETS: BureauAssetKey[] = ['SECOND_OPINION', 'REFILE', 'INSURANCE'];
const CARD_COLORS = ['#67c4c1', '#e0a83f', '#d9644f', '#7ca66f'];

type Profile = { name: string; avatar: string; portraitIndex: number; department: string };

export const SetupScreen: React.FC<SetupScreenProps> = ({ playerCount, onProceedToDirectives, firstAssessment = false }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    Array.from({ length: playerCount }).map((_, i) => ({
      name: `Candidate ${i + 1}`,
      avatar: DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
      portraitIndex: i % 8,
      department: BRITISH_DEPARTMENTS[i % BRITISH_DEPARTMENTS.length]
    }))
  );

  const handleUpdateName = (index: number, name: string) => {
    const next = [...profiles]; next[index].name = name; setProfiles(next);
  };

  const handleCycleAvatar = (index: number) => {
    sound.playClick();
    const next = [...profiles];
    next[index].portraitIndex = (next[index].portraitIndex + 1) % 8;
    next[index].avatar = DEFAULT_AVATARS[next[index].portraitIndex];
    setProfiles(next);
  };

  const handleProceed = () => {
    sound.playStamp();
    const directives = assignSecretDirectives(playerCount, gameRandom);
    const createdPlayers: Player[] = profiles.map((p, i) => ({
      id: `p-${i + 1}`,
      name: p.name.trim() || `Candidate ${i + 1}`,
      avatar: p.avatar,
      portraitIndex: p.portraitIndex,
      color: ['#4fd1c5', '#f6ad55', '#d6bcfa', '#feb2b2'][i % 4],
      department: p.department,
      score: 0,
      influence: 1,
      assets: firstAssessment ? [] : [STARTER_ASSETS[Math.floor(Math.random() * STARTER_ASSETS.length)]],
      secretDirective: directives[i],
      stats: {
        roundsPlayed: 0, correctAnswers: 0, totalAnswers: 0, bestScore: 0, worstScore: 1000,
        mapDistancesKm: [], estimateErrorsPercent: [], risksTaken: 0, successfulRisks: 0,
        highestBankedList: 0, categoriesAttempted: new Set<string>(), interceptCount: 0,
        challengeScores: [], mapScores: [], successfulListBanks: [], categoryScores: {}, assetsUsed: [], roundScores:{}, successfulRiskScores:[], rivalryPredictionsWon:0, rivalryMotionsSucceeded:0, influenceEarned:0
      }
    }));
    onProceedToDirectives(createdPlayers);
  };

  return (
    <div className="bureau-registration flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto py-5 px-4">
      <div className="bureau-registration-header text-center mb-6 bureau-paper rounded-[24px] border-[3px] border-[#7e5c24] px-8 py-5 max-w-3xl w-full">
        <span className="font-['Courier_Prime'] text-[10px] font-black text-[#a9443d] uppercase tracking-[0.2em] block mb-1">Candidate Registration</span>
        <h2 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-[#244b55]">Issue the Bureau ID Cards</h2>
        <p className="font-['Fraunces'] text-sm text-[#6f543f] italic mt-2">Tap a portrait to cycle candidates. Names are compulsory. Competence remains optional.</p>
      </div>

      <div className={`bureau-registration-grid grid grid-cols-1 gap-5 w-full mb-7 sm:grid-cols-2 ${playerCount >= 3 ? 'xl:grid-cols-4' : ''}`}>
        {profiles.map((prof, idx) => (
          <div key={idx} className="bureau-registration-card relative rounded-[24px] border-[4px] border-[#6f4933] p-5 bureau-enamel overflow-hidden bureau-paper-drop" style={{ backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }}>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20" />
            <div className="bureau-registration-meta flex items-center justify-between border-b-2 border-[#6f4933]/30 pb-3 mb-4">
              <span className="font-['Courier_Prime'] font-black text-[10px] text-[#423424] uppercase tracking-wider">Bureau ID #{String(idx + 1).padStart(2, '0')}</span>
              <span className="rounded-full bg-[#fff7df]/80 border border-[#6f4933]/40 px-2 py-0.5 text-xs text-[#6d533e] font-['Courier_Prime'] font-bold uppercase">Provisional</span>
            </div>

            <div className="bureau-registration-profile flex items-center gap-4">
              <button type="button" aria-label={`Change portrait for candidate ${idx + 1}`} onClick={() => handleCycleAvatar(idx)} className="bureau-registration-portrait bureau-button w-[118px] h-[150px] rounded-[22px] bg-[#fff7df] border-[#6f4933] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden p-1.5" title="Cycle portrait">
                <BureauAvatar avatar={prof.avatar} portraitIndex={prof.portraitIndex} size={104} variant="card" className="border-0 shadow-none" />
              </button>
              <div className="flex-1 min-w-0">
                <label htmlFor={`candidate-name-${idx}`} className="font-['Courier_Prime'] text-xs font-black text-[#4d3e30] uppercase tracking-widest block mb-1">Candidate name {idx + 1}</label>
                <input id={`candidate-name-${idx}`} type="text" value={prof.name} onChange={e => handleUpdateName(idx, e.target.value)} className="w-full rounded-xl border-[3px] border-[#6f4933]/55 bg-[#fff7df] px-3 py-2.5 text-[#263238] font-['Cinzel'] font-black text-base outline-none focus:border-[#376d9b] shadow-inner" />
                <p className="bureau-registration-note mt-3 font-['Courier_Prime'] text-xs leading-relaxed text-[#5f4b39]">Portraits are filed vertically. The Bureau has reluctantly stopped forcing its staff into square apertures.</p>
              </div>
            </div>

            <div className="bureau-registration-department mt-4 rounded-xl border-2 border-[#6f4933]/35 bg-[#fff7df]/75 px-3 py-2.5 flex items-center justify-between gap-2">
              <span className="font-['Courier_Prime'] text-[10px] font-bold text-[#674f3b] truncate">{prof.department}</span>
              <span className="text-[#a9443d] text-xs font-black font-['Courier_Prime'] uppercase shrink-0">Assigned</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleProceed} className="bureau-registration-proceed bureau-button px-9 py-4 rounded-2xl bg-[#376d9b] text-[#fff7df] font-['Cinzel'] font-black text-sm uppercase tracking-widest flex items-center gap-3 cursor-pointer">
        {firstAssessment ? 'Issue Cards & Begin Briefing' : 'Issue Cards & Receive Directives'} <ArrowRight size={18} />
      </button>
    </div>
  );
};
