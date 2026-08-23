import React from 'react';
import { Player, BureauAssetKey } from '../../types';
import { BUREAU_ASSET_DEFINITIONS } from '../../data/bureauAssets';
import { X, HelpCircle, FileSpreadsheet, TrendingUp, Crosshair, ShieldCheck, Key, Zap } from 'lucide-react';
import { sound } from '../../sound/audioEngine';

interface AssetDrawerProps {
  player?: Player;
  activePlayer?: Player;
  isOpen?: boolean;
  onClose: () => void;
  onUseAsset: (assetKey: BureauAssetKey) => void;
}

export const AssetDrawer: React.FC<AssetDrawerProps> = ({
  player: propPlayer,
  activePlayer: propActivePlayer,
  isOpen = true,
  onClose,
  onUseAsset
}) => {
  const player = propPlayer || propActivePlayer;
  if (!isOpen || !player) return null;
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle size={24} className="text-amber-400" />;
      case 'FileSpreadsheet': return <FileSpreadsheet size={24} className="text-blue-400" />;
      case 'TrendingUp': return <TrendingUp size={24} className="text-emerald-400" />;
      case 'Crosshair': return <Crosshair size={24} className="text-red-400" />;
      case 'ShieldCheck': return <ShieldCheck size={24} className="text-indigo-400" />;
      case 'Key': return <Key size={24} className="text-yellow-400" />;
      default: return <Zap size={24} className="text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141e2e] border-2 border-[#d4af37] w-full max-w-xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1e293b] px-5 py-3 border-b border-[#d4af37]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{player.avatar}</span>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm text-[#ffd700] uppercase tracking-wider">
                {player.name}'s Bureau Credentials &amp; Assets
              </h3>
              <p className="font-['Courier_Prime'] text-[10px] text-slate-400">
                Single-use administrative privileges granted by the Crown
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Assets List */}
        <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
          {player.assets.length === 0 ? (
            <div className="py-8 text-center bg-[#0d1522] rounded border border-slate-800 p-4">
              <p className="font-['Courier_Prime'] text-xs text-slate-400">
                No special clearance assets in your possession at present.
              </p>
              <p className="font-['Fraunces'] text-xs text-amber-200/70 mt-1 italic">
                Assets are occasionally awarded during bureaucratic reviews or exceptional performances.
              </p>
            </div>
          ) : (
            player.assets.map((assetKey, idx) => {
              const asset = BUREAU_ASSET_DEFINITIONS[assetKey];
              if (!asset) return null;
              return (
                <div
                  key={`${assetKey}-${idx}`}
                  className="bg-[#101a2b] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-md p-3.5 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#1b263b] rounded border border-[#d4af37]/20">
                      {getIcon(asset.iconName)}
                    </div>
                    <div>
                      <h4 className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wide">
                        {asset.name}
                      </h4>
                      <p className="font-['Courier_Prime'] text-[10px] text-amber-200/80 italic mb-0.5">
                        {asset.tagline}
                      </p>
                      <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-300">
                        {asset.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playStamp();
                      onUseAsset(assetKey);
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded bg-[#1e3a5f] hover:bg-[#254b7a] border border-[#4fd1c5] text-[#4fd1c5] hover:text-white font-['Cinzel'] font-bold text-xs tracking-wider uppercase transition-all shadow"
                  >
                    Deploy
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0e1624] px-5 py-2.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-['Courier_Prime'] uppercase tracking-wider"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
