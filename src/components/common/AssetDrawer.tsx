import React, { useState } from 'react';
import { Player, BureauAssetKey } from '../../types';
import { BUREAU_ASSET_DEFINITIONS } from '../../data/bureauAssets';
import { ASSET_ART } from '../../data/visualAssets';
import { BureauAvatar } from './BureauAvatar';
import { X, Zap } from 'lucide-react';
import { sound } from '../../sound/audioEngine';
import { useModalFocus } from './useModalFocus';

interface AssetDrawerProps {
  player?: Player;
  activePlayer?: Player;
  isOpen?: boolean;
  onClose: () => void;
  onUseAsset: (assetKey: BureauAssetKey) => void;
}

const AssetPicture: React.FC<{ assetKey: BureauAssetKey }> = ({ assetKey }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-[#315760] text-[#f5d56e]"><Zap size={28}/></div>;
  return <img src={ASSET_ART[assetKey]} alt="" onError={() => setFailed(true)} className="h-20 w-24 rounded-xl border-2 border-[#765139] object-cover shadow-sm" />;
};

export const AssetDrawer: React.FC<AssetDrawerProps> = ({ player: propPlayer, activePlayer: propActivePlayer, isOpen = true, onClose, onUseAsset }) => {
  const player = propPlayer || propActivePlayer;
  const dialogRef = useModalFocus<HTMLDivElement>({ isOpen: isOpen && !!player, onEscape: onClose });
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#183138]/70 backdrop-blur-sm flex items-center justify-center p-4" role="presentation">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${player.name}'s Bureau assets`} className="bureau-paper border-[4px] border-[#765139] w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden bureau-paper-drop">
        <div className="bg-[#2f8f95] px-5 py-4 border-b-[3px] border-[#765139] flex items-center justify-between text-white">
          <div className="flex items-center gap-3"><BureauAvatar player={player} size={48}/><div><h3 className="font-['Cinzel'] font-black text-base uppercase tracking-wider">{player.name}'s Bureau Assets</h3><p className="font-['Courier_Prime'] text-[10px] text-[#d9f4ef]">Single-use administrative privileges. Misuse is encouraged only when entertaining.</p></div></div>
          <button type="button" data-modal-autofocus onClick={() => { sound.playClick(); onClose(); }} aria-label="Close asset dossier" className="bureau-button rounded-full bg-[#fff7df] p-2 text-[#244b55]"><X size={19}/></button>
        </div>

        <div className="p-5 flex flex-col gap-3 max-h-[72vh] overflow-y-auto bureau-scrollbar">
          {player.assets.length === 0 ? <div className="rounded-2xl border-2 border-[#b48f61] bg-[#efe0b9] p-7 text-center"><p className="font-['Courier_Prime'] text-xs font-bold text-[#6c513a]">No special clearances remain in this dossier.</p></div> : player.assets.map((assetKey, idx) => {
            const asset = BUREAU_ASSET_DEFINITIONS[assetKey];
            if (!asset) return null;
            return <div key={`${assetKey}-${idx}`} className="flex items-center justify-between gap-4 rounded-2xl border-[3px] border-[#765139] bg-[#fff7df] p-3 shadow-[0_4px_0_#765139]">
              <div className="flex items-center gap-3 min-w-0"><AssetPicture assetKey={assetKey}/><div className="min-w-0"><h4 className="font-['Cinzel'] font-black text-sm text-[#244b55] uppercase">{asset.name}</h4><p className="font-['Courier_Prime'] text-[10px] text-[#a9443d] font-bold italic">{asset.tagline}</p><p className="text-xs text-[#615448] mt-1">{asset.description}</p></div></div>
              <button onClick={() => { sound.playStamp(); onUseAsset(assetKey); }} className="bureau-button shrink-0 rounded-xl bg-[#d9644f] px-4 py-2.5 text-[#fff7df] font-['Cinzel'] font-black text-xs uppercase tracking-wider">Deploy</button>
            </div>;
          })}
        </div>
        <div className="bg-[#e8d5aa] px-5 py-3 border-t-2 border-[#b48f61] flex justify-end"><button onClick={() => { sound.playClick(); onClose(); }} className="bureau-button rounded-xl bg-[#376d9b] px-4 py-2 text-white text-xs font-['Courier_Prime'] uppercase tracking-wider">Close Dossier</button></div>
      </div>
    </div>
  );
};
