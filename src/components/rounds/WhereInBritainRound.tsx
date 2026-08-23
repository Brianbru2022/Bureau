import React, { useState, useRef } from 'react';
import { WhereInBritainChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface WhereInBritainProps {
  challenge: WhereInBritainChallenge;
  currentPlayer: Player;
  onComplete: (score: number, errorKm: number) => void;
  hintUsed?: boolean;
}

export const WhereInBritainRound: React.FC<WhereInBritainProps> = ({
  challenge,
  currentPlayer,
  onComplete,
  hintUsed = false
}) => {
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [earnedScore, setEarnedScore] = useState<number>(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Handle map click / touch to place pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSubmitted || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    sound.playClick();
    setPin({ x: xPct, y: yPct });
  };

  // Convert SVG coordinates to rough real-world distance in km across Great Britain
  // Map bounds approximately: 50.0°N to 58.5°N (approx 950 km tall), -7.5°W to 1.8°E (approx 650 km wide)
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const dx = ((p1.x - p2.x) / 100) * 650;
    const dy = ((p1.y - p2.y) / 100) * 950;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Continuous non-linear scoring curve from 0 to 1000
  const computeScore = (km: number): number => {
    if (km <= 8) return 1000;
    if (km <= 25) return Math.round(950 - (km - 8) * 5); // 950 down to 865
    if (km <= 75) return Math.round(865 - (km - 25) * 4.5); // 865 down to 640
    if (km <= 150) return Math.round(640 - (km - 75) * 3); // 640 down to 415
    if (km <= 300) return Math.round(415 - (km - 150) * 1.8); // 415 down to 145
    if (km <= 500) return Math.max(15, Math.round(145 - (km - 300) * 0.6));
    return 0;
  };

  const handleConfirmPin = () => {
    if (!pin) return;
    sound.playStamp();

    const target = { x: challenge.mapX, y: challenge.mapY };
    const dist = calculateDistance(pin, target);
    const score = computeScore(dist);

    setDistanceKm(dist);
    setEarnedScore(score);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-5xl mx-auto font-['Plus_Jakarta_Sans']">
      {/* Challenge Title Plaque */}
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Compass className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Cartographical Assessment • Where in Britain?
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          Candidate <strong className="text-[#ffd700]">{currentPlayer.name}</strong>, inspect the imperial projection table and drop your pin.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-center justify-center">
          {/* Interactive Great Britain Map Table */}
          <div 
            ref={mapContainerRef}
            onClick={handleMapClick}
            className="relative w-full max-w-[480px] h-[540px] sm:h-[580px] bg-[#0c1626] border-2 border-[#d4af37]/70 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.9)] cursor-crosshair overflow-hidden select-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(20, 40, 70, 0.4) 0%, transparent 80%),
                linear-gradient(rgba(212, 175, 55, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212, 175, 55, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 30px 30px, 30px 30px'
            }}
          >
            {/* Compass Rose in Corner */}
            <div className="absolute top-3 right-3 opacity-30 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="#d4af37" strokeWidth="1" />
                <polygon points="50,10 56,44 50,38 44,44" fill="#d4af37" />
                <polygon points="50,90 56,56 50,62 44,56" fill="#8b7322" />
                <polygon points="90,50 56,56 62,50 56,44" fill="#8b7322" />
                <polygon points="10,50 44,56 38,50 44,44" fill="#8b7322" />
                <text x="47" y="24" fill="#d4af37" fontSize="12" fontWeight="bold" fontFamily="Cinzel">N</text>
              </svg>
            </div>

            {/* Stylized Vector Silhouette of Great Britain & Ireland */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Regional Grid Lat/Long guidelines */}
              <line x1="10" y1="25" x2="90" y2="25" stroke="#d4af37" strokeWidth="0.2" strokeDasharray="1 2" opacity="0.3" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#d4af37" strokeWidth="0.2" strokeDasharray="1 2" opacity="0.3" />
              <line x1="10" y1="75" x2="90" y2="75" stroke="#d4af37" strokeWidth="0.2" strokeDasharray="1 2" opacity="0.3" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#d4af37" strokeWidth="0.2" strokeDasharray="1 2" opacity="0.3" />

              {/* Scotland & England & Wales Landmass Silhouette */}
              {/* Scotland */}
              <path
                d="M38 12 C42 9, 52 8, 56 14 C58 18, 52 22, 54 26 C56 29, 62 30, 60 36 C58 40, 52 42, 48 40 C42 38, 36 42, 34 38 C32 34, 30 26, 34 20 C36 15, 36 14, 38 12 Z"
                fill="#16273c"
                stroke="#d4af37"
                strokeWidth="0.6"
              />
              {/* England & Wales */}
              <path
                d="M48 40 C54 41, 62 38, 66 43 C70 48, 68 56, 74 62 C78 66, 75 72, 70 76 C65 80, 56 82, 48 84 C42 85, 34 88, 30 84 C26 80, 32 74, 36 72 C34 68, 28 66, 28 58 C28 52, 36 50, 40 52 C44 54, 46 48, 48 40 Z"
                fill="#182c44"
                stroke="#d4af37"
                strokeWidth="0.6"
              />
              {/* Northern Ireland */}
              <path
                d="M20 30 C26 28, 30 32, 28 38 C26 42, 20 40, 18 36 C17 32, 18 30, 20 30 Z"
                fill="#152438"
                stroke="#d4af37"
                strokeWidth="0.5"
              />
              {/* Outer Hebrides & Shetland islands dots */}
              <circle cx="28" cy="16" r="1.5" fill="#16273c" stroke="#d4af37" strokeWidth="0.4" />
              <circle cx="58" cy="5" r="1.2" fill="#16273c" stroke="#d4af37" strokeWidth="0.4" />
              <circle cx="30" cy="80" r="1.2" fill="#16273c" stroke="#d4af37" strokeWidth="0.4" />

              {/* Major Region Monikers */}
              <text x="44" y="24" fill="#a0aec0" opacity="0.4" fontSize="2.5" fontFamily="Cinzel" textAnchor="middle">SCOTLAND</text>
              <text x="56" y="60" fill="#a0aec0" opacity="0.4" fontSize="2.5" fontFamily="Cinzel" textAnchor="middle">ENGLAND</text>
              <text x="34" y="62" fill="#a0aec0" opacity="0.4" fontSize="2.2" fontFamily="Cinzel" textAnchor="middle">WALES</text>
              <text x="24" y="35" fill="#a0aec0" opacity="0.4" fontSize="1.8" fontFamily="Cinzel" textAnchor="middle">N. IRELAND</text>
            </svg>

            {/* User Dropped Pin */}
            {pin && (
              <div 
                className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-150 animate-bounce"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded bg-[#ffd700] text-[#0a101d] font-['Courier_Prime'] font-bold text-[9px] shadow-lg whitespace-nowrap">
                    YOUR PIN
                  </span>
                  <MapPin className="text-rose-500 fill-rose-500 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" size={28} />
                </div>
              </div>
            )}
          </div>

          {/* Control Plaque */}
          <div className="w-full lg:w-72 bg-[#121c2c] border border-[#d4af37]/40 rounded-lg p-5 flex flex-col gap-4">
            <h3 className="font-['Cinzel'] font-bold text-sm text-[#e6c875] uppercase tracking-wider border-b border-[#d4af37]/20 pb-2">
              Cartographic Instructions
            </h3>

            <p className="font-['Plus_Jakarta_Sans'] text-xs text-slate-300 leading-relaxed">
              Click or tap precisely onto the map where you believe <strong>{challenge.targetName}</strong> is situated.
            </p>

            <div className="bg-[#0b121e] p-3 rounded border border-slate-800">
              <span className="font-['Courier_Prime'] text-[10px] text-slate-400 block uppercase">
                Coordinate Status
              </span>
              <span className="font-['Space_Mono'] text-xs font-bold text-[#ffd700]">
                {pin ? `Grid: X ${pin.x.toFixed(1)}% • Y ${pin.y.toFixed(1)}%` : 'Awaiting Pin Placement...'}
              </span>
            </div>

            <button
              disabled={!pin}
              onClick={handleConfirmPin}
              className={`w-full py-3 rounded font-['Cinzel'] font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                pin
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f5deb3] text-[#0a101d] hover:brightness-110 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Navigation size={16} />
              <span>Lock Coordinates &amp; Submit</span>
            </button>
          </div>
        </div>
      ) : (
        /* Result Map Visualization + Plaque */
        <div className="w-full flex flex-col items-center gap-4">
          <div 
            className="relative w-full max-w-[480px] h-[340px] bg-[#0c1626] border-2 border-[#d4af37] rounded-lg shadow-xl overflow-hidden"
          >
            {/* Silhouette */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M38 12 C42 9, 52 8, 56 14 C58 18, 52 22, 54 26 C56 29, 62 30, 60 36 C58 40, 52 42, 48 40 C42 38, 36 42, 34 38 C32 34, 30 26, 34 20 C36 15, 36 14, 38 12 Z"
                fill="#16273c"
                stroke="#d4af37"
                strokeWidth="0.6"
              />
              <path
                d="M48 40 C54 41, 62 38, 66 43 C70 48, 68 56, 74 62 C78 66, 75 72, 70 76 C65 80, 56 82, 48 84 C42 85, 34 88, 30 84 C26 80, 32 74, 36 72 C34 68, 28 66, 28 58 C28 52, 36 50, 40 52 C44 54, 46 48, 48 40 Z"
                fill="#182c44"
                stroke="#d4af37"
                strokeWidth="0.6"
              />

              {/* Trajectory line connecting guess to correct */}
              {pin && (
                <line 
                  x1={pin.x} 
                  y1={pin.y} 
                  x2={challenge.mapX} 
                  y2={challenge.mapY} 
                  stroke="#ffd700" 
                  strokeWidth="0.8" 
                  strokeDasharray="2 2" 
                />
              )}
            </svg>

            {/* Candidate Pin */}
            {pin && (
              <div 
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <MapPin className="text-rose-500 fill-rose-500 filter drop-shadow" size={24} />
              </div>
            )}

            {/* True Location Pin */}
            <div 
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${challenge.mapX}%`, top: `${challenge.mapY}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black font-['Courier_Prime'] font-bold text-[8px] whitespace-nowrap">
                  CORRECT
                </span>
                <MapPin className="text-emerald-400 fill-emerald-400 filter drop-shadow" size={26} />
              </div>
            </div>
          </div>

          {/* Commentary Plaque */}
          <CommentaryPlaque
            score={earnedScore}
            playerName={currentPlayer.name}
            roundType="WHERE_IN_BRITAIN"
            questionPrompt={challenge.prompt}
            explanation={challenge.explanation}
            source={challenge.source}
            errorKm={distanceKm || 0}
            isCorrect={earnedScore > 400}
            onProceed={() => onComplete(earnedScore, distanceKm || 0)}
          />
        </div>
      )}
    </div>
  );
};
