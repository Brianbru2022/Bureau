import React, { useMemo, useState } from 'react';
import { Top10Challenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Layers, Send } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { getTop10ItemScores } from '../../game/scoring';

interface Top10RoundProps {
  challenge: Top10Challenge;
  players: Player[];
  currentPlayerIndex: number;
  onCompleteRound: (playerScores: Record<string, number>) => void;
}

export const Top10Round: React.FC<Top10RoundProps> = ({ challenge, players, currentPlayerIndex: initialTurnIdx, onCompleteRound }) => {
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [turnIndex, setTurnIndex] = useState(initialTurnIdx);
  const [strikes, setStrikes] = useState(0);
  const maxStrikes = Math.max(3, players.length * 2);
  const [playerRoundScores, setPlayerRoundScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [message, setMessage] = useState<string | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const itemScores = useMemo(() => getTop10ItemScores(challenge), [challenge]);
  const activePlayer = players[turnIndex % (players.length || 1)] || players[0];
  if (!activePlayer) return null;

  const handleGuessSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) return;
    const match = challenge.items.find(item => !revealedRanks.includes(item.rank) && (
      item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()) ||
      item.aliases.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()))
    ));

    if (match) {
      sound.playBrassChime();
      const scored = itemScores[match.rank] ?? 0;
      setRevealedRanks(prev => [...prev, match.rank]);
      setPlayerRoundScores(prev => ({ ...prev, [activePlayer.id]: (prev[activePlayer.id] || 0) + scored }));
      setMessage(`#${match.rank} ${match.name} — shutter released, +${scored}`);
      setInputValue('');
      if (revealedRanks.length + 1 >= challenge.items.length) {
        sound.playStamp();
        setIsRoundOver(true);
        return;
      }
    } else {
      sound.playDisapproval();
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage(`Registry rejected “${inputValue}”. Strike ${newStrikes}/${maxStrikes}.`);
      setInputValue('');
      if (newStrikes >= maxStrikes) {
        setIsRoundOver(true);
        return;
      }
    }
    setTurnIndex(prev => prev + 1);
  };

  const revealedNames = challenge.items.filter(item => revealedRanks.includes(item.rank)).map(item => item.name);
  const allNames = challenge.items.map(item => item.name);

  return (
    <div className="w-full max-w-6xl mx-auto font-['Plus_Jakarta_Sans']">
      {!isRoundOver ? (
        <ApparatusFrame eyebrow="Hall of Records • Mechanical Ledger No. 10" title={challenge.prompt} subtitle="Name a valid entry. The obscure shutters are considerably more expensive." icon={<Layers size={28} />} accent="#e28a45" instrumentLabel="FLIP REGISTER">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            <div className="rounded-2xl border-[4px] border-[#63452e] bg-[#315760] p-4 shadow-[inset_0_0_0_4px_#78c4c5,0_8px_0_#63452e]">
              <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-[#68472f] bg-[#f5d56e] px-4 py-2 text-[#513922] shadow-[0_4px_0_#68472f]">
                <span className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.2em]">Ten-position archival shutter board</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: maxStrikes }).map((_, i) => <span key={i} className={`h-3.5 w-3.5 rounded-full border-2 border-[#583a29] ${i < strikes ? 'bg-[#e65b4b]' : 'bg-[#efe1bc]'}`} />)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challenge.items.map(item => {
                  const open = revealedRanks.includes(item.rank);
                  return (
                    <div key={item.rank} className="relative min-h-16 overflow-hidden rounded-xl border-[3px] border-[#5e402d] bg-[#e8d7ae] shadow-[0_5px_0_#5e402d]">
                      <div className="absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r-[3px] border-[#5e402d] bg-[#e75e4f] font-['Space_Mono'] text-lg font-black text-white">{item.rank}</div>
                      <div className={`ml-12 h-full min-h-16 px-4 py-2 transition-all duration-500 ${open ? 'bg-[#fff7dc]' : 'bg-[#294b55]'}`}>
                        {open ? (
                          <div className="flex h-full items-center justify-between gap-3">
                            <div className="font-['Cinzel'] text-sm font-black text-[#2b4048]">{item.name}</div>
                            <div className="text-right font-['Courier_Prime'] text-[9px] font-bold text-[#765a3c]">{item.detail}<br/><strong className="text-[#c74f43]">{itemScores[item.rank]} PTS</strong></div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-between">
                            <div className="flex gap-1">{Array.from({ length: 7 }).map((_, i) => <span key={i} className="h-7 w-2 rounded-sm border border-[#6b4a34] bg-[#f2ce69] shadow-inner" />)}</div>
                            <span className="font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest text-[#cfe7df]">sealed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-2xl border-[4px] border-[#6a4930] bg-[#f7edcf] p-4 shadow-[0_7px_0_#6a4930]">
              <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-[#68472f] bg-[#55b7b5] p-3 text-white shadow-[0_4px_0_#68472f]">
                <span className="text-3xl">{activePlayer.avatar}</span>
                <div><div className="font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest">At the registry microphone</div><div className="font-['Cinzel'] font-black">{activePlayer.name}</div></div>
              </div>
              {message && <div className="mb-4 rounded-lg border-2 border-[#bb7640] bg-[#fff1b8] p-3 font-['Courier_Prime'] text-xs text-[#654530]">{message}</div>}
              <form onSubmit={handleGuessSubmit} className="space-y-3">
                <label className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-widest text-[#6b4a34]">Speak, then type for the machinery</label>
                <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter an item…" className="w-full rounded-xl border-[3px] border-[#6a4930] bg-[#fffaf0] px-4 py-3 text-base font-semibold text-[#263b48] outline-none focus:border-[#1e9fa8]" />
                <button disabled={!inputValue.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#6a4930] bg-[#e65d4e] py-3 font-['Cinzel'] text-xs font-black uppercase tracking-wider text-white shadow-[0_5px_0_#6a4930] active:translate-y-1 active:shadow-none disabled:opacity-40"><Send size={16}/> Release Shutter</button>
              </form>
              <div className="mt-5 border-t-2 border-dashed border-[#b99a68] pt-4 space-y-2">
                {players.map(p => <div key={p.id} className="flex justify-between rounded-lg bg-[#ead9b3] px-3 py-2 text-xs text-[#344a51]"><span className="font-['Cinzel'] font-bold">{p.name}</span><strong className="font-['Space_Mono']">{playerRoundScores[p.id] || 0}</strong></div>)}
              </div>
            </aside>
          </div>
        </ApparatusFrame>
      ) : (
        <div className="space-y-5">
          <ApparatusFrame eyebrow="Hall of Records • Board fully opened" title="Complete Registry" subtitle="The Bureau reveals the answers only after they can no longer help you." icon={<Layers size={28}/>} accent="#e28a45" instrumentLabel="ARCHIVE OPEN">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{challenge.items.map(item => <div key={item.rank} className="flex justify-between rounded-xl border-2 border-[#6a4930] bg-[#fff7dd] px-4 py-3 text-[#314750] shadow-[0_3px_0_#6a4930]"><strong className="font-['Cinzel']">#{item.rank} {item.name}</strong><span className="font-['Space_Mono'] text-sm font-bold text-[#c85348]">{itemScores[item.rank]}</span></div>)}</div>
          </ApparatusFrame>
          <CommentaryPlaque score={Math.max(0, ...Object.values(playerRoundScores))} playerName="Candidates" roundType="TOP_10" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={`${revealedRanks.length}/${challenge.items.length} found: ${revealedNames.join(', ') || 'none'}`} correctAnswer={allNames.join(', ')} isCorrect={revealedRanks.length >= Math.ceil(challenge.items.length / 2)} onProceed={() => onCompleteRound(playerRoundScores)} />
        </div>
      )}
    </div>
  );
};
