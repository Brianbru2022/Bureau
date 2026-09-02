import { useCallback, useMemo, useState } from 'react';
import { FlaskConical, RotateCcw } from 'lucide-react';
import type {
  AdjudicationRecord,
  Challenge,
  PrototypeRoundType,
  RoundType,
  TurnTimerSeconds,
} from '../../types';
import { allChallenges } from '../../data/questions';
import { chainOfCommandChallenges, commonDossierChallenges, complaintsDeskChallenges, dispatchBoxChallenges, misfiledRecordsChallenges, missingMinutesChallenges, publicEnquiryChallenges, redactedRecordsChallenges, seatingCommitteeChallenges } from '../../data/prototypeQuestions';
import { TurnTimer } from '../common/TurnTimer';
import { ActualRoundFixture, makeDevPlayers } from './ActualRoundFixture';

type LabRoundType = RoundType | PrototypeRoundType;

const ROUND_LABELS: Record<LabRoundType, string> = {
  WHERE_IN_BRITAIN: 'Where in Britain?',
  TOP_10: 'Top 10',
  PUT_UP_OR_SHUT_UP: 'Put Up or Shut Up',
  THE_LIST: 'The List',
  CLOSEST_WINS: 'Closest Wins',
  RANK_IT: 'Rank It',
  IMAGE_REVEAL: 'Image Reveal',
  STOP_THE_SCORE: 'Stop the Score',
  MISFILED_RECORDS: 'Misfiled Records',
  REDACTED_RECORDS: 'Redacted Records',
  COMMON_DOSSIER: 'Common Dossier',
  MISSING_MINUTES: 'Missing Minutes',
  PUBLIC_ENQUIRY: 'Public Enquiry',
  CHAIN_OF_COMMAND: 'Chain of Command',
  COMPLAINTS_DESK: 'The Complaints Desk',
  SEATING_COMMITTEE: 'The Seating Committee',
  DISPATCH_BOX: 'The Dispatch Box',
};

const ROUND_TYPES = Object.keys(ROUND_LABELS) as LabRoundType[];

type LabResult = { summary: string; scores?: Record<string, number> };

export default function RoundInteractionLab() {
  const [roundType, setRoundType] = useState<LabRoundType>('WHERE_IN_BRITAIN');
  const challenges = useMemo<Challenge[]>(
    () => roundType === 'MISFILED_RECORDS' ? misfiledRecordsChallenges
      : roundType === 'REDACTED_RECORDS' ? redactedRecordsChallenges
      : roundType === 'COMMON_DOSSIER' ? commonDossierChallenges
      : roundType === 'MISSING_MINUTES' ? missingMinutesChallenges
      : roundType === 'PUBLIC_ENQUIRY' ? publicEnquiryChallenges
      : roundType === 'CHAIN_OF_COMMAND' ? chainOfCommandChallenges
      : roundType === 'COMPLAINTS_DESK' ? complaintsDeskChallenges
      : roundType === 'SEATING_COMMITTEE' ? seatingCommitteeChallenges
      : roundType === 'DISPATCH_BOX' ? dispatchBoxChallenges
      : allChallenges.filter(challenge => challenge.roundType === roundType),
    [roundType],
  );
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [playerCount, setPlayerCount] = useState<1 | 2 | 4>(4);
  const [starterIndex, setStarterIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<TurnTimerSeconds>(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<LabResult | null>(null);
  const [adjudications, setAdjudications] = useState<Array<Omit<AdjudicationRecord, 'challengeId' | 'recordedAt'>>>([]);
  const players = useMemo(() => makeDevPlayers(playerCount), [playerCount]);
  const challenge = challenges[Math.min(challengeIndex, Math.max(0, challenges.length - 1))];

  const resetAttempt = () => {
    setAttempt(value => value + 1);
    setResult(null);
    setAdjudications([]);
    setTimerPaused(false);
  };

  const chooseRound = (next: LabRoundType) => {
    setRoundType(next);
    setChallengeIndex(0);
    resetAttempt();
  };

  const finish = useCallback((summary: string, scores?: Record<string, number>) => {
    setResult({ summary, scores });
    setTimerPaused(true);
  }, []);
  const expireTimer = useCallback(() => finish('Timer expired — zero-point host outcome'), [finish]);

  const roundKey = `${roundType}-${challenge.id}-${playerCount}-${starterIndex}-${attempt}`;

  return (
    <main className="min-h-dvh bg-[#d9cda5] p-3 text-[#30434a] sm:p-5">
      <div className="mx-auto max-w-[1500px]">
        <header className="bureau-dev-controls mb-4 rounded-2xl border-[3px] border-[#65442c] bg-[#fff4d4] p-4 shadow-[0_6px_0_#65442c]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.2em]">Development file • live rules laboratory</p><h1 className="font-['Cinzel'] text-xl font-black">Actual Round Interaction Harness</h1></div>
            <a href="/dev/gallery" className="bureau-button rounded-lg bg-[#376d9b] px-3 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase text-white">Visual gallery</a>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Department<select value={roundType} onChange={event => chooseRound(event.target.value as LabRoundType)}>{ROUND_TYPES.map(type => <option key={type} value={type}>{ROUND_LABELS[type]}</option>)}</select></label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Challenge<select value={challengeIndex} onChange={event => { setChallengeIndex(Number(event.target.value)); resetAttempt(); }}>{challenges.map((item, index) => <option key={item.id} value={index}>{index + 1}. {item.category}</option>)}</select></label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Candidates<select value={playerCount} onChange={event => { setPlayerCount(Number(event.target.value) as 1 | 2 | 4); setStarterIndex(0); resetAttempt(); }}>{[1, 2, 4].map(count => <option key={count} value={count}>{count}</option>)}</select></label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Starter<select value={starterIndex} onChange={event => { setStarterIndex(Number(event.target.value)); resetAttempt(); }}>{players.map((player, index) => <option key={player.id} value={index}>{player.name}</option>)}</select></label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Timer<select value={timerSeconds} onChange={event => { setTimerSeconds(Number(event.target.value) as TurnTimerSeconds); resetAttempt(); }}>{[0, 30, 45, 60].map(seconds => <option key={seconds} value={seconds}>{seconds ? `${seconds} seconds` : 'Disabled'}</option>)}</select></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={resetAttempt} className="bureau-button flex items-center gap-2 rounded-lg bg-[#d9644f] px-3 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase text-white"><RotateCcw size={15}/>Restart fixture</button>
            <span className="rounded-lg bg-[#ead9aa] px-3 py-2 font-['Courier_Prime'] text-xs font-bold">{challenge.id}</span>
            <span className="ml-auto flex items-center gap-2 font-['Courier_Prime'] text-xs font-black uppercase"><FlaskConical size={16}/>{adjudications.length} host rulings</span>
          </div>
        </header>

        {result && <aside role="status" className="mb-4 rounded-xl border-[3px] border-[#65442c] bg-[#dce9e5] p-3 shadow-[0_4px_0_#65442c]"><strong className="font-['Cinzel']">Fixture outcome:</strong> <span className="font-['Courier_Prime'] text-sm">{result.summary}</span>{result.scores && <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(result.scores, null, 2)}</pre>}</aside>}

        <section key={roundKey} aria-label={`${ROUND_LABELS[roundType]} interactive fixture`}>
          <ActualRoundFixture
            challenge={challenge}
            players={players}
            starterIndex={starterIndex}
            onAdjudication={record => setAdjudications(value => [...value, record])}
            onUndoAdjudication={() => setAdjudications(value => value.slice(0, -1))}
            onFinish={({ summary, scores }) => finish(summary, scores)}
          />
        </section>
        <TurnTimer seconds={timerSeconds} paused={timerPaused} resetKey={roundKey} onPausedChange={setTimerPaused} onExpire={expireTimer} />
      </div>
    </main>
  );
}
