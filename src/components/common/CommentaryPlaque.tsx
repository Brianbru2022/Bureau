import React, { useEffect, useRef } from 'react';
import { sound } from '../../sound/audioEngine';
import { CheckCircle2, XCircle, FileText, ArrowRight, RotateCcw } from 'lucide-react';
import { generateBureauAssessment, type BureauPlayerHistory } from '../../data/commentaryEngine';
import { sourceReference } from '../../data/sourceAuthorities';

interface CommentaryPlaqueProps {
  score: number;
  playerName: string;
  roundType: string;
  questionPrompt?: string;
  explanation: string;
  source?: string;
  playerAnswer?: string | number;
  correctAnswer?: string | number;
  errorKm?: number;
  errorPercent?: number;
  riskedValue?: number;
  isCorrect?: boolean;
  history?: BureauPlayerHistory;
  currentTotal?: number;
  officePoliticsConsequence?: string;
  adjudicationReason?: string;
  onUndoLastRuling?: () => void;
  onProceed: () => void;
}

export const CommentaryPlaque: React.FC<CommentaryPlaqueProps> = ({
  score,
  playerName,
  roundType,
  questionPrompt,
  explanation,
  source,
  playerAnswer,
  correctAnswer,
  errorKm,
  errorPercent,
  riskedValue,
  isCorrect = true,
  history,
  currentTotal,
  officePoliticsConsequence,
  adjudicationReason,
  onUndoLastRuling,
  onProceed
}) => {
  const proceedButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sound.playStamp();
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    proceedButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable: HTMLElement[] = [...dialogRef.current.querySelectorAll<HTMLElement>('button, summary, a[href], [tabindex]:not([tabindex="-1"])')].filter(element => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const assessment = generateBureauAssessment({
    score,
    playerName,
    roundType,
    questionPrompt,
    playerAnswer,
    correctAnswer,
    explanation,
    errorKm,
    errorPercent,
    riskedValue,
    isCorrect,
    history
  });

  const hasAnswerComparison = playerAnswer !== undefined || correctAnswer !== undefined;
  const sourceReferences = source?.split(';').map(citation=>sourceReference(citation.trim())).filter(reference=>reference.citation)??[];

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[#183138]/70 p-3 backdrop-blur-sm sm:p-6" role="presentation">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="bureau-finding-title" className="w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[24px] border-[4px] border-[#6e4b31] bg-[#f5e8c9] shadow-[0_10px_0_#5a3925,0_24px_40px_rgba(57,35,20,.45)] font-['Plus_Jakarta_Sans'] animate-in fade-in zoom-in-95 duration-300 bureau-scrollbar">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#6e4b31] bg-[#2f9ea5] px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-2">
          <FileText size={20} />
          <span id="bureau-finding-title" className="font-['Cinzel'] text-sm font-black uppercase tracking-widest sm:text-base">Bureau Finding</span>
        </div>
        <div className="flex items-center gap-3"><img src="/assets/generated-v2/finding-press.webp" alt="" aria-hidden="true" className="hidden h-10 w-10 rounded-lg border-2 border-[#6e4b31] bg-[#f5e8c9] object-cover mix-blend-multiply sm:block"/><span className="font-['Courier_Prime'] text-xs">Candidate: <strong>{playerName}</strong></span></div>
      </div>

      <div className="relative flex flex-col gap-4 bg-[#fff8e7] p-4 text-[#30434a] sm:p-6">
        <img src="/assets/generated-v2/finding-press.webp" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-0 h-72 opacity-[0.07] mix-blend-multiply"/>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#d4bd8c] pb-4">
          <div>
            <span className="block font-['Courier_Prime'] text-[10px] font-black uppercase tracking-wider text-[#7b6248]">Points certified</span>
            <span className="font-['Space_Mono'] text-4xl font-black text-[#30434a]">+{score.toLocaleString()}</span>
            {currentTotal !== undefined && <span className="ml-3 font-['Courier_Prime'] text-xs font-bold text-[#725b46]">New total {currentTotal.toLocaleString()}</span>}
          </div>
          <div className={`-rotate-3 rounded-lg border-[3px] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest ${
            isCorrect
              ? score >= 800
                ? 'border-[#29795f] bg-[#d9efdf] text-[#23634e]'
                : 'border-[#ad7b2d] bg-[#f8e6ab] text-[#76541e]'
              : 'border-[#a74339] bg-[#f5d4cb] text-[#873a33]'
          }`}>
            <span className="flex items-center gap-1.5">
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? (score >= 800 ? 'DISTURBINGLY GOOD' : 'ACCEPTED') : 'REALITY DISAGREES'}
            </span>
          </div>
        </div>

        {hasAnswerComparison && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {playerAnswer !== undefined && (
              <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#f0d36f] p-3 shadow-[0_4px_0_#6e4b31]">
                <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#725131]">Submitted</span>
                <div className="mt-1 break-words font-['Fraunces'] text-base font-bold text-[#3c4b4f]">{String(playerAnswer)}</div>
              </div>
            )}
            {correctAnswer !== undefined && (
              <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#a9d6c5] p-3 shadow-[0_4px_0_#6e4b31]">
                <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#456351]">Certified answer</span>
                <div className="mt-1 break-words font-['Fraunces'] text-base font-bold text-[#30434a]">{String(correctAnswer)}</div>
              </div>
            )}
          </div>
        )}

        <details className="rounded-xl border-l-[6px] border-[#d19b3b] bg-[#f2e6c8] p-4">
          <summary className="cursor-pointer font-['Cinzel'] text-xs font-black uppercase tracking-wider text-[#6a4d22]">Archival record and source</summary>
          <p className="mt-2 font-['Fraunces'] text-sm leading-relaxed text-[#51483e] sm:text-base">{explanation}</p>
          {sourceReferences.length?<ul aria-label="Filed sources" className="mt-2 space-y-1 font-['Courier_Prime'] text-[10px] italic text-[#81715e]">{sourceReferences.map((reference,index)=><li key={`${reference.citation}-${index}`}><strong className="not-italic">Source {sourceReferences.length>1?index+1:''}:</strong> {reference.citation}{reference.url?<span className="block break-all not-italic text-[#376d9b]">{reference.url}</span>:<span className="ml-1 not-italic">(bibliographic record)</span>}</li>)}</ul>:null}
        </details>

        {officePoliticsConsequence && <div className="rounded-xl border-2 border-[#7a5a87] bg-[#eadcf0] p-3 font-['Courier_Prime'] text-xs text-[#5d4268]"><strong className="block uppercase tracking-widest">Office Politics</strong>{officePoliticsConsequence}</div>}

        {adjudicationReason&&onUndoLastRuling&&<div role="status" className="rounded-xl border-2 border-[#8b704f] bg-[#eee0ba] p-3 font-['Courier_Prime'] text-xs text-[#654530]"><strong>Registry basis:</strong> {adjudicationReason}<button type="button" onClick={onUndoLastRuling} className="bureau-button mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#65442c] bg-[#376d9b] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"><RotateCcw size={14}/>Undo latest ruling</button></div>}

        <div className="rounded-xl border-[3px] border-[#6e4b31] bg-[#334d55] p-4 text-[#fff4d2] shadow-[0_5px_0_#6e4b31]">
          <span className="mb-1 block font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.18em] text-[#f0cf68]">Supervisor's finding</span>
          <p className="font-['Fraunces'] text-sm leading-relaxed sm:text-base">{assessment}</p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            ref={proceedButtonRef}
            onClick={() => { sound.playClick(); onProceed(); }}
            className="flex items-center gap-2 rounded-xl border-[3px] border-[#6e4b31] bg-[#e55f50] px-6 py-3 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white shadow-[0_5px_0_#6e4b31] active:translate-y-1 active:shadow-none"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};
