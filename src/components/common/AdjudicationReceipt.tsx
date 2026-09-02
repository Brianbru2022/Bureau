import React from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  reason: string;
  onUndo: () => void;
}

export const AdjudicationReceipt: React.FC<Props> = ({ reason, onUndo }) => (
  <div role="status" className="mb-4 rounded-lg border-2 border-[#8b704f] bg-[#eee0ba] p-3 text-[#654530]">
    <div className="font-['Courier_Prime'] text-[10px] leading-relaxed"><strong>Registry basis:</strong> {reason}</div>
    <button
      type="button"
      onClick={onUndo}
      className="bureau-button mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#65442c] bg-[#376d9b] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"
    >
      <RotateCcw size={14}/> Undo latest ruling
    </button>
  </div>
);
