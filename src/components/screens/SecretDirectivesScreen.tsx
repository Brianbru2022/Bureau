import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { EyeOff, ArrowRight, Lock } from 'lucide-react';

interface SecretDirectivesProps {
  players: Player[];
  onFinishDirectives: () => void;
}

export const SecretDirectivesScreen: React.FC<SecretDirectivesProps> = ({ players, onFinishDirectives }) => {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const player = players[currentPlayerIdx] || players[0];
  if (!player) return null;
  const directive = player.secretDirective;

  const handleToggleReveal = () => {
    sound.playStamp();
    setIsRevealed(!isRevealed);
  };

  const handleNextPlayer = () => {
    sound.playClick();
    setIsRevealed(false);
    if (currentPlayerIdx + 1 < players.length) setCurrentPlayerIdx(currentPlayerIdx + 1);
    else onFinishDirectives();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto py-6 px-4 font-['Plus_Jakarta_Sans']">
      <div className="text-center mb-6">
        <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] uppercase tracking-widest block mb-1">Confidential Briefing Protocol</span>
        <h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-white">Secret Bureau Directives</h2>
        <p className="font-['Fraunces'] text-xs sm:text-sm text-slate-300 italic mt-1">Each candidate receives one private objective. {players.length > 1 ? 'Two additional Bureau commendations have also been selected in secret and will not be revealed until the end.' : 'Solo performance will be judged directly against Bureau standards.'}</p>
      </div>

      <div className="w-full bg-[#141f30] border-2 border-[#d4af37] rounded-xl p-6 shadow-2xl flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 border-b border-slate-700 w-full pb-3">
          <span className="text-3xl">{player.avatar}</span>
          <div><span className="font-['Courier_Prime'] text-[9px] text-[#ffd700] uppercase font-bold tracking-widest block">Confidential For Eyes Of:</span><h3 className="font-['Cinzel'] font-bold text-lg text-white">{player.name}</h3></div>
        </div>

        {!isRevealed ? (
          <div className="w-full py-8 px-4 bg-[#0a111a] border border-dashed border-[#d4af37]/60 rounded-lg flex flex-col items-center text-center gap-3">
            <Lock className="text-amber-400" size={32} />
            <span className="font-['Courier_Prime'] text-xs text-amber-200 uppercase tracking-wider font-bold">TOP SECRET • CLASSIFIED DOSSIER</span>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-400 max-w-xs">Ensure the other candidates look away before breaking the seal.</p>
            <button onClick={handleToggleReveal} className="mt-2 px-6 py-2.5 rounded bg-[#1e3450] hover:bg-[#284872] text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider border border-[#d4af37] shadow">Break Seal &amp; Inspect</button>
          </div>
        ) : (
          <div className="w-full p-5 bg-[#fcf8ed] text-slate-900 rounded-lg border-2 border-[#d4af37] flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-stone-300 pb-2"><span className="font-['Courier_Prime'] font-bold text-[10px] text-red-900 uppercase tracking-widest">{directive.codeName}</span><span className="font-['Space_Mono'] font-bold text-xs text-stone-700">+{directive.bonusPoints} PTS IF COMPLETED</span></div>
            <div><h4 className="font-['Cinzel'] font-black text-lg text-stone-900">{directive.title}</h4><p className="font-['Fraunces'] text-sm text-stone-800 mt-1 font-semibold leading-relaxed">“{directive.description}”</p></div>
            <div className="p-2 bg-stone-200/80 rounded border border-stone-300 text-[10px] font-['Courier_Prime'] text-stone-600 italic">Keep this objective secret. The Bureau will evaluate the actual recorded statistics at the end; enthusiasm will not be accepted as evidence.</div>
            <button onClick={handleToggleReveal} className="py-2 mt-1 rounded bg-stone-900 text-stone-100 font-['Courier_Prime'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"><EyeOff size={14} /><span>Conceal Dossier</span></button>
          </div>
        )}

        <button onClick={handleNextPlayer} className="w-full py-3 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
          <span>{currentPlayerIdx + 1 < players.length ? `Hand Device to Candidate ${currentPlayerIdx + 2}` : 'Commence Round 1'}</span><ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
