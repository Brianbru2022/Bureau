import React, { useEffect } from 'react';
import { RoundConfig } from '../../types';
import { sound } from '../../sound/audioEngine';
import { BureauInsignia } from '../common/BureauInsignia';
import { ArrowRight, Compass, Layers, Gavel, ListFilter, Calculator, ArrowUpDown, Image as ImageIcon, Gauge } from 'lucide-react';

interface RoomTransitionProps {
  roundConfig: RoundConfig;
  totalRounds: number;
  onEnterRoom: () => void;
}

export const RoomTransition: React.FC<RoomTransitionProps> = ({
  roundConfig,
  totalRounds,
  onEnterRoom
}) => {
  useEffect(() => {
    sound.playPneumatic();
  }, []);

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'WHERE_IN_BRITAIN': return <Compass size={36} className="text-[#4fd1c5]" />;
      case 'TOP_10': return <Layers size={36} className="text-[#f6ad55]" />;
      case 'PUT_UP_OR_SHUT_UP': return <Gavel size={36} className="text-[#feb2b2]" />;
      case 'THE_LIST': return <ListFilter size={36} className="text-[#ffd700]" />;
      case 'CLOSEST_WINS': return <Calculator size={36} className="text-[#9ae6b4]" />;
      case 'RANK_IT': return <ArrowUpDown size={36} className="text-[#63b3ed]" />;
      case 'IMAGE_REVEAL': return <ImageIcon size={36} className="text-[#d6bcfa]" />;
      case 'STOP_THE_SCORE': return <Gauge size={36} className="text-[#f687b3]" />;
      default: return <BureauInsignia size={36} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto py-8 px-4 text-center font-['Plus_Jakarta_Sans'] animate-in fade-in zoom-in-95 duration-300">
      {/* Pneumatic Tube Visual Tube Ring */}
      <div className="w-20 h-20 rounded-full bg-[#18283f] border-4 border-[#d4af37] flex items-center justify-center mb-5 shadow-[0_0_35px_rgba(212,175,55,0.4)]">
        {getRoomIcon(roundConfig.type)}
      </div>

      {/* Round Marker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b263b] border border-[#d4af37]/40 mb-2">
        <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] uppercase tracking-widest">
          Dispatch Order: Round {roundConfig.roundNumber} of {totalRounds}
        </span>
      </div>

      {/* Room Name */}
      <h1 className="font-['Cinzel'] font-black text-3xl sm:text-4xl text-white uppercase tracking-wider mb-2 drop-shadow">
        {roundConfig.roomName}
      </h1>

      <h3 className="font-['Courier_Prime'] text-sm sm:text-base font-bold text-amber-300 tracking-wide uppercase mb-4">
        {roundConfig.name}
      </h3>

      <p className="font-['Fraunces'] text-sm sm:text-base text-slate-300 max-w-md italic mb-8 leading-relaxed">
        "{roundConfig.roomTheme}"
      </p>

      {/* Enter Room Button */}
      <button
        onClick={() => {
          sound.playStamp();
          onEnterRoom();
        }}
        className="px-10 py-4 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 border-2 border-amber-300 transform active:scale-95 transition-all cursor-pointer"
      >
        <span>Enter Department &amp; Commence</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
