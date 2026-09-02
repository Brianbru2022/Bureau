import { useEffect, useState } from 'react';
import { Check, CircleHelp, LoaderCircle, Send, X } from 'lucide-react';
import type { DispatchBoxChallenge, Player, RoundVisualState, ScorePaceProfile } from '../../types';
import { DISPATCH_BOX_ART } from '../../data/promotedVisualAssets';
import { dispatchTotal, scoreDispatchAnswer } from '../../game/dispatchBox';
import { PRESENTATION_TIMING, motionDuration } from '../../game/presentation';
import { markArtworkUnavailable } from '../../game/visualState';
import { sound } from '../../sound/audioEngine';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { paceScoreNote } from '../../game/scorePacing';

interface Props { challenge: DispatchBoxChallenge; currentPlayer: Player; scorePaceProfile?: ScorePaceProfile; onComplete: (score: number) => void }
interface AnswerRecord { selectedIndex: number; correct: boolean; elapsedMs: number; score: number }
interface PendingAnswer { record: AnswerRecord; allAnswers: AnswerRecord[]; isLast: boolean }
interface Resolution { score: number; answers: AnswerRecord[]; correctCount: number }

export const DispatchBoxRound = ({ challenge, currentPlayer, scorePaceProfile = 'STANDARD', onComplete }: Props) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => performance.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [pending, setPending] = useState<PendingAnswer | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const question = challenge.questions[questionIndex];

  useEffect(() => {
    if (visualState !== 'ACTIVE') return undefined;
    const update = () => setElapsedMs(performance.now() - questionStartedAt);
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [questionStartedAt, visualState]);

  useEffect(() => {
    if (!pending) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const verdict = window.setTimeout(() => {
      setVisualState(pending.record.correct ? 'ACCEPTED' : 'REJECTED');
      sound.playDepartmentCue('DISPATCH_BOX', pending.record.correct ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(PRESENTATION_TIMING.inputFeedbackMs, reduced));
    const advance = window.setTimeout(() => {
      if (pending.isLast) {
        const correctCount = pending.allAnswers.filter(answer => answer.correct).length;
        setVisualState('RESULT');
        sound.playDepartmentCue('DISPATCH_BOX', 'RESULT');
        setResult({ score: dispatchTotal(pending.allAnswers.map(answer => answer.score)), answers: pending.allAnswers, correctCount });
      } else {
        setQuestionIndex(index => index + 1);
        setQuestionStartedAt(performance.now());
        setElapsedMs(0);
        setVisualState('ACTIVE');
      }
      setPending(null);
    }, motionDuration(PRESENTATION_TIMING.processingMs, reduced));
    return () => { window.clearTimeout(verdict); window.clearTimeout(advance); };
  }, [pending]);

  const answer = (selectedIndex: number) => {
    if (visualState !== 'ACTIVE') return;
    const exactElapsed = performance.now() - questionStartedAt;
    const correct = selectedIndex === question.correctIndex;
    const record = { selectedIndex, correct, elapsedMs: exactElapsed, score: scoreDispatchAnswer(correct, exactElapsed, scorePaceProfile) };
    const allAnswers = [...answers, record];
    sound.playDepartmentCue('DISPATCH_BOX', 'PROCESSING');
    setElapsedMs(exactElapsed);
    setAnswers(allAnswers);
    setVisualState('PROCESSING');
    setPending({ record, allAnswers, isLast: questionIndex === challenge.questions.length - 1 });
  };

  const runningTotal = dispatchTotal(answers.map(item => item.score));

  return <>
    <ApparatusFrame compact state={visualState} scorePaceProfile={scorePaceProfile} eyebrow="Parliamentary Correspondence Office • Rapid Briefing Machine" title={`${challenge.category} Dispatch`} subtitle={<><strong>{currentPlayer.name}</strong>, answer five independent general-knowledge briefs. {paceScoreNote(scorePaceProfile)}</>} icon={<Send size={27}/>} accent="#a7423d" instrumentLabel="DISPATCH BOX" decorativeArt={DISPATCH_BOX_ART} dataRoundType="DISPATCH_BOX">
      <div className="relative min-h-[480px] overflow-hidden rounded-2xl border-[3px] border-[#65442c] bg-[#223d3b] p-3 sm:p-4">
        <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width:800px)" srcSet={DISPATCH_BOX_ART.compact}/><img src={DISPATCH_BOX_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover opacity-45"/></picture>
        <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(250px,.55fr)]">
          <section aria-label={`Brief ${questionIndex + 1} of ${challenge.questions.length}`} className="rounded-xl border-[3px] border-[#6e4b31] bg-[#fff5d8]/95 p-4 shadow-[0_7px_0_#4d3022]">
            <div className="mb-3 flex items-center gap-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#7a5438]"><CircleHelp size={18}/> Brief {questionIndex + 1} of {challenge.questions.length}</div>
            <h3 className="min-h-[72px] font-['Cinzel'] text-lg font-black leading-tight text-[#263b48] sm:text-xl">{question.question}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Answer choices">
              {question.options.map((option, index) => <button key={option} type="button" disabled={visualState !== 'ACTIVE'} onClick={() => answer(index)} className="bureau-button min-h-14 rounded-lg border-2 border-[#704b31] bg-[#f1cb65] px-3 py-2 text-left font-['Fraunces'] text-sm font-bold text-[#30434a] shadow-[0_4px_0_#704b31] disabled:opacity-55"><span className="mr-2 font-['Courier_Prime'] font-black">{String.fromCharCode(65 + index)}.</span>{option}</button>)}
            </div>
            {visualState === 'PROCESSING' ? <div role="status" className="mt-3 flex items-center justify-center gap-2 font-['Courier_Prime'] text-[10px] font-black uppercase"><LoaderCircle className="animate-spin" size={17}/> Filing response</div> : null}
          </section>

          <aside className="rounded-xl border-[3px] border-[#65442c] bg-[#fff4d4]/95 p-3 shadow-[0_7px_0_#4d3022]">
            <div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Dispatch progress</div>
            <div className="mt-3 flex justify-between gap-2" aria-label={`${answers.length} of ${challenge.questions.length} briefs answered`}>
              {challenge.questions.map((_, index) => {
                const filed = answers[index];
                return <span key={index} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#65442c] ${filed ? filed.correct ? 'bg-[#4c8b65] text-white' : 'bg-[#c94f45] text-white' : index === questionIndex ? 'bg-[#f1cb65] text-[#65442c]' : 'bg-[#e2d5b4] text-[#8a765d]'}`} aria-label={filed ? `Brief ${index + 1}: ${filed.correct ? 'correct' : 'incorrect'}` : `Brief ${index + 1}: pending`}>{filed ? filed.correct ? <Check size={19}/> : <X size={19}/> : index + 1}</span>;
              })}
            </div>
            <div className="mt-4 rounded-lg border-2 border-[#8a633f] bg-[#294d57] p-3 text-center text-[#fff4d4]">
              <div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Points filed</div>
              <div className="font-['Cinzel'] text-3xl font-black">{runningTotal}</div>
            </div>
            <div className="mt-3 rounded-lg border-2 border-[#a47c49] bg-[#f4e2b7] p-3 text-center"><span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Current response time</span><strong className="mt-1 block font-['Cinzel'] text-xl">{(elapsedMs / 1000).toFixed(1)}s</strong></div>
            <p className="mt-3 font-['Courier_Prime'] text-xs leading-relaxed text-[#655543]">Each correct brief is worth up to 200 points. {paceScoreNote(scorePaceProfile)} Wrong answers score zero.</p>
          </aside>
        </div>
      </div>
    </ApparatusFrame>
    {result ? <CommentaryPlaque score={result.score} playerName={currentPlayer.name} roundType="DISPATCH_BOX" questionPrompt={challenge.prompt} explanation={`${result.correctCount} of five briefs were correct. ${challenge.questions.map(item => item.explanation).join(' ')}`} source={challenge.questions.map(item => item.source).join('; ')} history={currentPlayer.stats} isCorrect={result.correctCount > 0} onProceed={() => onComplete(result.score)}/> : null}
  </>;
};
