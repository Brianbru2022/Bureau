import React, { useEffect } from 'react';
import { RoundConfig } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ArrowRight, Compass, Layers, Gavel, ListFilter, Calculator, ArrowUpDown, Image as ImageIcon, Gauge } from 'lucide-react';
import { guidanceFor } from '../../game/roundGuidance';
import { ControlDemonstration } from '../common/ControlDemonstration';

interface RoomTransitionProps {
  roundConfig: RoundConfig;
  totalRounds: number;
  guided?: boolean;
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

export const RoomTransition: React.FC<RoomTransitionProps> = ({ roundConfig, totalRounds, guided = true, onEnterRoom }) => {
  useEffect(() => { sound.playPneumatic(); }, []);
  const visual = roomVisual(roundConfig.type);
  const preview = guidanceFor(roundConfig.type);
  const [demonstrationReady, setDemonstrationReady] = React.useState(!guided);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto py-5 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-3xl bureau-paper rounded-[30px] border-[4px] border-[#7e5c24] px-6 sm:px-10 pt-10 pb-8 overflow-visible">
        <img src="/assets/generated-v2/dispatch-board.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full rounded-[26px] object-cover opacity-[0.24] mix-blend-multiply"/>
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
        <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-3">{(['participation','scoring','duration'] as const).map(label=><div key={label} className="rounded-xl border-2 border-[#b48f61] bg-[#fff7df]/90 p-3"><strong className="block font-['Courier_Prime'] text-xs uppercase tracking-widest text-[#a9443d]">{label}</strong><span className="font-['Fraunces'] text-sm text-[#5e4d3f]">{preview[label]}</span></div>)}</div>
        {guided && <><ControlDemonstration roundType={roundConfig.type} onReadyChange={setDemonstrationReady}/><details className="mx-auto mt-2 max-w-2xl rounded-xl border-2 border-[#b7882f] bg-[#fff0bf] p-3 text-left"><summary className="cursor-pointer font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#8b4c32]">Example and host cue</summary><div className="mt-2 grid gap-2 sm:grid-cols-2"><p className="font-['Fraunces'] text-sm text-[#5e4d3f]"><strong>Example:</strong> {preview.example}</p><p className="font-['Fraunces'] text-sm text-[#5e4d3f]"><strong>Host:</strong> {preview.hostCue}</p></div></details></>}

        <button disabled={!demonstrationReady} aria-describedby={!demonstrationReady?'complete-control-demo':undefined} onClick={() => { sound.playStamp(); onEnterRoom(); }} className="bureau-button mt-5 px-9 py-4 rounded-2xl bg-[#d9644f] text-[#fff7df] font-['Cinzel'] font-black text-sm uppercase tracking-widest inline-flex items-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-45">
          Enter Department <ArrowRight size={18} />
        </button>
        {!demonstrationReady && <p id="complete-control-demo" className="mt-2 font-['Courier_Prime'] text-xs font-bold uppercase text-[#7a3934]">Complete this one-time control demonstration to enter.</p>}
      </div>
    </div>
  );
};
