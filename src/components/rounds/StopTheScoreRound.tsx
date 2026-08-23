import React, { useState, useEffect, useRef } from 'react';
import { StopTheScoreChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Gauge, Play, Square } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { clampScore } from '../../game/scoring';

interface StopTheScoreProps {
  challenge: StopTheScoreChallenge;
  currentPlayer: Player;
  onComplete: (score: number, isCorrect: boolean) => void;
}

export const StopTheScoreRound: React.FC<StopTheScoreProps> = ({
  challenge,
  currentPlayer,
  onComplete
}) => {
  const [phase, setPhase] = useState<'THINKING' | 'RUNNING' | 'LOCKED' | 'RESULT'>('THINKING');
  const [meterValue, setMeterValue] = useState(500);
  const [lockedScore, setLockedScore] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [earnedScore, setEarnedScore] = useState(0);

  const reqRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickCounterRef = useRef<number>(0);
  const liveValueRef = useRef(500);

  const lockCurrentScore = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const score = clampScore(liveValueRef.current);
    sound.playStamp();
    setMeterValue(score);
    setLockedScore(score);
    setPhase('LOCKED');
  };

  const animateMeter = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;

    const wave1 = Math.sin(elapsed * 2.8) * 365;
    const wave2 = Math.sin(elapsed * 5.4 + 1.2) * 195;
    const wave3 = Math.cos(elapsed * 0.9) * 135;
    const noise = Math.sin(elapsed * 17.1) * 48;

    const val = clampScore(500 + wave1 + wave2 + wave3 + noise);
    liveValueRef.current = val;
    setMeterValue(val);

    tickCounterRef.current += 1;
    if (tickCounterRef.current % 6 === 0) {
      sound.playNeedleTick(val / 1000);
    }

    if (elapsed < 20) {
      reqRef.current = requestAnimationFrame(animateMeter);
    } else {
      lockCurrentScore();
    }
  };

  const handleStartMeter = () => {
    sound.playClick();
    setPhase('RUNNING');
    startTimeRef.current = 0;
    reqRef.current = requestAnimationFrame(animateMeter);
  };

  const handleSelectOption = (idx: number) => {
    sound.playClick();
    setSelectedOptionIndex(idx);

    const isCorrect = idx === challenge.correctIndex;
    const scoreAwarded = isCorrect ? (lockedScore ?? 0) : 0;
    setEarnedScore(scoreAwarded);
    setPhase('RESULT');

    if (isCorrect) sound.playVictoryFanfare();
    else sound.playDisapproval();
  };

  useEffect(() => {
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  const needleAngle = -90 + (meterValue / 1000) * 180;

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Gauge className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Confidence &amp; Risk Apparatus • Stop The Score
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">{challenge.prompt}</h2>
      </div>

      {phase !== 'RESULT' ? (
        <div className="w-full bg-[#0e1724] border-2 border-[#d4af37]/80 rounded-lg p-6 flex flex-col items-center gap-6 shadow-2xl">
          <div className="relative w-full max-w-md bg-[#121c2d] border-4 border-[#d4af37] rounded-2xl p-5 shadow-2xl flex flex-col items-center">
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#d4af37] border border-black shadow" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#d4af37] border border-black shadow" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#d4af37] border border-black shadow" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#d4af37] border border-black shadow" />

            <svg width="260" height="140" viewBox="0 0 260 140" className="overflow-visible">
              <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke="#1b2a3f" strokeWidth="24" strokeLinecap="round" />
              <path
                d="M 30 130 A 100 100 0 0 1 230 130"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={314 - (meterValue / 1000) * 314}
              />
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e53e3e" />
                  <stop offset="50%" stopColor="#ecc94b" />
                  <stop offset="100%" stopColor="#38a169" />
                </linearGradient>
              </defs>
              {[0, 250, 500, 750, 1000].map((tick, i) => {
                const angle = -180 + (tick / 1000) * 180;
                const rad = (angle * Math.PI) / 180;
                const x = 130 + Math.cos(rad) * 115;
                const y = 130 + Math.sin(rad) * 115;
                return (
                  <text key={i} x={x} y={y} fill="#a0aec0" fontSize="9" fontFamily="Space Mono" fontWeight="bold" textAnchor="middle">
                    {tick}
                  </text>
                );
              })}
              <g transform={`translate(130, 130) rotate(${needleAngle})`}>
                <line x1="0" y1="0" x2="0" y2="-90" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" />
                <circle cx="0" cy="0" r="8" fill="#d4af37" stroke="#000" strokeWidth="2" />
              </g>
            </svg>

            <div className="mt-2 px-6 py-2 rounded bg-[#070c14] border-2 border-[#d4af37] flex flex-col items-center">
              <span className="font-['Courier_Prime'] text-[9px] text-[#e6c875] tracking-widest uppercase font-bold">
                {phase === 'LOCKED' ? 'STAKED SCORE' : 'LIVE VOLATILITY GAUGE'}
              </span>
              <span className="font-['Space_Mono'] font-extrabold text-4xl text-[#ffd700] tracking-tight">
                {lockedScore !== null ? lockedScore : meterValue}
              </span>
            </div>
          </div>

          {phase === 'THINKING' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-['Fraunces'] text-sm text-slate-200 max-w-md">
                Review the question. When confident, engage the score mechanism. You have up to 20 seconds to stop anywhere from 0 to 1000.
              </p>
              <button
                onClick={handleStartMeter}
                className="px-8 py-3.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-['Cinzel'] font-bold text-sm tracking-widest uppercase shadow-xl flex items-center gap-2 border border-emerald-400 cursor-pointer"
              >
                <Play size={18} />
                <span>Engage Score Machine</span>
              </button>
            </div>
          )}

          {phase === 'RUNNING' && (
            <div className="flex flex-col items-center gap-3">
              <p className="font-['Courier_Prime'] text-xs text-amber-300 font-bold tracking-wider animate-pulse">THE DIAL IS VOLATILE — HIT STOP TO LOCK IN VALUE</p>
              <button
                onClick={lockCurrentScore}
                className="px-10 py-4 rounded bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white font-['Cinzel'] font-black text-base tracking-widest uppercase shadow-2xl flex items-center gap-3 border-2 border-rose-400 animate-bounce cursor-pointer"
              >
                <Square size={20} className="fill-white" />
                <span>STOP THE SCORE ({meterValue} PTS)</span>
              </button>
            </div>
          )}

          {phase === 'LOCKED' && (
            <div className="w-full max-w-xl flex flex-col gap-3 animate-in fade-in zoom-in-95">
              <div className="text-center pb-2">
                <span className="font-['Cinzel'] font-bold text-xs text-[#ffd700] uppercase tracking-wider">Stake Confirmed: {lockedScore} Points</span>
                <p className="font-['Courier_Prime'] text-xs text-slate-300">Select your answer. Correct = +{lockedScore} pts. Wrong = 0 pts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="p-3.5 rounded bg-[#162539] hover:bg-[#203754] border border-[#d4af37]/50 hover:border-[#ffd700] text-left text-xs font-['Cinzel'] font-bold text-white shadow transition-all flex items-center gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-['Space_Mono']">{String.fromCharCode(65 + idx)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <CommentaryPlaque
          score={earnedScore}
          playerName={currentPlayer.name}
          roundType="STOP_THE_SCORE"
          questionPrompt={challenge.prompt}
          explanation={challenge.explanation}
          source={challenge.source}
          isCorrect={selectedOptionIndex === challenge.correctIndex}
          onProceed={() => onComplete(earnedScore, selectedOptionIndex === challenge.correctIndex)}
        />
      )}
    </div>
  );
};
