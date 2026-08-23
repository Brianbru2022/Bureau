import React from 'react';
import { Player, RoundConfig } from '../../types';
import { BureauInsignia } from './BureauInsignia';
import { Volume2, VolumeX, Briefcase, Award, ShieldAlert } from 'lucide-react';
import { sound } from '../../sound/audioEngine';

interface HeaderProps {
  roundConfig?: RoundConfig;
  totalRounds?: number;
  players: Player[];
  currentPlayerIndex: number;
  onOpenAssets?: () => void;
  onTriggerReview?: () => void;
  canReview?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  roundConfig,
  totalRounds = 6,
  players,
  currentPlayerIndex,
  onOpenAssets,
  onTriggerReview,
  canReview = false
}) => {
  const [muted, setMuted] = React.useState(sound.isMuted);

  const handleToggleMute = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) sound.playClick();
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <header className="w-full flex flex-col gap-2 pb-3 mb-2 border-b border-[#d4af37]/30">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Bureau Insignia & Room Plaque */}
        <div className="flex items-center gap-3">
          <BureauInsignia size={38} showText={true} />
          {roundConfig && (
            <div className="hidden sm:flex flex-col border-l border-[#d4af37]/40 pl-3">
              <span className="font-['Cinzel'] font-bold text-xs text-[#e6c875] tracking-wider uppercase">
                {roundConfig.roomName}
              </span>
              <span className="font-['Courier_Prime'] text-[10px] text-slate-400 uppercase">
                Round {roundConfig.roundNumber} of {totalRounds} • {roundConfig.name}
              </span>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Bureau Review Comeback Trigger button if underdog flag active */}
          {canReview && onTriggerReview && (
            <button
              onClick={() => {
                sound.playStamp();
                onTriggerReview();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900 text-xs font-['Courier_Prime'] font-bold tracking-wide animate-pulse"
              title="Underdog intervention available"
            >
              <ShieldAlert size={14} className="text-amber-400" />
              <span>BUREAU REVIEW</span>
            </button>
          )}

          {/* Player Assets Bag / Clearance */}
          {currentPlayer && onOpenAssets && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAssets();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] border border-[#d4af37]/50 text-[#e6c875] text-xs font-['Cinzel'] font-semibold tracking-wider transition-all"
            >
              <Briefcase size={14} />
              <span>Assets ({currentPlayer.assets.length})</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-full bg-[#1b263b]/80 border border-[#d4af37]/30 text-[#e6c875] hover:bg-[#27354f] transition-all"
            title={muted ? 'Unmute Bureau Audio' : 'Mute Bureau Audio'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Player Score Banners Row (High Visibility on Shared Device) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {players.map((p, idx) => {
          const isTurn = idx === currentPlayerIndex;
          return (
            <div
              key={p.id}
              className={`relative flex items-center justify-between px-3 py-1.5 rounded-md border transition-all duration-300 ${
                isTurn
                  ? 'bg-gradient-to-r from-[#1c2e4a] to-[#243b55] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-[1.02]'
                  : 'bg-[#101827]/80 border-slate-700/60 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Active Marker Indicator */}
              {isTurn && (
                <div className="absolute -top-1.5 left-2 px-1.5 py-0.2 bg-[#d4af37] text-[#0a101d] font-['Courier_Prime'] font-bold text-[8px] tracking-widest rounded uppercase">
                  ACTIVE CANDIDATE
                </div>
              )}

              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg shrink-0">{p.avatar}</span>
                <div className="flex flex-col min-w-0">
                  <span className={`font-['Cinzel'] text-xs font-bold truncate ${isTurn ? 'text-[#f5deb3]' : 'text-slate-200'}`}>
                    {p.name}
                  </span>
                  <span className="text-[9px] font-['Courier_Prime'] text-slate-400 truncate">
                    {p.department.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Exact Continuous Score Display */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className={`font-['Space_Mono'] font-bold text-sm tracking-tight ${isTurn ? 'text-[#ffd700]' : 'text-slate-100'}`}>
                  {p.score.toLocaleString()}
                </span>
                <span className="text-[8px] font-['Courier_Prime'] text-slate-400 uppercase">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
