import React, { useEffect } from 'react';
import { RoundConfig } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ArrowRight, Compass, Layers, Gavel, ListFilter, Calculator, ArrowUpDown, Image as ImageIcon, Gauge } from 'lucide-react';

interface RoomTransitionProps {
  roundConfig: RoundConfig;
  totalRounds: number;
  onEnterRoom: () => void;
}

const roomVisual = (type: string) => {
  switch (type) {
    case 'WHERE_IN_BRITAIN': return { icon: <Compass size={46} />, bg: '#2f8f95', prop: 'MAP TABLE' };
    case 'TOP_10': return { icon: <Layers size={46} />, bg: '#376d9b', prop: 'RECORD BOARD' };
    case 'PUT_UP_OR_SHUT_UP': return { icon: <Gavel size={46} />, bg: '#d9644f', prop: 'BIDDING DESK' };
    case 'THE_LIST': return { icon: <ListFilter size={46} />, bg: '#e0a83f', prop: 'ESCALATION VAULT' };
    case 'CLOSEST_WINS': return { icon: <Calculator size={46} />, bg: '#4f7457', prop: 'METRIC ENGINE' };
    case 'RANK_IT': return { icon: <ArrowUpDown size={46} />, bg: '#376d9b', prop: 'SEQUENCE RAIL' };
    case 'IMAGE_REVEAL': return { icon: <ImageIcon size={46} />, bg: '#755f99', prop: 'OPTICAL FRAME' };
    case 'STOP_THE_SCORE': return { icon: <Gauge size={46} />, bg: '#a9443d', prop: 'VOLATILITY GAUGE' };
    default: return { icon: <Layers size={46} />, bg: '#2f8f95', prop: 'ASSESSMENT DEVICE' };
  }
};

export const RoomTransition: React.FC<RoomTransitionProps> = ({ roundConfig, totalRounds, onEnterRoom }) => {
  useEffect(() => { sound.playPneumatic(); }, []);
  const visual = roomVisual(roundConfig.type);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto py-5 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-3xl bureau-paper rounded-[30px] border-[4px] border-[#7e5c24] px-6 sm:px-10 pt-10 pb-8 overflow-visible">
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 h-16 min-w-16 rounded-2xl border-[4px] border-[#7e5c24] flex items-center justify-center text-[#fff7df] bureau-enamel px-4" style={{ backgroundColor: visual.bg }}>
          {visual.icon}
        </div>

        <span className="inline-block rounded-full border-2 border-[#7e5c24]/50 bg-[#e0a83f] px-4 py-1 font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[0.18em] text-[#513a22] mb-4">
          Dispatch {roundConfig.roundNumber} of {totalRounds}
        </span>

        <h1 className="font-['Cinzel'] font-black text-3xl sm:text-5xl text-[#244b55] uppercase tracking-wide leading-tight">{roundConfig.roomName}</h1>
        <h3 className="font-['Courier_Prime'] text-xs sm:text-sm font-black text-[#a9443d] tracking-[0.14em] uppercase mt-2">{roundConfig.name}</h3>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="h-1 rounded bg-[#b7882f]/40" />
          <div className="rounded-xl border-2 border-[#7e5c24]/50 bg-[#f0d790] px-4 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase tracking-wider text-[#725139] shadow-[0_3px_0_#b68a52]">{visual.prop}</div>
          <div className="h-1 rounded bg-[#b7882f]/40" />
        </div>

        <p className="font-['Fraunces'] text-base sm:text-lg text-[#6d533f] max-w-xl mx-auto italic leading-relaxed">“{roundConfig.roomTheme}”</p>

        <button onClick={() => { sound.playStamp(); onEnterRoom(); }} className="bureau-button mt-7 px-9 py-4 rounded-2xl bg-[#d9644f] text-[#fff7df] font-['Cinzel'] font-black text-sm uppercase tracking-widest inline-flex items-center gap-3 cursor-pointer">
          Enter Department <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
