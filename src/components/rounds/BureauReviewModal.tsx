import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ShieldAlert } from 'lucide-react';

interface BureauReviewModalProps {
  trailingPlayer: Player;
  onSelectOption: (optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', scoreDelta: number) => void;
  onClose: () => void;
}

type ReviewType = 'SAFE' | 'RISKY' | 'QUESTIONABLE';

export const BureauReviewModal: React.FC<BureauReviewModalProps> = ({
  trailingPlayer,
  onSelectOption,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<ReviewType | null>(null);
  const [resolvedDelta, setResolvedDelta] = useState<number | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  const handlePick = (type: ReviewType) => {
    sound.playStamp();
    setSelectedFile(type);

    if (type === 'SAFE') {
      setResolvedDelta(180);
      setOutcomeText('Guaranteed relief: +180 points. Dull, dependable and almost aggressively sensible.');
      return;
    }

    const roll = Math.random();
    if (type === 'RISKY') {
      const success = roll < 0.58;
      setResolvedDelta(success ? 520 : 0);
      setOutcomeText(success
        ? 'The Treasury has inexplicably approved the claim: +520 points.'
        : 'Application rejected. +0 points. The risk assessment was, in retrospect, quite clear.');
      return;
    }

    const success = roll < 0.38;
    setResolvedDelta(success ? 650 : -140);
    setOutcomeText(success
      ? 'Executive overreach has succeeded. 650 points will be seized from the current leader if available.'
      : 'Executive overreach has failed. A 140-point administrative penalty has been attached for wasting everyone’s time.');
  };

  const handleConfirm = () => {
    if (!selectedFile || resolvedDelta === null) return;
    onSelectOption(selectedFile, resolvedDelta);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121c2d] border-2 border-amber-500 w-full max-w-2xl rounded-lg shadow-[0_0_50px_rgba(217,119,6,0.5)] overflow-hidden font-['Plus_Jakarta_Sans']">
        <div className="bg-gradient-to-r from-[#2a1b0a] via-[#3d270e] to-[#2a1b0a] px-6 py-4 border-b border-amber-500/60 flex items-center gap-3">
          <ShieldAlert size={24} className="text-amber-400" />
          <div>
            <h3 className="font-['Cinzel'] font-black text-base text-amber-300 tracking-wider uppercase">Bureau Review</h3>
            <p className="font-['Courier_Prime'] text-[11px] text-amber-200/80">Emergency intervention for <strong className="text-white">{trailingPlayer.name}</strong></p>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="bg-[#0b1320] border-l-4 border-amber-500 p-3.5 rounded-r">
            <p className="font-['Courier_Prime'] text-xs text-amber-100/90 leading-relaxed italic">
              “The Bureau has reviewed your position and concluded that natural recovery is becoming statistically optimistic. One intervention is authorised. Choose poorly and you may somehow make this worse.”
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button disabled={resolvedDelta !== null} onClick={() => handlePick('SAFE')} className={`p-4 rounded-lg border-2 text-left ${selectedFile === 'SAFE' ? 'bg-[#183020] border-emerald-400' : 'bg-[#101928] border-slate-700'}`}>
              <span className="text-[9px] font-['Courier_Prime'] font-bold text-emerald-300 uppercase">SAFE</span>
              <h4 className="font-['Cinzel'] font-bold text-sm text-white my-1">Civil Stipend</h4>
              <p className="text-xs text-slate-300">Guaranteed +180. No drama. No dignity either.</p>
            </button>
            <button disabled={resolvedDelta !== null} onClick={() => handlePick('RISKY')} className={`p-4 rounded-lg border-2 text-left ${selectedFile === 'RISKY' ? 'bg-[#33220a] border-amber-400' : 'bg-[#101928] border-slate-700'}`}>
              <span className="text-[9px] font-['Courier_Prime'] font-bold text-amber-300 uppercase">RISKY</span>
              <h4 className="font-['Cinzel'] font-bold text-sm text-white my-1">Treasury Appeal</h4>
              <p className="text-xs text-slate-300">58% chance of +520. Otherwise precisely nothing.</p>
            </button>
            <button disabled={resolvedDelta !== null} onClick={() => handlePick('QUESTIONABLE')} className={`p-4 rounded-lg border-2 text-left ${selectedFile === 'QUESTIONABLE' ? 'bg-[#331118] border-rose-400' : 'bg-[#101928] border-slate-700'}`}>
              <span className="text-[9px] font-['Courier_Prime'] font-bold text-rose-300 uppercase">DEEPLY QUESTIONABLE</span>
              <h4 className="font-['Cinzel'] font-bold text-sm text-white my-1">Executive Overreach</h4>
              <p className="text-xs text-slate-300">38% chance to seize 650 from the leader. Failure costs 140.</p>
            </button>
          </div>

          {resolvedDelta !== null && (
            <div className="rounded-lg border border-[#d4af37]/50 bg-[#0b1320] p-4 text-center font-['Courier_Prime'] text-sm text-[#f5deb3]">
              {outcomeText}
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <button onClick={onClose} className="text-xs font-['Courier_Prime'] text-slate-400 hover:text-white">Decline intervention</button>
            <button disabled={resolvedDelta === null || !selectedFile} onClick={handleConfirm} className="px-6 py-2.5 rounded bg-gradient-to-r from-amber-600 to-yellow-600 disabled:opacity-40 text-black font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-lg">
              File Outcome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
