import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { TurnTimerSeconds } from '../../types';
import { tickTurnTimer } from '../../game/timer';

interface Props { seconds: TurnTimerSeconds; paused: boolean; resetKey: string; onPausedChange: (paused:boolean)=>void; onExpire:()=>void }

export const TurnTimer: React.FC<Props> = ({ seconds, paused, resetKey, onPausedChange, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [announcement, setAnnouncement] = useState('');
  const previousPaused = useRef(paused);
  const resetToken = `${resetKey}:${seconds}`;
  const appliedResetToken = useRef(resetToken);
  const expiredResetToken = useRef<string | null>(null);
  const resetPending = appliedResetToken.current !== resetToken;
  useEffect(() => {
    appliedResetToken.current = resetToken;
    setRemaining(seconds);
  }, [resetToken, seconds]);
  useEffect(() => {
    if (!seconds || paused || remaining <= 0) return;
    const id = window.setInterval(() => setRemaining(value => tickTurnTimer(value, paused)), 1000);
    return () => window.clearInterval(id);
  }, [paused, remaining, seconds]);
  useEffect(() => {
    if (!seconds || remaining !== 0 || resetPending || expiredResetToken.current === resetToken) return;
    expiredResetToken.current = resetToken;
    onExpire();
  }, [onExpire, remaining, resetPending, resetToken, seconds]);
  useEffect(() => {
    if (previousPaused.current !== paused) {
      setAnnouncement(paused ? `Timer paused at ${remaining} seconds.` : `Timer resumed with ${remaining} seconds remaining.`);
      previousPaused.current = paused;
      return;
    }
    if ([10, 5, 0].includes(remaining)) setAnnouncement(remaining ? `${remaining} seconds remaining.` : 'Time expired.');
  }, [paused, remaining]);
  if (!seconds) return null;
  const urgent = remaining <= 10;
  return <><div role="timer" aria-label={`${remaining} seconds remaining${paused?', paused':''}`} className={`fixed bottom-3 right-3 z-40 flex items-center gap-2 rounded-xl border-[3px] border-[#65442c] px-3 py-2 shadow-[0_4px_0_#65442c] ${urgent?'bg-[#d9644f] text-white':'bg-[#f3d66d] text-[#4f3a28]'}`}><span className="font-['Space_Mono'] text-xl font-black">{remaining}s</span><button type="button" aria-label={paused?'Resume turn timer':'Pause turn timer'} onClick={()=>onPausedChange(!paused)} className="bureau-button rounded-lg bg-[#fff7df] p-2 text-[#244b55]">{paused?<Play size={15}/>:<Pause size={15}/>}</button></div><div className="sr-only" role="status" aria-live={urgent?'assertive':'polite'} aria-atomic="true">{announcement}</div></>;
};
