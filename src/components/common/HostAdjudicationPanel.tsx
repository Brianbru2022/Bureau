import React, { useId, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';

interface Props {
  submittedAnswer: string;
  suggestions: string[];
  onAccept: (answer: string, edited: boolean) => void;
  onReject: () => void;
}

export const HostAdjudicationPanel: React.FC<Props> = ({ submittedAnswer, suggestions, onAccept, onReject }) => {
  const [edited, setEdited] = useState(submittedAnswer);
  const suggestionId = `bureau-answer-suggestions-${useId().replaceAll(':', '')}`;

  return (
    <div role="group" aria-label="Host answer adjudication" className="rounded-xl border-[3px] border-[#a9443d] bg-[#fff1c2] p-3 shadow-[0_4px_0_#65442c]">
      <strong className="font-['Cinzel'] text-sm text-[#244b55]">Registry needs a ruling</strong>
      <p className="mt-1 font-['Courier_Prime'] text-[10px] text-[#654a34]">No canonical answer or filed variant matched “{submittedAnswer}”. The host decides before any penalty.</p>
      <label htmlFor={`${suggestionId}-input`} className="mt-3 block font-['Courier_Prime'] text-xs font-black uppercase text-[#6a4a35]">Edit or select the intended answer</label>
      <input id={`${suggestionId}-input`} autoFocus value={edited} onChange={event => setEdited(event.target.value)} list={suggestionId} className="mt-1 min-h-11 w-full rounded-lg border-2 border-[#65442c] bg-[#fffaf0] px-3 py-2 text-[#30434a]" />
      <datalist id={suggestionId}>{suggestions.map(answer => <option key={answer} value={answer} />)}</datalist>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => onAccept(submittedAnswer, false)} className="min-h-11 rounded-lg bg-[#3e9c72] px-2 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"><Check size={13} className="mr-1 inline" />Accept</button>
        <button type="button" onClick={() => onAccept(edited, true)} disabled={!edited.trim()} className="min-h-11 rounded-lg bg-[#376d9b] px-2 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white disabled:opacity-40"><Pencil size={13} className="mr-1 inline" />Edit &amp; accept</button>
        <button type="button" onClick={onReject} className="min-h-11 rounded-lg bg-[#d9644f] px-2 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"><X size={13} className="mr-1 inline" />Reject</button>
      </div>
    </div>
  );
};
