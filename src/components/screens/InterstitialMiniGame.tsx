import React, { useMemo, useState } from 'react';
import { Archive, ArrowRight, CircleDot, FileArchive, Gauge, ShieldQuestion } from 'lucide-react';
import type { BureauAssetKey, Player } from '../../types';
import {
  HIGHER_LOWER_PROMPTS,
  MINI_GAME_ASSET_POOL,
  randomAsset,
  type MiniGameType
} from '../../data/miniGames';
import { sound } from '../../sound/audioEngine';

export interface MiniGameEffect {
  playerId: string;
  pointsDelta?: number;
  asset?: BureauAssetKey;
  priorityNextRound?: boolean;
  note: string;
}

interface InterstitialMiniGameProps {
  type: MiniGameType;
  players: Player[];
  onComplete: (effects: MiniGameEffect[]) => void;
}

type ChoiceOutcome = {
  pointsDelta?: number;
  asset?: BureauAssetKey;
  priorityNextRound?: boolean;
  label: string;
};

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

const buildChoiceOutcomes = (type: MiniGameType, count: number): ChoiceOutcome[] => {
  if (type === 'RED_BUTTON') {
    const pool: ChoiceOutcome[] = shuffle([
      { pointsDelta: 318, label: '+318 points. A suspiciously productive button.' },
      { pointsDelta: 173, label: '+173 points. Administrative excitement remains limited.' },
      { asset: randomAsset(), label: 'A Bureau Asset has dropped out of the machinery.' },
      { pointsDelta: -91, label: '−91 points. The red button was red for a reason.' }
    ]);
    return pool.slice(0, count);
  }

  const pool: ChoiceOutcome[] = shuffle([
    { asset: randomAsset(), label: 'The drawer contains a Bureau Asset.' },
    { pointsDelta: 264, label: '+264 points were filed here for reasons nobody can explain.' },
    { pointsDelta: 121, label: '+121 points. A modest but legally defensible discovery.' },
    { priorityNextRound: true, label: 'Priority Access: you will start the next round.' }
  ]);
  return pool.slice(0, count);
};

export const InterstitialMiniGame: React.FC<InterstitialMiniGameProps> = ({ type, players, onComplete }) => {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [effects, setEffects] = useState<MiniGameEffect[]>([]);
  const [usedChoiceIndexes, setUsedChoiceIndexes] = useState<number[]>([]);
  const [revealedNote, setRevealedNote] = useState<string | null>(null);
  const [finishedPlayerTurn, setFinishedPlayerTurn] = useState(false);

  const choiceOutcomes = useMemo(() => buildChoiceOutcomes(type, Math.max(4, players.length)), [type, players.length]);
  const higherLowerPrompts = useMemo(() => shuffle(HIGHER_LOWER_PROMPTS), []);
  const currentPlayer = players[playerIndex];
  const currentPrompt = higherLowerPrompts[playerIndex % higherLowerPrompts.length];

  if (!currentPlayer) return null;

  const finishTurn = (effect: MiniGameEffect) => {
    sound.playStamp();
    setEffects(prev => [...prev, effect]);
    setRevealedNote(effect.note);
    setFinishedPlayerTurn(true);
  };

  const advance = () => {
    sound.playClick();
    if (playerIndex + 1 >= players.length) {
      onComplete(effects);
      return;
    }
    setPlayerIndex(prev => prev + 1);
    setRevealedNote(null);
    setFinishedPlayerTurn(false);
  };

  const choosePhysicalOption = (choiceIndex: number) => {
    if (finishedPlayerTurn || usedChoiceIndexes.includes(choiceIndex)) return;
    const outcome = choiceOutcomes[choiceIndex];
    setUsedChoiceIndexes(prev => [...prev, choiceIndex]);
    finishTurn({
      playerId: currentPlayer.id,
      pointsDelta: outcome.pointsDelta,
      asset: outcome.asset,
      priorityNextRound: outcome.priorityNextRound,
      note: outcome.label
    });
  };

  const chooseHigherLower = (choice: 'HIGHER' | 'LOWER') => {
    if (finishedPlayerTurn) return;
    const correct = currentPrompt.targetValue > currentPrompt.referenceValue ? 'HIGHER' : 'LOWER';
    const isCorrect = choice === correct;
    finishTurn({
      playerId: currentPlayer.id,
      pointsDelta: isCorrect ? currentPrompt.reward : 0,
      note: `${isCorrect ? `Correct: +${currentPrompt.reward} points.` : 'Incorrect: 0 points.'} ${currentPrompt.explanation}`
    });
  };

  const chooseFileRisk = (risk: 'SAFE' | 'RISKY' | 'QUESTIONABLE') => {
    if (finishedPlayerTurn) return;
    const roll = Math.random();
    let pointsDelta = 0;
    let note = '';

    if (risk === 'SAFE') {
      pointsDelta = 128;
      note = '+128 points. Safe, dull and annoyingly sensible.';
    } else if (risk === 'RISKY') {
      const success = roll < 0.58;
      pointsDelta = success ? 347 : -64;
      note = success ? '+347 points. Risk has briefly mistaken you for someone competent.' : '−64 points. Risk has returned to its normal duties.';
    } else {
      const success = roll < 0.34;
      pointsDelta = success ? 593 : -137;
      note = success ? '+593 points. An appalling decision has somehow worked.' : '−137 points. The Bureau would like to clarify that this outcome was extremely foreseeable.';
    }

    finishTurn({ playerId: currentPlayer.id, pointsDelta, note });
  };

  const title = type === 'RED_BUTTON'
    ? 'The Red Button Office'
    : type === 'FILE_CABINET'
      ? 'Unclaimed Filing Cabinet'
      : type === 'HIGHER_LOWER'
        ? 'Statistical Hunch Department'
        : 'Three Sealed Files';

  const subtitle = type === 'RED_BUTTON'
    ? 'Each candidate gets one button. Once pressed, it is dead to everyone else.'
    : type === 'FILE_CABINET'
      ? 'Choose one remaining drawer. The Bureau denies placing anything interesting inside.'
      : type === 'HIGHER_LOWER'
        ? 'One judgement each. No timer, no handover race, just the possibility of public error.'
        : 'Choose Safe, Risky or Deeply Questionable. The labels are unusually accurate.';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5 px-3 py-5 font-['Plus_Jakarta_Sans']">
      <div className="w-full rounded-xl border-2 border-[#d4af37] bg-[#162235] p-5 text-center shadow-2xl">
        <div className="flex justify-center items-center gap-2 text-[#ffd700] mb-2">
          {type === 'RED_BUTTON' && <CircleDot size={22} />}
          {type === 'FILE_CABINET' && <FileArchive size={22} />}
          {type === 'HIGHER_LOWER' && <Gauge size={22} />}
          {type === 'THREE_FILES' && <ShieldQuestion size={22} />}
          <span className="font-['Courier_Prime'] text-xs font-bold tracking-[0.2em] uppercase">Unscheduled Bureau Event</span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-2xl sm:text-3xl text-white">{title}</h2>
        <p className="font-['Fraunces'] text-sm text-slate-300 italic mt-1">{subtitle}</p>
      </div>

      <div className="w-full max-w-2xl rounded-xl border border-[#d4af37]/60 bg-[#0f1928] p-5 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
          <span className="text-3xl">{currentPlayer.avatar}</span>
          <div>
            <span className="font-['Courier_Prime'] text-[10px] uppercase tracking-widest text-[#ffd700] font-bold">Candidate {playerIndex + 1} of {players.length}</span>
            <h3 className="font-['Cinzel'] text-lg font-black text-white">{currentPlayer.name}</h3>
          </div>
        </div>

        {!finishedPlayerTurn && (type === 'RED_BUTTON' || type === 'FILE_CABINET') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
            {choiceOutcomes.slice(0, Math.max(4, players.length)).map((_, idx) => {
              const used = usedChoiceIndexes.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={used}
                  onClick={() => choosePhysicalOption(idx)}
                  className={`min-h-28 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${used ? 'bg-slate-900 border-slate-800 opacity-35' : type === 'RED_BUTTON' ? 'bg-[#4c1518] border-[#e85f55] hover:scale-[1.03]' : 'bg-[#274852] border-[#78bfd0] hover:scale-[1.03]'}`}
                >
                  {type === 'RED_BUTTON' ? <CircleDot size={32} className="text-[#ff766b]" /> : <Archive size={30} className="text-[#9ee3ec]" />}
                  <span className="font-['Cinzel'] text-xs font-black text-white uppercase tracking-wider">{type === 'RED_BUTTON' ? `Button ${idx + 1}` : `Drawer ${String.fromCharCode(65 + idx)}`}</span>
                  {used && <span className="font-['Courier_Prime'] text-[9px] text-slate-500 uppercase">Already taken</span>}
                </button>
              );
            })}
          </div>
        )}

        {!finishedPlayerTurn && type === 'HIGHER_LOWER' && (
          <div className="pt-5 flex flex-col gap-4">
            <div className="rounded-lg bg-[#15263b] border border-[#d4af37]/40 p-4 text-center">
              <span className="font-['Courier_Prime'] text-[10px] text-slate-400 uppercase block">Reference</span>
              <strong className="font-['Cinzel'] text-lg text-[#f5deb3]">{currentPrompt.referenceLabel}</strong>
              <span className="block font-['Space_Mono'] text-sm text-slate-300">{currentPrompt.referenceValue.toLocaleString()} {currentPrompt.unit}</span>
              <p className="mt-3 font-['Fraunces'] text-base text-white">{currentPrompt.prompt}</p>
              <strong className="block font-['Cinzel'] text-xl text-[#ffd700] mt-1">{currentPrompt.targetLabel}</strong>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => chooseHigherLower('HIGHER')} className="py-4 rounded-lg bg-emerald-700 border-2 border-emerald-400 text-white font-['Cinzel'] font-black uppercase tracking-widest hover:brightness-110">Higher / Further</button>
              <button onClick={() => chooseHigherLower('LOWER')} className="py-4 rounded-lg bg-rose-800 border-2 border-rose-400 text-white font-['Cinzel'] font-black uppercase tracking-widest hover:brightness-110">Lower / Shorter</button>
            </div>
          </div>
        )}

        {!finishedPlayerTurn && type === 'THREE_FILES' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
            <button onClick={() => chooseFileRisk('SAFE')} className="p-5 rounded-xl border-2 border-emerald-400 bg-emerald-950/70 text-left hover:brightness-110"><span className="font-['Courier_Prime'] text-[9px] text-emerald-300 uppercase">File A</span><strong className="block font-['Cinzel'] text-lg text-white mt-1">Safe</strong><p className="text-xs text-slate-300 mt-2">Guaranteed modest gain.</p></button>
            <button onClick={() => chooseFileRisk('RISKY')} className="p-5 rounded-xl border-2 border-amber-400 bg-amber-950/60 text-left hover:brightness-110"><span className="font-['Courier_Prime'] text-[9px] text-amber-300 uppercase">File B</span><strong className="block font-['Cinzel'] text-lg text-white mt-1">Risky</strong><p className="text-xs text-slate-300 mt-2">58% chance of a strong reward.</p></button>
            <button onClick={() => chooseFileRisk('QUESTIONABLE')} className="p-5 rounded-xl border-2 border-rose-400 bg-rose-950/70 text-left hover:brightness-110"><span className="font-['Courier_Prime'] text-[9px] text-rose-300 uppercase">File C</span><strong className="block font-['Cinzel'] text-lg text-white mt-1">Deeply Questionable</strong><p className="text-xs text-slate-300 mt-2">34% chance of a very large reward.</p></button>
          </div>
        )}

        {finishedPlayerTurn && (
          <div className="pt-5 flex flex-col items-center gap-4 text-center">
            <div className="w-full rounded-lg border border-[#d4af37]/50 bg-[#17263a] p-5">
              <span className="font-['Courier_Prime'] text-[10px] text-[#ffd700] uppercase tracking-widest block mb-2">Outcome Filed</span>
              <p className="font-['Fraunces'] text-base text-white leading-relaxed">{revealedNote}</p>
            </div>
            <button onClick={advance} className="px-7 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#0a101d] font-['Cinzel'] font-black uppercase tracking-wider flex items-center gap-2">
              {playerIndex + 1 >= players.length ? 'Return to Assessment' : 'Next Candidate'}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="font-['Courier_Prime'] text-[10px] text-slate-500 text-center max-w-xl">
        Interstitial rewards are party-game bonuses and do not alter the 0–1000 scoring scale used by normal knowledge challenges.
      </div>
    </div>
  );
};
