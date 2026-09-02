import React, { useEffect, useRef } from 'react';
import { BookOpen, LogOut, Pause, Play, RotateCcw, SkipForward, X } from 'lucide-react';
import type { GamePhase, RoundType } from '../../types';
import { guidanceFor } from '../../game/roundGuidance';
import { sound } from '../../sound/audioEngine';
import { PlaytestRecorderPanel } from './PlaytestRecorderPanel';

interface HostControlsModalProps {
  isOpen: boolean;
  canExit: boolean;
  onClose: () => void;
  onExit: () => void;
  canControlRound?: boolean;
  timerPaused?: boolean;
  onTimerPausedChange?: (paused:boolean)=>void;
  onSkip?:()=>void;
  onRestart?:()=>void;
  roundType?:RoundType;
  phase:GamePhase;
  playerCount:number;
  challengeId?:string;
}

export const HostControlsModal: React.FC<HostControlsModalProps> = ({ isOpen, canExit, onClose, onExit, canControlRound=false, timerPaused=false, onTimerPausedChange, onSkip, onRestart, roundType, phase, playerCount, challengeId }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [audioSettings,setAudioSettings]=React.useState(()=>sound.getSettings());

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const findFocusable = () => panel?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    findFocusable()?.[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      const focusable=findFocusable();
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocusRef.current?.focus(); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#183138]/80 p-4 backdrop-blur-md" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="host-controls-title" className="bureau-paper bureau-scrollbar max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[26px] border-[4px] border-[#765139] p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><span className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-widest text-[#a9443d]">Host dossier</span><h2 id="host-controls-title" className="font-['Cinzel'] text-2xl font-black text-[#244b55]">How to Run the Bureau</h2></div><button onClick={onClose} aria-label="Close host help" className="bureau-button rounded-full bg-[#fff7df] p-2 text-[#244b55]"><X size={18}/></button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[['Shared screen', 'When the Confidential Handover curtain appears, pass the device to the named candidate. They confirm their name before private controls are revealed.'],['Turns and answers', 'The highlighted candidate acts. Type spoken answers exactly enough for the registry to recognise them.'],['Assets', 'Assets are single-use interventions. Shared and sealed-answer rounds restrict individual assets to prevent unfair play.'],['Scoring', 'Each department awards up to 1,000 points. Directives, commendations and mini-games can alter the final standings.']].map(([title, text]) => <section key={title} className="rounded-xl border-2 border-[#b48f61] bg-[#fff7df] p-3"><strong className="font-['Cinzel'] text-sm text-[#244b55]"><BookOpen size={14} className="mr-1 inline"/>{title}</strong><p className="mt-1 font-['Fraunces'] text-sm text-[#5e4d3f]">{text}</p></section>)}
      </div>
      {roundType && <section className="mt-4 rounded-xl border-2 border-[#2f8f95] bg-[#d8efdf] p-4"><strong className="font-['Cinzel'] text-sm text-[#244b55]">Current department</strong><p className="mt-1 font-['Fraunces'] text-sm text-[#4d5549]">{guidanceFor(roundType).participation}. {guidanceFor(roundType).scoring}.</p><p className="mt-2 font-['Courier_Prime'] text-[10px] font-bold text-[#1d6970]">HOST CUE: {guidanceFor(roundType).hostCue}</p></section>}
      {canControlRound && <section className="mt-5 rounded-xl border-2 border-[#765139] bg-[#eee0ba] p-4"><strong className="font-['Cinzel'] text-sm text-[#244b55]">Active-round controls</strong><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"><button onClick={()=>onTimerPausedChange?.(!timerPaused)} className="bureau-button rounded-xl bg-[#376d9b] px-3 py-3 text-xs font-black uppercase text-white">{timerPaused?<Play size={15} className="mr-1 inline"/>:<Pause size={15} className="mr-1 inline"/>}{timerPaused?'Resume timer':'Pause timer'}</button><button onClick={onRestart} className="bureau-button rounded-xl bg-[#e0a83f] px-3 py-3 text-xs font-black uppercase text-[#49361e]"><RotateCcw size={15} className="mr-1 inline"/>Restart attempt</button><button onClick={onSkip} className="bureau-button rounded-xl bg-[#d9644f] px-3 py-3 text-xs font-black uppercase text-white"><SkipForward size={15} className="mr-1 inline"/>Skip for zero</button></div></section>}
      <PlaytestRecorderPanel phase={phase} playerCount={playerCount} roundType={roundType} challengeId={challengeId}/>
      <section className="mt-4 rounded-xl border-2 border-[#765139] bg-[#fff7df] p-4"><strong className="font-['Cinzel'] text-sm text-[#244b55]">Audio levels</strong><label className="mt-3 grid grid-cols-[90px_1fr_38px] items-center gap-2 font-['Courier_Prime'] text-[10px] font-bold"><span>Master</span><input aria-label="Master volume" type="range" min="0" max="100" value={Math.round(audioSettings.masterVolume*100)} onChange={event=>{const value=Number(event.target.value)/100;sound.setMasterVolume(value);setAudioSettings(sound.getSettings());}}/><span>{Math.round(audioSettings.masterVolume*100)}%</span></label><label className="mt-2 grid grid-cols-[90px_1fr_38px] items-center gap-2 font-['Courier_Prime'] text-[10px] font-bold"><span>Effects</span><input aria-label="Effects volume" type="range" min="0" max="100" value={Math.round(audioSettings.effectsVolume*100)} onChange={event=>{const value=Number(event.target.value)/100;sound.setEffectsVolume(value);setAudioSettings(sound.getSettings());}}/><span>{Math.round(audioSettings.effectsVolume*100)}%</span></label></section>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="font-['Courier_Prime'] text-[10px] text-[#6a543f]">Progress is filed automatically after every material change.</p>{canExit && <button onClick={() => { if (window.confirm('End this assessment and discard its saved progress?')) onExit(); }} className="bureau-button rounded-xl bg-[#a9443d] px-4 py-2 text-xs font-black uppercase text-white"><LogOut size={15} className="mr-1 inline"/>End game</button>}</div>
    </div>
  </div>;
};
