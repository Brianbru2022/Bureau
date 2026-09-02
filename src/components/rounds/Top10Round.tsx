import React, { useMemo, useState } from 'react';
import { Top10Challenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Layers, Send } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { clampScore, getTop10ItemScores } from '../../game/scoring';
import { findAnswerMatch } from '../../game/answerMatching';
import { HostAdjudicationPanel } from '../common/HostAdjudicationPanel';
import { AdjudicationReceipt } from '../common/AdjudicationReceipt';
import type { AdjudicationRecord } from '../../types';

interface Top10RoundProps {
  challenge: Top10Challenge;
  players: Player[];
  currentPlayerIndex: number;
  onCompleteRound: (playerScores: Record<string, number>) => void;
  onAdjudication: (record: Omit<AdjudicationRecord,'challengeId'|'recordedAt'>) => void;
  onUndoAdjudication: () => void;
}

interface Top10Snapshot { revealedRanks:number[]; inputValue:string; turnIndex:number; strikesByPlayer:Record<string,number>; playerRoundScores:Record<string,number>; message:string|null; isRoundOver:boolean; pendingAnswer:string|null }

export const Top10Round: React.FC<Top10RoundProps> = ({ challenge, players, currentPlayerIndex: initialTurnIdx, onCompleteRound, onAdjudication, onUndoAdjudication }) => {
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [turnIndex, setTurnIndex] = useState(initialTurnIdx);
  const livesPerPlayer = 3;
  const [strikesByPlayer, setStrikesByPlayer] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [playerRoundScores, setPlayerRoundScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [message, setMessage] = useState<string | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [pendingAnswer,setPendingAnswer]=useState<string|null>(null);
  const [lastRuling,setLastRuling]=useState<{reason:string;snapshot:Top10Snapshot}|null>(null);
  const itemScores = useMemo(() => getTop10ItemScores(challenge, players.length), [challenge, players.length]);
  const activePlayer = players[turnIndex % (players.length || 1)] || players[0];
  if (!activePlayer) return null;

  const nextActivePlayerIndex = (fromIndex: number, strikes: Record<string, number>) => {
    for (let step = 1; step <= players.length; step += 1) {
      const candidateIndex = (fromIndex + step) % players.length;
      if ((strikes[players[candidateIndex].id] || 0) < livesPerPlayer) return candidateIndex;
    }
    return -1;
  };

  const snapshot=():Top10Snapshot=>({revealedRanks:[...revealedRanks],inputValue,turnIndex,strikesByPlayer:{...strikesByPlayer},playerRoundScores:{...playerRoundScores},message,isRoundOver,pendingAnswer});
  const undoLastRuling=()=>{if(!lastRuling)return;const prior=lastRuling.snapshot;setRevealedRanks(prior.revealedRanks);setInputValue(prior.inputValue);setTurnIndex(prior.turnIndex);setStrikesByPlayer(prior.strikesByPlayer);setPlayerRoundScores(prior.playerRoundScores);setMessage(prior.message);setIsRoundOver(prior.isRoundOver);setPendingAnswer(prior.pendingAnswer);setLastRuling(null);onUndoAdjudication();};

  const acceptMatch = (match:Top10Challenge['items'][number],submitted:string,decision:'AUTOMATIC'|'HOST_ACCEPTED'|'HOST_EDITED',reason:string) => {
      setLastRuling({reason,snapshot:snapshot()});
      sound.playDepartmentCue('TOP_10', 'ACCEPTED');
      const scored = itemScores[match.rank] ?? 0;
      setRevealedRanks(prev => [...prev, match.rank]);
      setPlayerRoundScores(prev => ({ ...prev, [activePlayer.id]: clampScore((prev[activePlayer.id] || 0) + scored) }));
      setMessage(`#${match.rank} ${match.name} — shutter released, +${scored}`);
      setInputValue('');
      setPendingAnswer(null);
      onAdjudication({playerId:activePlayer.id,submittedAnswer:submitted,acceptedAnswer:match.name,decision,reason});
      if (revealedRanks.length + 1 >= challenge.items.length) {
        sound.playDepartmentCue('TOP_10', 'RESULT');
        setIsRoundOver(true);
        return;
      }
      const nextIndex = nextActivePlayerIndex(turnIndex, strikesByPlayer);
      if (nextIndex >= 0) setTurnIndex(nextIndex);
  };
  const rejectAnswer = (submitted:string) => {
      const reason='The host rejected the unmatched answer after reviewing the filed options.';
      setLastRuling({reason,snapshot:snapshot()});
      const newStrikes = Math.min(livesPerPlayer, (strikesByPlayer[activePlayer.id] || 0) + 1);
      sound.playDepartmentCue('TOP_10', newStrikes >= livesPerPlayer ? 'ELIMINATED' : 'REJECTED');
      const updatedStrikes = { ...strikesByPlayer, [activePlayer.id]: newStrikes };
      setStrikesByPlayer(updatedStrikes);
      setMessage(newStrikes >= livesPerPlayer
        ? `Registry rejected “${submitted}”. ${activePlayer.name} has lost all three lives and is eliminated.`
        : `Registry rejected “${submitted}”. ${activePlayer.name} has ${livesPerPlayer - newStrikes} ${livesPerPlayer - newStrikes === 1 ? 'life' : 'lives'} remaining.`);
      setInputValue('');
      setPendingAnswer(null);
      onAdjudication({playerId:activePlayer.id,submittedAnswer:submitted,decision:'HOST_REJECTED',reason});
      const nextIndex = nextActivePlayerIndex(turnIndex, updatedStrikes);
      if (nextIndex < 0) {
        setIsRoundOver(true);
        return;
      }
      setTurnIndex(nextIndex);
  };
  const handleGuessSubmit = (e?: React.FormEvent) => {
    e?.preventDefault(); const raw=inputValue.trim(); if(!raw)return;
    const available=challenge.items.filter(item=>!revealedRanks.includes(item.rank));
    const result=findAnswerMatch(raw,available);
    const match=result.candidate as Top10Challenge['items'][number]|null;
    if(match) acceptMatch(match,raw,'AUTOMATIC',result.reason); else setPendingAnswer(raw);
  };

  const revealedNames = challenge.items.filter(item => revealedRanks.includes(item.rank)).map(item => item.name);
  const allNames = challenge.items.map(item => item.name);
  const hasEliminationOutcome = message?.includes('is eliminated.') ?? false;

  return (
    <div className="w-full max-w-6xl mx-auto font-['Plus_Jakarta_Sans']">
      {!isRoundOver ? (
        <ApparatusFrame eliminated={hasEliminationOutcome} state={pendingAnswer?'PROCESSING':message?.includes('rejected')?'REJECTED':message?'ACCEPTED':'ACTIVE'} eyebrow="Hall of Records • Mechanical Ledger No. 10" title={challenge.prompt} subtitle="Name a valid entry. The obscure shutters are considerably more expensive." icon={<Layers size={28} />} accent="#e28a45" instrumentLabel="FLIP REGISTER">
          <div className="bureau-top10-layout grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            <div className="bureau-top10-board rounded-2xl border-[4px] border-[#63452e] bg-[#315760] p-4 shadow-[inset_0_0_0_4px_#78c4c5,0_8px_0_#63452e]">
              <div className="bureau-top10-board-header mb-4 flex items-center justify-between rounded-xl border-2 border-[#68472f] bg-[#f5d56e] px-4 py-2 text-[#513922] shadow-[0_4px_0_#68472f]">
                <span className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.2em]">Ten-position archival shutter board</span>
                <div className="flex items-center gap-1.5" aria-label={`${livesPerPlayer - (strikesByPlayer[activePlayer.id] || 0)} lives remaining`}>
                  {Array.from({ length: livesPerPlayer }).map((_, i) => <span key={i} aria-hidden="true" className={`bureau-life-lamp ${i < livesPerPlayer - (strikesByPlayer[activePlayer.id] || 0) ? 'bureau-life-lamp--live' : 'bureau-life-lamp--lost'}`}/>)}
                </div>
              </div>

              <div className="bureau-top10-grid grid grid-cols-1 md:grid-cols-2 gap-3">
                {challenge.items.map(item => {
                  const open = revealedRanks.includes(item.rank);
                  return (
                    <div key={item.rank} className={`bureau-shutter ${open ? 'bureau-shutter--open' : ''}`}>
                      <div className="bureau-shutter-rank"><span>{item.rank}</span><small>FILE</small></div>
                      <div className="bureau-shutter-window">
                        {open ? (
                          <div className="bureau-shutter-reveal">
                            <div className="min-w-0"><span className="bureau-shutter-status">Registry confirmed</span><div className="font-['Cinzel'] text-sm font-black text-[#263f48]">{item.name}</div></div>
                            <div className="shrink-0 text-right font-['Courier_Prime'] text-xs font-bold text-[#765a3c]">{item.detail}<br/><strong className="text-[#c74f43]">{itemScores[item.rank]} PTS</strong></div>
                          </div>
                        ) : (
                          <div className="bureau-shutter-closed" aria-label={`Rank ${item.rank}, sealed`}>
                            <span className="bureau-shutter-lamp" />
                            <div className="bureau-shutter-slats">{Array.from({ length: 5 }).map((_, i) => <span key={i} />)}</div>
                            <div className="bureau-shutter-handle"><i /><strong>CLASSIFIED</strong><i /></div>
                            <span className="bureau-shutter-lamp" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="bureau-top10-control rounded-2xl border-[4px] border-[#6a4930] bg-[#f7edcf] p-4 shadow-[0_7px_0_#6a4930]">
              <div className="bureau-top10-active mb-4 flex items-center gap-3 rounded-xl border-2 border-[#68472f] bg-[#55b7b5] p-3 text-white shadow-[0_4px_0_#68472f]">
                <span className="text-3xl">{activePlayer.avatar}</span>
                <div><div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">At the registry microphone</div><div className="font-['Cinzel'] font-black">{activePlayer.name}</div></div>
              </div>
              {message && <div role="status" aria-live="assertive" className="mb-4 rounded-lg border-2 border-[#bb7640] bg-[#fff1b8] p-3 font-['Courier_Prime'] text-xs text-[#654530]">{message}</div>}
              {lastRuling&&!pendingAnswer&&<AdjudicationReceipt reason={lastRuling.reason} onUndo={undoLastRuling}/>} 
              {pendingAnswer?<HostAdjudicationPanel submittedAnswer={pendingAnswer} suggestions={challenge.items.filter(item=>!revealedRanks.includes(item.rank)).map(item=>item.name)} onAccept={(answer,edited)=>{const result=findAnswerMatch(answer,challenge.items.filter(item=>!revealedRanks.includes(item.rank)));const match=result.candidate as Top10Challenge['items'][number]|null;const decision=edited?'HOST_EDITED':'HOST_ACCEPTED';if(match)acceptMatch(match,pendingAnswer,decision,edited?`Host edited the entry to ${match.name} and accepted it.`:`Host accepted the unmatched entry as ${match.name}.`);else{const reason=edited?'The host edited and accepted an answer outside the ranked register.':'The host accepted an answer outside the ranked register.';setLastRuling({reason,snapshot:snapshot()});setMessage(`Host accepted “${answer}” as an unlisted valid answer. No ranked shutter was attached.`);onAdjudication({playerId:activePlayer.id,submittedAnswer:pendingAnswer,acceptedAnswer:answer,decision,reason});setPendingAnswer(null);setInputValue('');const next=nextActivePlayerIndex(turnIndex,strikesByPlayer);if(next>=0)setTurnIndex(next);}}} onReject={()=>rejectAnswer(pendingAnswer)}/>:<form onSubmit={handleGuessSubmit} className="flex flex-col gap-3">
                <label className="block rounded-md border border-[#c8aa73] bg-[#ead9b3] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase leading-tight tracking-[.12em] text-[#6b4a34]">Speak, then type for the machinery</label>
                <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter an item…" aria-label="Top 10 answer" className="min-h-11 w-full rounded-xl border-[3px] border-[#6a4930] bg-[#fffaf0] px-4 py-3 text-base font-semibold text-[#263b48] outline-none focus:border-[#1e9fa8]" />
                <button disabled={!inputValue.trim()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#6a4930] bg-[#e65d4e] py-3 font-['Cinzel'] text-xs font-black uppercase tracking-wider text-white shadow-[0_5px_0_#6a4930] active:translate-y-1 active:shadow-none disabled:opacity-40"><Send size={16}/> Release Shutter</button>
              </form>}
              <div className="bureau-top10-candidates mt-5 border-t-2 border-dashed border-[#b99a68] pt-4 space-y-2">
                {players.map(p => { const livesLeft = livesPerPlayer - (strikesByPlayer[p.id] || 0); return <div key={p.id} className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-xs text-[#344a51] ${livesLeft > 0 ? 'border-[#b99a68] bg-[#ead9b3]' : 'border-[#9d6d5f] bg-[#d6c7aa] opacity-75'}`}><span className="font-['Cinzel'] font-bold">{p.name}{livesLeft === 0 && <small className="ml-2 rounded bg-[#a9443d] px-1.5 py-0.5 font-['Courier_Prime'] text-xs uppercase text-white">Eliminated</small>}</span><span className="flex items-center gap-3"><span className="flex gap-1" aria-label={`${livesLeft} lives remaining`}>{Array.from({ length: livesPerPlayer }).map((_, i) => <span key={i} aria-hidden="true" className={`bureau-life-lamp bureau-life-lamp--small ${i < livesLeft ? 'bureau-life-lamp--live' : 'bureau-life-lamp--lost'}`}/>)}</span><strong className="font-['Space_Mono']">{playerRoundScores[p.id] || 0}</strong></span></div>; })}
              </div>
            </aside>
          </div>
        </ApparatusFrame>
      ) : (
        <div className="space-y-5">
          <ApparatusFrame state="RESULT" eyebrow="Hall of Records • Board fully opened" title="Complete Registry" subtitle="The Bureau reveals the answers only after they can no longer help you." icon={<Layers size={28}/>} accent="#e28a45" instrumentLabel="ARCHIVE OPEN">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{challenge.items.map(item => <div key={item.rank} className="flex justify-between rounded-xl border-2 border-[#6a4930] bg-[#fff7dd] px-4 py-3 text-[#314750] shadow-[0_3px_0_#6a4930]"><strong className="font-['Cinzel']">#{item.rank} {item.name}</strong><span className="font-['Space_Mono'] text-sm font-bold text-[#c85348]">{itemScores[item.rank]}</span></div>)}</div>
          </ApparatusFrame>
          <CommentaryPlaque score={Math.max(0, ...(Object.values(playerRoundScores) as number[]))} playerName="Candidates" roundType="TOP_10" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={`${revealedRanks.length}/${challenge.items.length} found: ${revealedNames.join(', ') || 'none'}`} correctAnswer={allNames.join(', ')} isCorrect={revealedRanks.length >= Math.ceil(challenge.items.length / 2)} adjudicationReason={lastRuling?.reason} onUndoLastRuling={lastRuling?undoLastRuling:undefined} onProceed={() => onCompleteRound(playerRoundScores)} />
        </div>
      )}
    </div>
  );
};
