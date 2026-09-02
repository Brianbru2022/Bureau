import { useState } from 'react';
import { ArrowUpDown, Check, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import type { Player, RankItChallenge } from '../../types';
import { scoreRanking } from '../../game/scoring';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface RankItProps {
  challenge: RankItChallenge;
  currentPlayer: Player;
  onComplete: (score: number) => void;
}

export const RankItRound = ({ challenge, currentPlayer, onComplete }: RankItProps) => {
  const [itemsOrder, setItemsOrder] = useState(() => [...challenge.items].sort(() => Math.random() - 0.5));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);
  const [moveAnnouncement, setMoveAnnouncement] = useState('');

  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= itemsOrder.length) return;
    const next = [...itemsOrder];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItemsOrder(next);
    setMoveAnnouncement(`${moved.label} moved to position ${to + 1} of ${next.length}.`);
    sound.playDepartmentCue('RANK_IT', 'MOVE');
  };

  const confirm = () => {
    sound.playDepartmentCue('RANK_IT', 'RESULT');
    setEarnedScore(scoreRanking(itemsOrder));
    setIsSubmitted(true);
  };

  const submittedOrder = itemsOrder.map(item => item.label).join(' → ');
  const certifiedItems = [...challenge.items].sort((a, b) => a.correctRank - b.correctRank);
  const certifiedOrder = certifiedItems.map(item => item.label).join(' → ');

  if (isSubmitted) {
    return (
      <div className="space-y-5">
        <ApparatusFrame state="RESULT" compact eyebrow="Sequential Registry • Certified Rail Order" title="Correct Filing Sequence" icon={<ArrowUpDown size={28}/>} accent="#4c82c3" instrumentLabel="SORTER LOCKED">
          <div className="grid gap-2 sm:grid-cols-2">
            {certifiedItems.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border-[3px] border-[#65442c] bg-[#fff7dc] p-3 text-[#30434a] shadow-[0_3px_0_#65442c]"><strong className="font-['Cinzel']">#{item.correctRank} {item.label}</strong><span className="font-['Courier_Prime'] text-[10px] text-[#705744]">{item.detail}</span></div>)}
          </div>
        </ApparatusFrame>
        <CommentaryPlaque score={earnedScore} playerName={currentPlayer.name} roundType="RANK_IT" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} playerAnswer={submittedOrder} correctAnswer={certifiedOrder} history={currentPlayer.stats} isCorrect={earnedScore >= 600} onProceed={() => onComplete(earnedScore)}/>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl font-['Plus_Jakarta_Sans']">
      <ApparatusFrame compact state="ACTIVE" eyebrow="Sequential Registry • Brass Sorting Rail" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, drag the plaques or use the move controls until the filing sequence is correct.</>} icon={<ArrowUpDown size={28}/>} accent="#4c82c3" instrumentLabel="ORDER RAIL">
        <div className="rounded-[22px] border-[5px] border-[#65442c] bg-[#4c82c3] p-3 shadow-[inset_0_0_0_5px_#8db4df,0_8px_0_#65442c] sm:p-4">
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{moveAnnouncement}</div>
          <div className="relative rounded-[18px] border-[4px] border-[#65442c] bg-[#e9ddbb] p-3 shadow-inner">
            <div className="space-y-2">
              {itemsOrder.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                  onDragOver={event => { event.preventDefault(); setDropIndex(index); }}
                  onDrop={() => { if (dragIndex !== null) moveTo(dragIndex, index); setDragIndex(null); setDropIndex(null); }}
                  role="group"
                  aria-label={`${item.label}, position ${index + 1} of ${itemsOrder.length}`}
                  className={`bureau-sort-carriage relative z-10 flex items-center justify-between gap-3 rounded-xl border-[3px] border-[#65442c] bg-[#fff8df] p-2 shadow-[0_3px_0_#65442c] ${dragIndex === index ? 'opacity-50' : ''} ${dropIndex===index&&dragIndex!==index?'bureau-sort-carriage--drop':''}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <GripVertical aria-hidden="true" className="cursor-grab text-[#8b6b4b]" size={20}/>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#65442c] bg-[#e65d4e] font-['Space_Mono'] font-black text-white">{index + 1}</span>
                    <span className="font-['Cinzel'] text-sm font-black text-[#30434a]">{item.label}</span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => moveTo(index, index - 1)} className="bureau-button rounded-lg border-2 border-[#65442c] bg-[#f3d66d] p-2 text-[#65442c] shadow-[0_2px_0_#65442c] disabled:opacity-30"><ChevronUp size={18}/></button>
                    <button type="button" aria-label={`Move ${item.label} down`} disabled={index === itemsOrder.length - 1} onClick={() => moveTo(index, index + 1)} className="bureau-button rounded-lg border-2 border-[#65442c] bg-[#2fa8ae] p-2 text-white shadow-[0_2px_0_#65442c] disabled:opacity-30"><ChevronDown size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={confirm} className="bureau-button mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#e65d4e] px-8 py-3 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_0_#65442c]"><Check size={17}/> Lock Rail Order</button>
        </div>
      </ApparatusFrame>
    </div>
  );
};
