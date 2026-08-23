import React, { useState } from 'react';
import { Player } from '../../types';
import { DIRECTIVE_ART } from '../../data/visualAssets';
import { BureauAvatar } from '../common/BureauAvatar';
import { sound } from '../../sound/audioEngine';
import { EyeOff, ArrowRight, Lock } from 'lucide-react';

interface SecretDirectivesProps { players: Player[]; onFinishDirectives: () => void; }

export const SecretDirectivesScreen: React.FC<SecretDirectivesProps> = ({ players, onFinishDirectives }) => {
  const [currentPlayerIdx,setCurrentPlayerIdx]=useState(0); const [isRevealed,setIsRevealed]=useState(false); const [artFailed,setArtFailed]=useState(false);
  const player=players[currentPlayerIdx]||players[0]; if(!player)return null; const directive=player.secretDirective; const directiveArt=DIRECTIVE_ART[directive.id];
  const handleToggleReveal=()=>{sound.playStamp();setIsRevealed(v=>!v)};
  const handleNextPlayer=()=>{sound.playClick();setIsRevealed(false);setArtFailed(false);if(currentPlayerIdx+1<players.length)setCurrentPlayerIdx(v=>v+1);else onFinishDirectives();};

  return <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-6 px-4 font-['Plus_Jakarta_Sans']">
    <div className="text-center mb-6 bureau-paper rounded-2xl border-[3px] border-[#765139] px-7 py-4"><span className="font-['Courier_Prime'] text-xs font-black text-[#a9443d] uppercase tracking-widest block mb-1">Confidential Briefing Protocol</span><h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-[#244b55]">Secret Bureau Directives</h2><p className="font-['Fraunces'] text-xs sm:text-sm text-[#6a543f] italic mt-1">Each candidate receives one private objective. {players.length>1?'Two additional commendations have also been selected in secret.':'Solo performance will be judged directly against Bureau standards.'}</p></div>

    <div className="w-full bureau-paper border-[4px] border-[#765139] rounded-[28px] p-6 shadow-2xl flex flex-col items-center gap-5 bureau-paper-drop">
      <div className="flex items-center gap-3 border-b-2 border-[#c7a675] w-full pb-3"><BureauAvatar player={player} size={54}/><div><span className="font-['Courier_Prime'] text-[9px] text-[#a9443d] uppercase font-black tracking-widest block">Confidential for eyes of</span><h3 className="font-['Cinzel'] font-black text-lg text-[#244b55]">{player.name}</h3></div></div>

      {!isRevealed ? <div className="relative w-full min-h-64 overflow-hidden rounded-2xl border-[3px] border-[#765139] bg-[#d9c49c] flex flex-col items-center justify-center text-center gap-3 shadow-inner">
        {!artFailed&&<img src="/assets/generated/classified-envelope.jpg" alt="Classified directive envelope" onError={()=>setArtFailed(true)} className="absolute inset-0 h-full w-full object-cover opacity-90"/>}
        <div className="absolute inset-0 bg-[#3b2d20]/20"/><div className="relative z-10 rounded-2xl border-2 border-[#765139] bg-[#fff7df]/94 px-7 py-5"><Lock className="mx-auto text-[#a9443d]" size={32}/><span className="mt-2 block font-['Courier_Prime'] text-xs text-[#674a35] uppercase tracking-wider font-black">TOP SECRET • CLASSIFIED DOSSIER</span><p className="text-xs text-[#6d5847] mt-2 max-w-sm">Ensure the other candidates look away before breaking the seal.</p><button onClick={handleToggleReveal} className="bureau-button mt-4 px-6 py-2.5 rounded-xl bg-[#d9644f] text-white font-['Cinzel'] font-black text-xs uppercase tracking-wider">Break Seal &amp; Inspect</button></div>
      </div> : <div className="w-full grid grid-cols-1 md:grid-cols-[230px_1fr] gap-4 items-stretch bureau-paper-drop">
        <div className="overflow-hidden rounded-2xl border-[3px] border-[#765139] bg-[#efe0ba]">{directiveArt&&!artFailed?<img src={directiveArt} alt="Directive artwork" onError={()=>setArtFailed(true)} className="h-full w-full object-cover"/>:<div className="h-full min-h-52 flex items-center justify-center font-['Cinzel'] font-black text-[#244b55]">{directive.title}</div>}</div>
        <div className="p-5 bg-[#fcf8ed] text-slate-900 rounded-2xl border-[3px] border-[#765139] flex flex-col gap-3 shadow-inner"><div className="flex items-center justify-between border-b border-stone-300 pb-2"><span className="font-['Courier_Prime'] font-bold text-[10px] text-red-900 uppercase tracking-widest">{directive.codeName}</span><span className="font-['Space_Mono'] font-bold text-xs text-stone-700">+{directive.bonusPoints} PTS IF COMPLETED</span></div><div><h4 className="font-['Cinzel'] font-black text-lg text-stone-900">{directive.title}</h4><p className="font-['Fraunces'] text-sm text-stone-800 mt-1 font-semibold leading-relaxed">“{directive.description}”</p></div><div className="p-2 bg-stone-200/80 rounded border border-stone-300 text-[10px] font-['Courier_Prime'] text-stone-600 italic">Keep this objective secret. The Bureau will evaluate actual recorded statistics at the end.</div><button onClick={handleToggleReveal} className="bureau-button py-2 mt-1 rounded-xl bg-[#244b55] text-stone-100 font-['Courier_Prime'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"><EyeOff size={14}/><span>Conceal Dossier</span></button></div>
      </div>}

      <button onClick={handleNextPlayer} className="bureau-button w-full py-3 rounded-xl bg-[#e0a83f] text-[#49361e] font-['Cinzel'] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><span>{currentPlayerIdx+1<players.length?`Hand Device to Candidate ${currentPlayerIdx+2}`:'Commence Round 1'}</span><ArrowRight size={16}/></button>
    </div>
  </div>;
};
