import React from 'react';
import { Check, ChevronRight, RotateCcw } from 'lucide-react';
import type { RoundType } from '../../types';
import { CONTROL_DEMONSTRATIONS } from '../../game/controlDemonstrations';

const STORAGE_KEY = 'bureau.control-demonstrations.v1';

const loadSeen = (): RoundType[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const rememberSeen = (roundType: RoundType) => {
  const seen = new Set(loadSeen());
  seen.add(roundType);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
};

interface ControlDemonstrationProps {
  roundType: RoundType;
  onReadyChange: (ready: boolean) => void;
}

export const ControlDemonstration: React.FC<ControlDemonstrationProps> = ({ roundType, onReadyChange }) => {
  const demonstration = CONTROL_DEMONSTRATIONS[roundType];
  const [step, setStep] = React.useState(() => loadSeen().includes(roundType) ? demonstration.steps.length : 0);
  const complete = step >= demonstration.steps.length;

  React.useEffect(() => {
    onReadyChange(complete);
  }, [complete, onReadyChange]);

  const advance = () => {
    const next = Math.min(demonstration.steps.length, step + 1);
    setStep(next);
    if (next === demonstration.steps.length) rememberSeen(roundType);
  };

  const replay = () => setStep(0);

  return <section className="mx-auto mt-3 max-w-2xl rounded-xl border-2 border-[#2f8f95] bg-[#d8efdf] p-3 text-left" aria-labelledby="control-demonstration-title">
    <div className="flex items-start justify-between gap-3">
      <div><strong id="control-demonstration-title" className="block font-['Courier_Prime'] text-xs uppercase tracking-widest text-[#1d6970]">{complete ? 'Control reminder' : 'First-use control demonstration'}</strong><span className="font-['Cinzel'] text-xs font-black text-[#244b55]">{demonstration.action}</span></div>
      {complete && <button type="button" onClick={replay} className="rounded-lg border-2 border-[#587b69] bg-[#fff7df] px-2 py-1 font-['Courier_Prime'] text-xs font-black uppercase text-[#244b55]"><RotateCcw size={11} className="mr-1 inline"/>Replay</button>}
    </div>
    <ol className="mt-3 grid grid-cols-3 gap-2">
      {demonstration.steps.map((label,index)=>{
        const reached=index<step;
        const active=index===step;
        return <li key={label} aria-current={active?'step':undefined} className={`min-h-[62px] rounded-lg border-2 p-2 ${reached?'border-[#4f7457] bg-[#eef1d9]':active?'border-[#d08a2e] bg-[#fff0bf]':'border-[#9fb6a5] bg-[#f4f1df] opacity-65'}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#244b55] font-['Space_Mono'] text-xs font-black text-white">{reached?<Check size={12}/>:index+1}</span>
          <span className="mt-1 block font-['Fraunces'] text-xs leading-tight text-[#4d5549]">{label}</span>
        </li>;
      })}
    </ol>
    {!complete && <button type="button" onClick={advance} className="bureau-button mt-3 w-full rounded-lg bg-[#376d9b] px-4 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white">{step===demonstration.steps.length-1?'Control understood':'Show next step'} <ChevronRight size={13} className="ml-1 inline"/></button>}
  </section>;
};

