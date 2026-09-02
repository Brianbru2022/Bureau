import React from 'react';
import { ClipboardCheck, Download } from 'lucide-react';
import type { PlaytestRating } from '../../types';
import { completeActivePlaytestSession, exportPlaytestCsv, exportPlaytestJson, getActivePlaytestSession } from '../../game/playtest';
import { ROUND_LABELS } from '../../game/roundCatalog';

const RATING_VALUES: PlaytestRating[] = [1,2,3,4,5];

export const PlaytestDebrief: React.FC = () => {
  const [session] = React.useState(() => getActivePlaytestSession());
  const [enjoyment, setEnjoyment] = React.useState<PlaytestRating | null>(null);
  const [clarity, setClarity] = React.useState<PlaytestRating | null>(null);
  const [pacing, setPacing] = React.useState<PlaytestRating | null>(null);
  const [wouldPlayAgain, setWouldPlayAgain] = React.useState<boolean | null>(null);
  const [completedUnassisted, setCompletedUnassisted] = React.useState<boolean | null>(null);
  const [favouriteDepartment, setFavouriteDepartment] = React.useState('');
  const [mostConfusingDepartment, setMostConfusingDepartment] = React.useState('');
  const [leastClearMoment, setLeastClearMoment] = React.useState('');
  const [observerNotes, setObserverNotes] = React.useState('');
  const [filed, setFiled] = React.useState(false);

  if (!session || !['ACTIVE','AWAITING_DEBRIEF'].includes(session.status)) return null;
  const ready = enjoyment!==null && clarity!==null && pacing!==null && wouldPlayAgain!==null && completedUnassisted!==null;
  const rating = (label:string, value:PlaytestRating|null, onChange:(ratingValue:PlaytestRating)=>void) => <fieldset><legend className="font-['Cinzel'] text-xs font-black text-[#244b55]">{label}</legend><div className="mt-2 grid grid-cols-5 gap-2">{RATING_VALUES.map(ratingValue=><button key={ratingValue} type="button" aria-label={`${label}: ${ratingValue} out of 5`} aria-pressed={value===ratingValue} onClick={()=>onChange(ratingValue)} className={`bureau-button min-h-11 rounded-lg border-2 border-[#765139] font-['Space_Mono'] text-sm font-black ${value===ratingValue?'bg-[#2f8f95] text-white':'bg-[#fff7df] text-[#244b55]'}`}>{ratingValue}</button>)}</div></fieldset>;

  if (filed) return <section role="status" className="bureau-paper w-full max-w-5xl rounded-2xl border-[3px] border-[#4f7457] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="font-['Cinzel'] text-[#31533b]">Consented beta debrief filed</strong><p className="mt-1 font-['Fraunces'] text-sm text-[#53645f]">Session {session.groupCode} is complete. The exports omit candidate names, recovery data and free-text notes.</p></div><div className="flex gap-2"><button type="button" onClick={exportPlaytestJson} className="bureau-button rounded-lg bg-[#376d9b] px-4 py-3 text-[10px] font-black uppercase text-white"><Download size={14} className="mr-1 inline"/>Beta JSON</button><button type="button" onClick={exportPlaytestCsv} className="bureau-button rounded-lg bg-[#2f8f95] px-4 py-3 text-[10px] font-black uppercase text-white"><Download size={14} className="mr-1 inline"/>Beta CSV</button></div></div></section>;

  return <section aria-labelledby="playtest-debrief-title" className="bureau-paper w-full max-w-5xl rounded-2xl border-[3px] border-[#765139] p-5">
    <div className="flex items-start gap-3"><ClipboardCheck className="shrink-0 text-[#a9443d]"/><div><span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#a9443d]">Independent group {session.groupCode}</span><h2 id="playtest-debrief-title" className="font-['Cinzel'] text-lg font-black text-[#244b55]">File the blind play-test debrief</h2><p className="mt-1 font-['Fraunces'] text-sm text-[#665348]">Ask the candidates these questions after the final result. Do not reinterpret their answers.</p></div></div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {rating('Enjoyment',enjoyment,setEnjoyment)}
      {rating('Control clarity',clarity,setClarity)}
      {rating('Pacing',pacing,setPacing)}
      <fieldset><legend className="font-['Cinzel'] text-xs font-black text-[#244b55]">Would this group play again?</legend><div className="mt-2 grid grid-cols-2 gap-2">{[true,false].map(value=><button key={String(value)} type="button" aria-pressed={wouldPlayAgain===value} onClick={()=>setWouldPlayAgain(value)} className={`bureau-button min-h-11 rounded-lg border-2 border-[#765139] text-xs font-black uppercase ${wouldPlayAgain===value?'bg-[#2f8f95] text-white':'bg-[#fff7df] text-[#244b55]'}`}>{value?'Yes':'No'}</button>)}</div></fieldset>
      <fieldset><legend className="font-['Cinzel'] text-xs font-black text-[#244b55]">Completed without observer explanation or operation?</legend><div className="mt-2 grid grid-cols-2 gap-2">{[true,false].map(value=><button key={String(value)} type="button" aria-pressed={completedUnassisted===value} onClick={()=>setCompletedUnassisted(value)} className={`bureau-button min-h-11 rounded-lg border-2 border-[#765139] text-xs font-black uppercase ${completedUnassisted===value?'bg-[#2f8f95] text-white':'bg-[#fff7df] text-[#244b55]'}`}>{value?'Yes':'No'}</button>)}</div></fieldset>
      <label className="font-['Cinzel'] text-xs font-black text-[#244b55]">Favourite department<select value={favouriteDepartment} onChange={event=>setFavouriteDepartment(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 font-['Plus_Jakarta_Sans'] text-sm font-normal"><option value="">No preference recorded</option>{session.roundTypes.map(roundType=><option key={roundType} value={roundType}>{ROUND_LABELS[roundType]}</option>)}</select></label>
      <label className="font-['Cinzel'] text-xs font-black text-[#244b55]">Least clear department<select value={mostConfusingDepartment} onChange={event=>setMostConfusingDepartment(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 font-['Plus_Jakarta_Sans'] text-sm font-normal"><option value="">No department selected</option>{session.roundTypes.map(roundType=><option key={roundType} value={roundType}>{ROUND_LABELS[roundType]}</option>)}</select></label>
      <label className="font-['Cinzel'] text-xs font-black text-[#244b55]">Least clear moment<input value={leastClearMoment} maxLength={240} onChange={event=>setLeastClearMoment(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] px-3 font-['Plus_Jakarta_Sans'] text-sm font-normal" placeholder="Use the candidates’ own words"/></label>
      <label className="sm:col-span-2 font-['Cinzel'] text-xs font-black text-[#244b55]">Observer notes<textarea value={observerNotes} maxLength={800} onChange={event=>setObserverNotes(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border-2 border-[#765139] bg-[#fff7df] p-3 font-['Plus_Jakarta_Sans'] text-sm font-normal" placeholder="Hesitation, laughter, repeated rules questions or other evidence"/></label>
    </div>
    <button type="button" disabled={!ready} onClick={()=>{if(!ready)return;completeActivePlaytestSession({enjoymentRating:enjoyment,clarityRating:clarity,pacingRating:pacing,wouldPlayAgain,completedUnassisted,favouriteDepartment:favouriteDepartment||undefined,mostConfusingDepartment:mostConfusingDepartment||undefined,leastClearMoment:leastClearMoment.trim()||undefined,observerNotes:observerNotes.trim()||undefined});setFiled(true);}} className="bureau-button mt-4 w-full rounded-xl bg-[#4f7457] px-5 py-3 font-['Cinzel'] text-xs font-black uppercase text-white disabled:opacity-40">Certify and file session</button>
  </section>;
};
