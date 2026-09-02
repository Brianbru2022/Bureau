import React from 'react';
import { Player, RoundConfig } from '../../types';
import { BureauInsignia } from './BureauInsignia';
import { BureauAvatar } from './BureauAvatar';
import { Volume2, VolumeX, Briefcase, ShieldAlert, CircleHelp, Maximize2 } from 'lucide-react';
import { sound } from '../../sound/audioEngine';

interface HeaderProps {
  roundConfig?: RoundConfig;
  totalRounds?: number;
  players: Player[];
  currentPlayerIndex: number;
  onOpenAssets?: () => void;
  onTriggerReview?: () => void;
  canReview?: boolean;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ roundConfig, totalRounds = 6, players, currentPlayerIndex, onOpenAssets, onTriggerReview, canReview = false, onOpenHelp }) => {
  const [muted, setMuted] = React.useState(sound.isMuted);
  const currentPlayer = players[currentPlayerIndex];
  const handleToggleMute = () => { const m = sound.toggleMute(); setMuted(m); if (!m) sound.playClick(); };

  return (
    <header className="bureau-global-header w-full flex flex-col gap-3 pb-3 mb-2">
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border-[3px] border-[#7e5c24] bg-[#f5e7c3] px-4 py-2.5 shadow-[0_5px_0_#7b4f32,0_10px_20px_rgba(70,50,34,.14)]">
        <div className="flex items-center gap-3">
          <BureauInsignia size={42} showText />
          {roundConfig && <div className="hidden md:flex flex-col border-l-2 border-[#b7882f]/50 pl-3"><span className="font-['Cinzel'] font-black text-xs text-[#244b55] tracking-wider uppercase">{roundConfig.roomName}</span><span className="font-['Courier_Prime'] text-[10px] text-[#775e47] uppercase font-bold">Round {roundConfig.roundNumber} of {totalRounds} • {roundConfig.name}</span></div>}
        </div>
        <div className="flex items-center gap-2">
          {canReview && onTriggerReview && <button onClick={() => { sound.playStamp(); onTriggerReview(); }} className="bureau-button flex items-center gap-1.5 rounded-xl bg-[#e0a83f] px-3 py-2 text-[#463421] text-xs font-['Courier_Prime'] font-bold uppercase tracking-wide"><ShieldAlert size={14} /> Bureau Review</button>}
          {currentPlayer && onOpenAssets && <button onClick={() => { sound.playClick(); onOpenAssets(); }} className="bureau-button flex items-center gap-1.5 rounded-xl bg-[#376d9b] px-3 py-2 text-[#fff7df] text-xs font-['Cinzel'] font-bold"><Briefcase size={14} /> Assets ({currentPlayer.assets.length})</button>}
          {onOpenHelp && <button onClick={onOpenHelp} aria-label="Open rules and host controls" className="bureau-button rounded-full bg-[#fff7df] p-2 text-[#244b55]" title="Rules and host controls"><CircleHelp size={16}/></button>}
          {window.bureauDesktop && <button onClick={()=>window.bureauDesktop?.toggleFullscreen()} aria-label="Toggle fullscreen" className="bureau-button rounded-full bg-[#fff7df] p-2 text-[#244b55]" title="Toggle fullscreen"><Maximize2 size={16}/></button>}
          <button onClick={handleToggleMute} aria-label={muted ? 'Unmute Bureau Audio' : 'Mute Bureau Audio'} className="bureau-button rounded-full bg-[#fff7df] p-2 text-[#244b55]" title={muted ? 'Unmute Bureau Audio' : 'Mute Bureau Audio'}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
        </div>
      </div>

      {players.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="list" aria-label="Candidate scores">
        {players.map((p, idx) => { const isTurn = idx === currentPlayerIndex; return (
          <div key={p.id} role="listitem" aria-current={isTurn ? 'true' : undefined} aria-label={`${p.name}, ${p.score.toLocaleString()} points, ${p.influence ?? 0} Influence${isTurn ? ', active candidate' : ''}`} className={`relative flex items-center justify-between gap-2 rounded-2xl border-[3px] px-3 py-2 transition-transform ${isTurn ? 'border-[#7e5c24] bg-[#2f8f95] text-[#fff7df] shadow-[0_5px_0_#7b4f32] -translate-y-0.5' : 'border-[#b58e59] bg-[#fff7df]/95 text-[#2f4248] shadow-[0_3px_0_#b18b60]'}`}>
            {isTurn && <div className="absolute -top-2 left-3 rounded-full border border-[#7e5c24] bg-[#e0a83f] px-2 py-0.5 font-['Courier_Prime'] text-xs font-black uppercase text-[#49361e]">Active</div>}
            <div className="flex items-center gap-2 min-w-0"><BureauAvatar player={p} size={34} className={isTurn ? 'border-[#f4d66e]' : ''}/><span className="font-['Cinzel'] text-xs font-black truncate">{p.name}</span></div>
            <div className="text-right shrink-0"><span className={`font-['Space_Mono'] font-black text-base ${isTurn ? 'text-white' : 'text-[#376d9b]'}`}>{p.score.toLocaleString()}</span><span className={`block font-['Courier_Prime'] text-xs uppercase ${isTurn ? 'text-[#d8f2ef]' : 'text-[#876a4d]'}`}>Pts · {p.influence??0} Inf</span></div>
          </div>
        ); })}
      </div>}
    </header>
  );
};
