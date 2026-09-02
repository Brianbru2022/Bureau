import React, { useState } from 'react';
import { FinalCase, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Shield, MapPin, Calendar, FileSearch, CheckCircle, ArrowRight, Award } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { motionDuration, PRESENTATION_TIMING } from '../../game/presentation';

interface FinalCaseRoundProps {
  finalCase: FinalCase;
  players: Player[];
  onCompleteCase: (playerBonuses: Record<string, number>) => void;
  influenceContributor?: Player;
  onSpendInfluence?: (playerId:string)=>void;
}

export const FinalCaseRound: React.FC<FinalCaseRoundProps> = ({
  finalCase,
  players,
  onCompleteCase, influenceContributor, onSpendInfluence
}) => {
  // Step: 0 = Briefing, 1 = Stage 1 (Image), 2 = Stage 2 (Map), 3 = Stage 3 (Year), 4 = Final Verdict, 5 = Resolved
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [unlockedClues, setUnlockedClues] = useState<string[]>([]);
  const [caseScores, setCaseScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    players.forEach(p => { init[p.id] = 0; });
    return init;
  });

  // Stage 1 State
  const [stage1Choice, setStage1Choice] = useState<number | null>(null);

  // Stage 2 State
  const [mapPin, setMapPin] = useState<{ x: number; y: number } | null>(null);
  const placeMapPin = (x: number, y: number) => {
    sound.playClick();
    setMapPin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };
  const handleMapKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 3;
    const current = mapPin ?? { x: 50, y: 50 };
    if (event.key === 'Enter' && mapPin) {
      event.preventDefault();
      handleStage2Submit();
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      placeMapPin(current.x, current.y);
      return;
    }
    const movement: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step }
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    placeMapPin(current.x + delta.x, current.y + delta.y);
  };

  // Stage 3 State
  const [inputYear, setInputYear] = useState('');

  // Final Verdict State
  const [verdictChoice, setVerdictChoice] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [purchasedClue,setPurchasedClue]=useState(false);
  const majorStepDelay=()=>motionDuration(PRESENTATION_TIMING.majorStepMs,window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false);

  // Advance Stage 1
  const handleStage1Submit = (idx: number) => {
    sound.playStamp();
    setStage1Choice(idx);
    const correct = idx === finalCase.stages[0].correctIndex;
    if (correct) {
      sound.playBrassChime();
      setUnlockedClues(prev => [...prev, finalCase.stages[0].clueUnlocked]);
      // Award points to all candidates
      setCaseScores(prev => {
        const next = { ...prev };
        players.forEach(p => { next[p.id] = (next[p.id] || 0) + 300; });
        return next;
      });
    } else {
      sound.playDisapproval();
    }
    window.setTimeout(() => setCurrentStep(2), majorStepDelay());
  };

  // Advance Stage 2
  const handleStage2Submit = () => {
    if (!mapPin) return;
    sound.playStamp();
    const target = finalCase.stages[1].targetLocation;
    const dist = Math.hypot(mapPin.x - target.mapX, mapPin.y - target.mapY);
    const correct = dist < 20;

    if (correct) {
      sound.playBrassChime();
      setUnlockedClues(prev => [...prev, finalCase.stages[1].clueUnlocked]);
      setCaseScores(prev => {
        const next = { ...prev };
        players.forEach(p => { next[p.id] = (next[p.id] || 0) + 350; });
        return next;
      });
    } else {
      sound.playDisapproval();
    }
    window.setTimeout(() => setCurrentStep(3), majorStepDelay());
  };

  // Advance Stage 3
  const handleStage3Submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const y = parseInt(inputYear);
    if (isNaN(y)) return;
    sound.playStamp();

    const targetY = finalCase.stages[2].correctYear;
    const correct = Math.abs(y - targetY) <= finalCase.stages[2].tolerance;

    if (correct) {
      sound.playBrassChime();
      setUnlockedClues(prev => [...prev, finalCase.stages[2].clueUnlocked]);
      setCaseScores(prev => {
        const next = { ...prev };
        players.forEach(p => { next[p.id] = (next[p.id] || 0) + 350; });
        return next;
      });
    } else {
      sound.playDisapproval();
    }
    window.setTimeout(() => setCurrentStep(4), majorStepDelay());
  };

  // Final Verdict
  const handleVerdictSubmit = (idx: number) => {
    sound.playStamp();
    setVerdictChoice(idx);
    const correct = idx === finalCase.correctOptionIndex;

    if (correct) {
      sound.playVictoryFanfare();
      setCaseScores(prev => {
        const next = { ...prev };
        players.forEach(p => { next[p.id] = (next[p.id] || 0) + 600; });
        return next;
      });
    } else {
      sound.playDisapproval();
    }

    setIsResolved(true);
    setCurrentStep(5);
  };

  return (
    <div className="relative w-full flex flex-col items-center max-w-5xl mx-auto overflow-hidden rounded-[30px] border-[4px] border-[#765139] bg-[#f3e5c4]/95 p-4 font-['Plus_Jakarta_Sans'] shadow-[0_16px_0_#5a3925,0_28px_55px_rgba(57,35,20,.3)]">
      <img src="/assets/generated-v2/final-adjudication-engine.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-multiply"/>
      {/* Grand Chamber Header */}
      <div className="relative w-full overflow-hidden bg-[#244b55] border-[3px] border-[#d4af57] rounded-2xl p-5 mb-4 shadow-[0_6px_0_#765139] text-center">
        <img src="/assets/generated-v2/final-adjudication-engine.webp" alt="" aria-hidden="true" className="bureau-apparatus-idle pointer-events-none absolute -right-8 -top-16 h-48 opacity-20 mix-blend-screen"/>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="text-[#f0cf68]" size={22} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#f5dfad] tracking-widest uppercase">
            The Assessment Chamber • The Final Case
          </span>
        </div>
        <h1 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-[#fff7df] tracking-wide">
          {finalCase.title}
        </h1>
        <p className="font-['Courier_Prime'] text-xs text-[#f0cf68] mt-1 font-bold">
          {finalCase.subtitle}
        </p>
      </div>

      {/* Clues Accordion / Evidence Board */}
      {unlockedClues.length > 0 && (
        <div className="w-full bg-[#100b1a] border border-purple-500/40 rounded-lg p-3 mb-4 shadow">
          <span className="font-['Cinzel'] font-bold text-xs text-purple-300 uppercase tracking-wider block mb-1">
            Assembled Chamber Intelligence Dossier
          </span>
          <div className="flex flex-col gap-1">
            {unlockedClues.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-['Courier_Prime'] text-emerald-300">
                <CheckCircle size={14} className="shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 0: Briefing */}
      {currentStep === 0 && (
        <div className="w-full max-w-2xl bg-[#140e21] border border-purple-500/60 rounded-lg p-6 flex flex-col items-center text-center gap-5 shadow-2xl">
          <p className="font-['Fraunces'] text-base sm:text-lg text-purple-100 leading-relaxed">
            {finalCase.introduction}
          </p>
          <div className="p-3.5 bg-purple-950/40 rounded border border-purple-500/30 text-xs font-['Courier_Prime'] text-purple-200">
            You will complete three intelligence stages to uncover crucial clues before filing your final verdict with the Bureau.
          </div>
          {influenceContributor&&!purchasedClue&&<button onClick={()=>{onSpendInfluence?.(influenceContributor.id);setPurchasedClue(true);setUnlockedClues(current=>[...current,`Preliminary intelligence: ${finalCase.stages[0].clueUnlocked}`]);sound.playStamp();}} className="rounded border border-amber-300 bg-amber-200/15 px-5 py-3 font-['Courier_Prime'] text-xs font-bold text-amber-200">Spend 1 of {influenceContributor.name}'s Influence for a shared clue</button>}
          <button
            onClick={() => {
              sound.playClick();
              setCurrentStep(1);
            }}
            className="px-8 py-3.5 rounded bg-gradient-to-r from-purple-700 to-indigo-700 hover:brightness-110 text-white font-['Cinzel'] font-bold text-sm uppercase tracking-widest shadow-xl flex items-center gap-2 border border-purple-400 cursor-pointer"
          >
            <span>Open Case File</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Stage 1 Image Evidence */}
      {currentStep === 1 && (
        <div className="w-full max-w-2xl bg-[#140e21] border border-purple-500/60 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-purple-300 uppercase font-bold tracking-widest block">
              Stage 1 of 3: Visual Evidence
            </span>
            <h3 className="font-['Cinzel'] font-bold text-lg text-white mt-1">
              {finalCase.stages[0].prompt}
            </h3>
            <p className="font-['Fraunces'] text-xs text-purple-200/80 italic mt-1">
              Hint: {finalCase.stages[0].imageHint}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {finalCase.stages[0].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleStage1Submit(i)}
                className="p-3.5 rounded bg-[#1e1533] hover:bg-[#2b1e47] border border-purple-500/40 hover:border-purple-300 text-left text-xs font-['Cinzel'] font-bold text-white shadow transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Stage 2 Map Evidence */}
      {currentStep === 2 && (
        <div className="w-full max-w-2xl bg-[#140e21] border border-purple-500/60 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-purple-300 uppercase font-bold tracking-widest block">
              Stage 2 of 3: Cartographical Location
            </span>
            <h3 className="font-['Cinzel'] font-bold text-lg text-white mt-1">
              {finalCase.stages[1].prompt}
            </h3>
          </div>

          {/* Mini Map Click Target */}
          <div
            role="application"
            tabIndex={0}
            aria-label="Final Case coordinate map. Use arrow keys to position the pin, Shift and an arrow for a larger movement, Space to place the first pin and Enter to confirm."
            aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
            onKeyDown={handleMapKeyDown}
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              placeMapPin(x, y);
            }}
            className="relative w-full max-w-md h-64 bg-[#0a0712] border-2 border-purple-400 rounded-lg cursor-crosshair overflow-hidden touch-none"
          >
            <svg className="w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M38 12 C42 9, 52 8, 56 14 C58 18, 52 22, 54 26 C56 29, 62 30, 60 36 C58 40, 52 42, 48 40 C42 38, 36 42, 34 38 C32 34, 30 26, 34 20 C36 15, 36 14, 38 12 Z" fill="#1b122c" stroke="#805ad5" strokeWidth="0.6" />
              <path d="M48 40 C54 41, 62 38, 66 43 C70 48, 68 56, 74 62 C78 66, 75 72, 70 76 C65 80, 56 82, 48 84 C42 85, 34 88, 30 84 C26 80, 32 74, 36 72 C34 68, 28 66, 28 58 C28 52, 36 50, 40 52 C44 54, 46 48, 48 40 Z" fill="#201435" stroke="#805ad5" strokeWidth="0.6" />
            </svg>
            {mapPin && (
              <div className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${mapPin.x}%`, top: `${mapPin.y}%` }}>
                <MapPin className="text-purple-400 fill-purple-400" size={24} />
              </div>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {mapPin ? `Pin positioned at ${Math.round(mapPin.x)} percent across and ${Math.round(mapPin.y)} percent down.` : 'No coordinate has been selected.'}
          </p>

          <button
            disabled={!mapPin}
            onClick={handleStage2Submit}
            className="px-6 py-2.5 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-['Cinzel'] font-bold text-xs uppercase tracking-wider shadow"
          >
            Confirm Coordinate Drop
          </button>
        </div>
      )}

      {/* Step 3: Stage 3 Chronological Interrogation */}
      {currentStep === 3 && (
        <div className="w-full max-w-2xl bg-[#140e21] border border-purple-500/60 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-purple-300 uppercase font-bold tracking-widest block">
              Stage 3 of 3: Chronological Record
            </span>
            <h3 className="font-['Cinzel'] font-bold text-lg text-white mt-1">
              {finalCase.stages[2].prompt}
            </h3>
          </div>

          <form onSubmit={handleStage3Submit} className="w-full max-w-sm flex flex-col gap-3">
            <input
              type="number"
              autoFocus
              value={inputYear}
              onChange={e => setInputYear(e.target.value)}
              placeholder="Enter year (e.g. 1940)"
              className="w-full px-4 py-3 rounded bg-[#0b0713] border border-purple-400 text-white text-center font-['Space_Mono'] text-xl focus:outline-none focus:border-purple-300"
            />
            <button
              type="submit"
              disabled={!inputYear.trim()}
              className="w-full py-2.5 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-['Cinzel'] font-bold text-xs uppercase tracking-wider shadow"
            >
              Authenticate Year
            </button>
          </form>
        </div>
      )}

      {/* Step 4: Final Verdict */}
      {currentStep === 4 && (
        <div className="w-full max-w-2xl bg-[#140e21] border-2 border-purple-400 rounded-lg p-6 flex flex-col items-center gap-5 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="text-center">
            <span className="font-['Courier_Prime'] text-xs text-purple-300 uppercase font-bold tracking-widest block">
              The Grand Chamber Verdict
            </span>
            <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white mt-1">
              {finalCase.verdictPrompt}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {finalCase.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleVerdictSubmit(i)}
                className="p-4 rounded-lg bg-[#201438] hover:bg-[#2e1d52] border border-purple-400/50 hover:border-purple-300 text-left text-sm font-['Cinzel'] font-bold text-white shadow-lg transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Resolved Summary */}
      {currentStep === 5 && (
        <CommentaryPlaque
          score={caseScores[players[0]?.id] || 950}
          playerName="Candidates"
          roundType="FINAL_CASE"
          questionPrompt={finalCase.title}
          explanation={finalCase.finalVerdictText}
          source="The Assessment Chamber Archives"
          isCorrect={verdictChoice === finalCase.correctOptionIndex}
          onProceed={() => onCompleteCase(caseScores)}
        />
      )}
    </div>
  );
};
