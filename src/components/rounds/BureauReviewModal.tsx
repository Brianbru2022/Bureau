import React, { useState } from 'react';
import { Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { ShieldAlert, FileText, Zap, HelpCircle, Flame } from 'lucide-react';

interface BureauReviewModalProps {
  trailingPlayer: Player;
  onSelectOption: (optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', bonusScore: number) => void;
  onClose: () => void;
}

export const BureauReviewModal: React.FC<BureauReviewModalProps> = ({
  trailingPlayer,
  onSelectOption,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<'SAFE' | 'RISKY' | 'QUESTIONABLE' | null>(null);

  const handlePick = (type: 'SAFE' | 'RISKY' | 'QUESTIONABLE') => {
    sound.playStamp();
    setSelectedFile(type);
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    let points = 0;
    if (selectedFile === 'SAFE') points = 350;
    if (selectedFile === 'RISKY') points = 700;
    if (selectedFile === 'QUESTIONABLE') points = 900;

    onSelectOption(selectedFile, points);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121c2d] border-2 border-amber-500 w-full max-w-2xl rounded-lg shadow-[0_0_50px_rgba(217,119,6,0.5)] overflow-hidden font-['Plus_Jakarta_Sans'] animate-in fade-in zoom-in-95 duration-200">
        {/* Urgent Bureau Dossier Header */}
        <div className="bg-gradient-to-r from-[#2a1b0a] via-[#3d270e] to-[#2a1b0a] px-6 py-4 border-b border-amber-500/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-['Cinzel'] font-black text-base text-amber-300 tracking-wider uppercase">
                Official Bureau Intervention Protocol
              </h3>
              <p className="font-['Courier_Prime'] text-[11px] text-amber-200/80">
                Special Remedial Relief for Candidate: <strong className="text-white">{trailingPlayer.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Humorous Bureau Notice */}
        <div className="p-6 flex flex-col gap-5">
          <div className="bg-[#0b1320] border-l-4 border-amber-500 p-3.5 rounded-r">
            <p className="font-['Courier_Prime'] text-xs text-amber-100/90 leading-relaxed italic">
              "The Bureau has formally noticed your performance and, contrary to normal civil service policy, has decided that an emergency intervention is now necessary. Select one sealed remedial dossier to attempt a recovery."
            </p>
          </div>

          {/* Three Sealed Files */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SAFE */}
            <button
              onClick={() => handlePick('SAFE')}
              className={`p-4 rounded-lg border-2 text-left flex flex-col justify-between transition-all duration-200 ${
                selectedFile === 'SAFE'
                  ? 'bg-[#183020] border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-[#101928] border-slate-700 hover:border-emerald-500/60'
              }`}
            >
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-900 border border-emerald-500 font-['Courier_Prime'] font-bold text-[9px] text-emerald-300 uppercase tracking-widest block w-fit mb-2">
                  DOSSIER A: SAFE
                </span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-white mb-1">
                  Civil Stipend
                </h4>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-300">
                  Modest guaranteed administrative relief of <strong>+350 pts</strong> with zero risk of penalty.
                </p>
              </div>
            </button>

            {/* RISKY */}
            <button
              onClick={() => handlePick('RISKY')}
              className={`p-4 rounded-lg border-2 text-left flex flex-col justify-between transition-all duration-200 ${
                selectedFile === 'RISKY'
                  ? 'bg-[#33220a] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-[#101928] border-slate-700 hover:border-amber-500/60'
              }`}
            >
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-900 border border-amber-500 font-['Courier_Prime'] font-bold text-[9px] text-amber-300 uppercase tracking-widest block w-fit mb-2">
                  DOSSIER B: RISKY
                </span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-white mb-1">
                  Treasury Grant
                </h4>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-300">
                  Substantial reward of <strong>+700 pts</strong> requiring high-precision compliance.
                </p>
              </div>
            </button>

            {/* QUESTIONABLE */}
            <button
              onClick={() => handlePick('QUESTIONABLE')}
              className={`p-4 rounded-lg border-2 text-left flex flex-col justify-between transition-all duration-200 ${
                selectedFile === 'QUESTIONABLE'
                  ? 'bg-[#331118] border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-[#101928] border-slate-700 hover:border-rose-500/60'
              }`}
            >
              <div>
                <span className="px-2 py-0.5 rounded bg-rose-900 border border-rose-500 font-['Courier_Prime'] font-bold text-[9px] text-rose-300 uppercase tracking-widest block w-fit mb-2">
                  DOSSIER C: QUESTIONABLE
                </span>
                <h4 className="font-['Cinzel'] font-bold text-sm text-white mb-1">
                  Executive Overreach
                </h4>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-300">
                  Savage <strong>+900 pts</strong> windfall or seize from the leader, accompanied by severe bureaucratic scrutiny.
                </p>
              </div>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="text-xs font-['Courier_Prime'] text-slate-400 hover:text-white"
            >
              Decline Bureau Intervention
            </button>

            <button
              disabled={!selectedFile}
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded bg-gradient-to-r from-amber-600 to-yellow-600 hover:brightness-110 disabled:opacity-40 text-black font-['Cinzel'] font-black text-xs uppercase tracking-widest shadow-lg transition-all"
            >
              Open Selected Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
