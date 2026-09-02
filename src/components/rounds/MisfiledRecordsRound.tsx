import { useEffect, useMemo, useState } from 'react';
import { Check, FileQuestion, FolderSearch, Lightbulb, LoaderCircle } from 'lucide-react';
import type { MisfiledRecordsChallenge, Player, RoundVisualState } from '../../types';
import { scoreMisfiledRecords, potentialMisfiledScore, shuffleMisfiledRecords } from '../../game/misfiledRecords';
import { RESULT_SEQUENCE, motionDuration } from '../../game/presentation';
import { MISFILED_RECORDS_ART } from '../../data/promotedVisualAssets';
import { sound } from '../../sound/audioEngine';
import { markArtworkUnavailable } from '../../game/visualState';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';

interface MisfiledRecordsRoundProps {
  challenge: MisfiledRecordsChallenge;
  currentPlayer: Player;
  onComplete: (score: number) => void;
}

interface Resolution {
  score: number;
  recordCorrect: boolean;
  connectionCorrect: boolean;
  submittedRecord: string;
  submittedConnection: string;
}

export const MisfiledRecordsRound = ({ challenge, currentPlayer, onComplete }: MisfiledRecordsRoundProps) => {
  const [cluesRevealed, setCluesRevealed] = useState(0);
  const [displayRecords] = useState(() => shuffleMisfiledRecords(challenge.records));
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedConnectionIndex, setSelectedConnectionIndex] = useState<number | null>(null);
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [pendingResolution, setPendingResolution] = useState<Resolution | null>(null);
  const [result, setResult] = useState<Resolution | null>(null);
  const potentialScore = potentialMisfiledScore(cluesRevealed);
  const selectedRecord = useMemo(
    () => challenge.records.find(record => record.id === selectedRecordId),
    [challenge.records, selectedRecordId],
  );
  const certifiedRecord = challenge.records.find(record => record.id === challenge.misfiledRecordId)!;

  useEffect(() => {
    if (!pendingResolution) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const decisionTimer = window.setTimeout(() => {
      setVisualState(pendingResolution.recordCorrect && pendingResolution.connectionCorrect ? 'ACCEPTED' : 'REJECTED');
      sound.playDepartmentCue('MISFILED_RECORDS', pendingResolution.recordCorrect && pendingResolution.connectionCorrect ? 'ACCEPTED' : 'REJECTED');
    }, motionDuration(RESULT_SEQUENCE.decisionMs, reducedMotion));
    const resultTimer = window.setTimeout(() => {
      setVisualState('RESULT');
      sound.playDepartmentCue('MISFILED_RECORDS', 'RESULT');
      setResult(pendingResolution);
      setPendingResolution(null);
    }, motionDuration(RESULT_SEQUENCE.dossierMs, reducedMotion));
    return () => { window.clearTimeout(decisionTimer); window.clearTimeout(resultTimer); };
  }, [pendingResolution]);

  const revealClue = () => {
    if (cluesRevealed >= challenge.clues.length || visualState !== 'ACTIVE') return;
    sound.playDepartmentCue('MISFILED_RECORDS', 'MOVE');
    setCluesRevealed(value => value + 1);
  };

  const submit = () => {
    if (!selectedRecord || selectedConnectionIndex === null || visualState !== 'ACTIVE') return;
    const recordCorrect = selectedRecord.id === challenge.misfiledRecordId;
    const connectionCorrect = selectedConnectionIndex === challenge.correctConnectionIndex;
    sound.playDepartmentCue('MISFILED_RECORDS', 'PROCESSING');
    setVisualState('PROCESSING');
    setPendingResolution({
      score: scoreMisfiledRecords(cluesRevealed, recordCorrect, connectionCorrect),
      recordCorrect,
      connectionCorrect,
      submittedRecord: selectedRecord.label,
      submittedConnection: challenge.connectionOptions[selectedConnectionIndex],
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl font-['Plus_Jakarta_Sans']">
      <ApparatusFrame
        compact
        state={visualState}
        eyebrow="Office of Archival Corrections • Mechanical Sorting Desk"
        title={challenge.prompt}
        subtitle={<><strong>{currentPlayer.name}</strong>, eject one record and certify the connection between those that remain.</>}
        icon={<FolderSearch size={27}/>} accent="#b84f5f" instrumentLabel="ARCHIVE SORTER"
        decorativeArt={MISFILED_RECORDS_ART} dataRoundType="MISFILED_RECORDS"
      >
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
          <section aria-label="Records awaiting classification" className="rounded-[22px] border-[4px] border-[#65442c] bg-[#284950]/95 p-3 shadow-[inset_0_0_0_4px_#3f7477,0_7px_0_#65442c] sm:p-4">
            <div className="relative mb-3 h-28 overflow-hidden rounded-xl border-[3px] border-[#65442c] bg-[#e8d6ac] shadow-inner">
              <picture className="absolute inset-0" aria-hidden="true"><source media="(max-width: 800px)" srcSet={MISFILED_RECORDS_ART.compact}/><img src={MISFILED_RECORDS_ART.desktop} alt="" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover object-top"/></picture>
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg border-2 border-[#65442c] bg-[#f2d16a]/95 px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#60452f] shadow-[0_2px_0_#65442c] sm:text-xs">
                <span>Five received records • one incorrect tray</span><span>{potentialScore} points available</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {displayRecords.map((record, index) => {
                const selected = record.id === selectedRecordId;
                return <button
                  key={record.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={visualState !== 'ACTIVE'}
                  onClick={() => { sound.playDepartmentCue('MISFILED_RECORDS', 'MOVE'); setSelectedRecordId(record.id); }}
                  className={`bureau-misfile-card relative min-h-32 rounded-t-[18px] rounded-b-lg border-[3px] p-3 text-left shadow-[0_4px_0_#65442c] transition-transform sm:min-h-40 ${selected ? 'border-[#7e302f] bg-[#f19a7f] -translate-y-2' : 'border-[#65442c] bg-[#fff3cf] hover:-translate-y-1'} disabled:cursor-wait`}
                >
                  <span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-[.18em] text-[#806044]">Tray {index + 1}</span>
                  <span className="mt-4 block font-['Cinzel'] text-xs font-black leading-tight text-[#30434a]">{record.label}</span>
                  {selected ? <span className="absolute inset-x-2 bottom-2 rounded bg-[#9e3e3b] px-2 py-1 text-center font-['Courier_Prime'] text-xs font-black uppercase text-white">Marked for ejection</span> : null}
                </button>;
              })}
            </div>
            <div className="mt-4 rounded-xl border-[3px] border-[#65442c] bg-[#fff6da]/95 p-3">
              <span className="mb-2 block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#70533d]">Certify the common filing rule</span>
              <div className="grid gap-2">
                {challenge.connectionOptions.map((option, index) => <button
                  key={option}
                  type="button"
                  aria-pressed={selectedConnectionIndex === index}
                  disabled={visualState !== 'ACTIVE'}
                  onClick={() => { sound.playDepartmentCue('MISFILED_RECORDS', 'MOVE'); setSelectedConnectionIndex(index); }}
                  className={`rounded-lg border-2 px-3 py-2 text-left font-['Fraunces'] text-sm font-bold shadow-[0_2px_0_#65442c] ${selectedConnectionIndex === index ? 'border-[#2d7173] bg-[#80cbc4] text-[#243f45]' : 'border-[#887052] bg-[#f5e8c5] text-[#55483c]'}`}
                >{option}</button>)}
              </div>
            </div>
          </section>

          <aside className="self-start rounded-[20px] border-[4px] border-[#65442c] bg-[#fff3cf]/95 p-4 shadow-[0_7px_0_#65442c]">
            <div className="mb-3 flex items-center gap-2 border-b-2 border-dashed border-[#a7895e] pb-3 text-[#714f36]"><FileQuestion size={20}/><strong className="font-['Cinzel'] text-sm">Inspector’s Desk</strong></div>
            <div aria-live="polite" className="space-y-2">
              {challenge.clues.slice(0, cluesRevealed).map((clue, index) => <div key={clue} className="rounded-xl border-2 border-[#92734e] bg-[#eadcae] p-3 font-['Courier_Prime'] text-[10px] leading-relaxed text-[#5b493a]"><strong className="block uppercase text-[#9b6330]">Clue {index + 1}</strong>{clue}</div>)}
              {cluesRevealed === 0 ? <p className="rounded-xl border-2 border-dashed border-[#b79b70] p-3 font-['Courier_Prime'] text-[10px] text-[#786854]">No assistance requested. Institutional admiration remains theoretically available.</p> : null}
            </div>
            {cluesRevealed < challenge.clues.length ? <button type="button" disabled={visualState !== 'ACTIVE'} onClick={revealClue} className="bureau-button mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#e1ad42] px-3 py-3 font-['Cinzel'] text-[10px] font-black uppercase tracking-wider text-[#503a29] shadow-[0_4px_0_#65442c]"><Lightbulb size={17}/>Reveal clue — next maximum {potentialMisfiledScore(cluesRevealed + 1)}</button> : null}
            <button type="button" disabled={!selectedRecordId || selectedConnectionIndex === null || visualState !== 'ACTIVE'} onClick={submit} className="bureau-button mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#65442c] bg-[#d95850] px-3 py-4 font-['Cinzel'] text-xs font-black uppercase tracking-wider text-white shadow-[0_5px_0_#65442c] disabled:opacity-45">
              {visualState === 'PROCESSING' ? <><LoaderCircle className="bureau-route-spinner" size={18}/>Sorting records</> : <><Check size={18}/>Commit classification</>}
            </button>
          </aside>
        </div>
      </ApparatusFrame>

      {result ? <CommentaryPlaque
        score={result.score}
        playerName={currentPlayer.name}
        roundType="MISFILED_RECORDS"
        questionPrompt={challenge.prompt}
        explanation={challenge.explanation}
        source={challenge.source}
        playerAnswer={`${result.submittedRecord} • ${result.submittedConnection}`}
        correctAnswer={`${certifiedRecord.label} • ${challenge.connectionOptions[challenge.correctConnectionIndex]}`}
        history={currentPlayer.stats}
        isCorrect={result.recordCorrect && result.connectionCorrect}
        onProceed={() => onComplete(result.score)}
      /> : null}
    </div>
  );
};
