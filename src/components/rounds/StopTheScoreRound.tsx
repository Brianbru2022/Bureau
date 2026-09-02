import React, { useEffect, useRef, useState } from 'react';
import { StopTheScoreChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Gauge, Play, Square } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { clampScore } from '../../game/scoring';

interface StopTheScoreProps { challenge: StopTheScoreChallenge; currentPlayer: Player; onComplete: (score: number, isCorrect: boolean, riskedValue: number) => void; }

export const StopTheScoreRound: React.FC<StopTheScoreProps> = ({ challenge, currentPlayer, onComplete }) => {
  const [phase, setPhase] = useState<'THINKING' | 'RUNNING' | 'LOCKED' | 'ANSWERING' | 'RESULT'>('THINKING');
  const [meterValue, setMeterValue] = useState(500);
  const [lockedScore, setLockedScore] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [earnedScore, setEarnedScore] = useState(0);
  const reqRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const tickCounterRef = useRef(0);
  const liveValueRef = useRef(500);

  const lockCurrentScore = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const score = clampScore(liveValueRef.current);
    sound.playDepartmentCue('STOP_THE_SCORE', 'PROCESSING'); setMeterValue(score); setLockedScore(score); setPhase('LOCKED');
  };

  const animateMeter = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const val = clampScore(500 + Math.sin(elapsed*2.8)*365 + Math.sin(elapsed*5.4+1.2)*195 + Math.cos(elapsed*.9)*135 + Math.sin(elapsed*17.1)*48);
    liveValueRef.current = val; setMeterValue(val); tickCounterRef.current += 1;
    if (tickCounterRef.current % 6 === 0) sound.playNeedleTick(val/1000);
    if (elapsed < 20) reqRef.current = requestAnimationFrame(animateMeter); else lockCurrentScore();
  };

  const handleStartMeter = () => { sound.playDepartmentCue('STOP_THE_SCORE', 'MOVE'); setPhase('RUNNING'); startTimeRef.current = 0; reqRef.current = requestAnimationFrame(animateMeter); };
  const handleSelectOption = (idx: number) => { sound.playDepartmentCue('STOP_THE_SCORE', 'PROCESSING'); setSelectedOptionIndex(idx); const correct = idx === challenge.correctIndex; const score = correct ? (lockedScore ?? 0) : 0; setEarnedScore(score); setPhase('RESULT'); sound.playDepartmentCue('STOP_THE_SCORE', correct?'ACCEPTED':'REJECTED'); };
  useEffect(() => () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); }, []);
  const needleAngle = -90 + (meterValue / 1000) * 180;

  if (phase === 'RESULT') {
    const submittedAnswer = selectedOptionIndex !== null ? challenge.options[selectedOptionIndex] : undefined;
    const certifiedAnswer = challenge.options[challenge.correctIndex];
    return <CommentaryPlaque score={earnedScore} playerName={currentPlayer.name} roundType="STOP_THE_SCORE" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={submittedAnswer} correctAnswer={certifiedAnswer} riskedValue={lockedScore ?? 0} history={currentPlayer.stats} isCorrect={selectedOptionIndex===challenge.correctIndex} onProceed={()=>onComplete(earnedScore,selectedOptionIndex===challenge.correctIndex,lockedScore??0)} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto font-['Plus_Jakarta_Sans']">
      <ApparatusFrame state={phase==='RUNNING'?'PROCESSING':phase==='LOCKED'?'PROCESSING':phase==='ANSWERING'?'ACCEPTED':'ACTIVE'} eyebrow="Confidence & Risk Chamber • Volatility Engine" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, decide how many points your confidence deserves before reality is consulted.</>} icon={<Gauge size={29}/>} accent="#dd5e55" instrumentLabel="VOLATILITY GAUGE">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-6 items-center">
          <div className="relative rounded-[30px] border-[5px] border-[#65442c] bg-[#e65d4e] p-5 shadow-[inset_0_0_0_5px_#f49d70,0_10px_0_#65442c]">
            <div className="absolute left-5 top-5 h-5 w-5 rounded-full border-2 border-[#60412c] bg-[#f3d66d]"/><div className="absolute right-5 top-5 h-5 w-5 rounded-full border-2 border-[#60412c] bg-[#f3d66d]"/>
            <div className="rounded-[24px] border-[4px] border-[#65442c] bg-[#fff3cf] p-4 shadow-inner">
              <svg width="100%" height="270" viewBox="0 0 420 260">
                <path d="M 55 225 A 155 155 0 0 1 365 225" fill="none" stroke="#4b6f73" strokeWidth="46" strokeLinecap="round"/>
                <path d="M 55 225 A 155 155 0 0 1 365 225" fill="none" stroke="url(#bureauGauge)" strokeWidth="30" strokeLinecap="round" strokeDasharray="487" strokeDashoffset={487-(meterValue/1000)*487}/>
                <defs><linearGradient id="bureauGauge"><stop offset="0%" stopColor="#4aa7a7"/><stop offset="48%" stopColor="#efcc5f"/><stop offset="100%" stopColor="#e65d4e"/></linearGradient></defs>
                {[0,250,500,750,1000].map(t=>{const a=-180+(t/1000)*180;const r=a*Math.PI/180;return <text key={t} x={210+Math.cos(r)*178} y={225+Math.sin(r)*178} fill="#65442c" fontSize="15" fontFamily="Space Mono" fontWeight="bold" textAnchor="middle">{t}</text>})}
                <g transform={`translate(210,225) rotate(${needleAngle})`}><line x1="0" y1="0" x2="0" y2="-138" stroke="#613d2a" strokeWidth="7" strokeLinecap="round"/><circle cx="0" cy="0" r="17" fill="#efcc5f" stroke="#613d2a" strokeWidth="5"/></g>
              </svg>
              <div className="mx-auto -mt-3 w-56 rounded-xl border-[4px] border-[#65442c] bg-[#253e46] p-3 text-center shadow-[0_5px_0_#65442c]">
                <div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#9ee1dc]">{phase==='LOCKED'?'STAKE LOCKED':'LIVE SCORE'}</div>
                <div className="font-['Space_Mono'] text-5xl font-black text-[#f6d663]">{lockedScore ?? meterValue}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">{['PRESSURE','DOUBT','AUDACITY','REGRET'].map((label,i)=><div key={label} className={`rounded-lg border-2 border-[#65442c] py-2 text-center font-['Courier_Prime'] text-xs font-black ${i===2?'bg-[#f2cf65] text-[#65442c]':'bg-[#2f7f84] text-white'}`}>{label}</div>)}</div>
          </div>

          <div className="rounded-2xl border-[4px] border-[#65442c] bg-[#fff4d8] p-5 shadow-[0_7px_0_#65442c]">
            {phase==='THINKING' && <div className="space-y-4 text-center"><div className="rounded-xl border-2 border-[#9d825d] bg-[#eee0bb] p-4 font-['Fraunces'] text-sm text-[#5c4e40]">Read the question first. Start the machine only when you have decided you probably know the answer.</div><button onClick={handleStartMeter} className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#2fa8ae] py-4 font-['Cinzel'] text-sm font-black uppercase tracking-widest text-white shadow-[0_5px_0_#65442c]"><Play size={19}/> Engage Machine</button></div>}
            {phase==='RUNNING' && <div className="space-y-4 text-center"><div className="rounded-xl border-2 border-[#c94f46] bg-[#ffe0c8] p-4 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#9b4039] animate-pulse">Needle volatile. Bureau liability waiver now active.</div><button onClick={lockCurrentScore} className="flex w-full items-center justify-center gap-2 rounded-xl border-[4px] border-[#65442c] bg-[#e65d4e] py-5 font-['Cinzel'] text-base font-black uppercase tracking-widest text-white shadow-[0_7px_0_#65442c] active:translate-y-1 active:shadow-none"><Square size={21} className="fill-white"/> STOP — {meterValue}</button></div>}
            {phase==='LOCKED' && <div className="space-y-4"><div className="rounded-xl border-2 border-[#65442c] bg-[#f2cf65] p-4 text-center text-[#60452f]"><div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Unsealed stake</div><div className="font-['Space_Mono'] text-4xl font-black">{lockedScore}</div><p className="mt-2 font-['Fraunces'] text-sm">Confirm this liability before the answer file is opened.</p></div><button onClick={()=>{sound.playDepartmentCue('STOP_THE_SCORE', 'PROCESSING');setPhase('ANSWERING')}} className="bureau-button w-full rounded-xl border-[4px] border-[#65442c] bg-[#a9443d] py-4 font-['Cinzel'] text-sm font-black uppercase tracking-widest text-white shadow-[0_6px_0_#65442c]">Seal {lockedScore}-point stake</button></div>}
            {phase==='ANSWERING' && <div className="space-y-4"><div className="rounded-xl border-2 border-[#65442c] bg-[#d9efdf] p-3 text-center text-[#315648]"><div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Stake sealed</div><div className="font-['Space_Mono'] text-3xl font-black">{lockedScore}</div></div><div className="grid grid-cols-1 gap-2.5">{challenge.options.map((opt,idx)=><button key={idx} onClick={()=>handleSelectOption(idx)} className="flex items-center gap-3 rounded-xl border-[3px] border-[#65442c] bg-[#fdf8e8] p-3 text-left font-['Cinzel'] text-xs font-bold text-[#30434a] shadow-[0_3px_0_#65442c] hover:bg-[#d9efdf]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2fa8ae] font-['Space_Mono'] text-white">{String.fromCharCode(65+idx)}</span>{opt}</button>)}</div></div>}
          </div>
        </div>
      </ApparatusFrame>
    </div>
  );
};
