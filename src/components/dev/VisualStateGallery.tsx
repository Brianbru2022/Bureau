import { useMemo, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { allChallenges } from '../../data/questions';
import { ROUND_TYPES, ROUND_VISUAL_STATES } from '../../dev/roundDevScenarios';
import type { Challenge, RoundType, RoundVisualState, ScorePaceProfile } from '../../types';
import { ApparatusStateOverrideContext } from '../common/ApparatusFrame';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ActualRoundFixture, makeDevPlayers } from './ActualRoundFixture';

const ROUND_LABELS: Record<RoundType, string> = {
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

const challengeLength = (challenge: Challenge) => challenge.roundType === 'DISPATCH_BOX'
  ? challenge.prompt.length + challenge.questions.reduce((sum, question) => sum + question.question.length, 0)
  : challenge.prompt.length;

const chooseLengthFixture = (roundType: RoundType, length: 'SHORT' | 'LONG') => {
  const candidates = allChallenges.filter(challenge => challenge.roundType === roundType);
  return candidates.reduce((selected, candidate) => {
    const difference = challengeLength(candidate) - challengeLength(selected);
    return length === 'LONG' ? (difference > 0 ? candidate : selected) : (difference < 0 ? candidate : selected);
  });
};

const resultAnswer = (challenge: Challenge): string => {
  switch (challenge.roundType) {
    case 'WHERE_IN_BRITAIN': return challenge.targetName;
    case 'TOP_10': return challenge.items[0].name;
    case 'PUT_UP_OR_SHUT_UP':
    case 'THE_LIST': return challenge.validAnswers[0].name;
    case 'CLOSEST_WINS': return `${challenge.correctValue} ${challenge.unit}`;
    case 'RANK_IT': return [...challenge.items].sort((left, right) => left.correctRank - right.correctRank).map(item => item.label).join(' → ');
    case 'IMAGE_REVEAL': return challenge.subjectName;
    case 'STOP_THE_SCORE': return challenge.options[challenge.correctIndex];
    case 'MISFILED_RECORDS': return challenge.records.find(record => record.id === challenge.misfiledRecordId)?.label ?? challenge.misfiledRecordId;
    case 'REDACTED_RECORDS': return challenge.subjectName;
    case 'COMMON_DOSSIER': return challenge.connection;
    case 'MISSING_MINUTES': return challenge.entries[challenge.missingEntryIndex];
    case 'PUBLIC_ENQUIRY': return challenge.isTrue ? 'Claim true' : 'Claim false';
    case 'CHAIN_OF_COMMAND': return challenge.chain.join(' → ');
    case 'COMPLAINTS_DESK': return challenge.statements[challenge.falseStatementIndex];
    case 'SEATING_COMMITTEE': return challenge.correctOrder.join(' → ');
    case 'DISPATCH_BOX': return challenge.questions.map(question => question.options[question.correctIndex]).join(' · ');
  }
};

const resultExplanation = (challenge: Challenge) => challenge.roundType === 'DISPATCH_BOX'
  ? challenge.questions.map(question => question.explanation).join(' ')
  : challenge.explanation;

const resultSource = (challenge: Challenge) => challenge.roundType === 'DISPATCH_BOX'
  ? challenge.questions.map(question => question.source).join('; ')
  : challenge.source;

export default function VisualStateGallery() {
  const [roundType, setRoundType] = useState<RoundType>('WHERE_IN_BRITAIN');
  const [visualState, setVisualState] = useState<RoundVisualState>('ACTIVE');
  const [playerCount, setPlayerCount] = useState<1 | 2 | 4>(4);
  const [questionLength, setQuestionLength] = useState<'SHORT' | 'LONG'>('LONG');
  const requestedPace = new URLSearchParams(window.location.search).get('scorePace');
  const scorePaceProfile: ScorePaceProfile = requestedPace === 'RELAXED' || requestedPace === 'RAPID' ? requestedPace : 'STANDARD';
  const privacyCurtainEnabled = new URLSearchParams(window.location.search).get('privacy') === 'ON';
  const [fixtureNonce, setFixtureNonce] = useState(0);
  const players = useMemo(() => makeDevPlayers(playerCount), [playerCount]);
  const challenge = useMemo(() => chooseLengthFixture(roundType, questionLength), [questionLength, roundType]);
  const fixtureKey = `${roundType}-${visualState}-${playerCount}-${questionLength}-${scorePaceProfile}-${fixtureNonce}`;
  const active = visualState === 'ACTIVE';

  return (
    <main className="min-h-dvh bg-[#d9cda5] p-3 text-[#30434a] sm:p-5">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-2 rounded-2xl border-[3px] border-[#65442c] bg-[#fff4d4] p-3 shadow-[0_6px_0_#65442c]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.2em]">Development file • actual round certification</p>
              <h1 className="font-['Cinzel'] text-xl font-black">Live Department State Gallery</h1>
            </div>
            <span className="flex items-center gap-2 rounded-lg bg-[#dce9e5] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase"><FlaskConical size={15}/>Real question, controls and artwork</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Department
              <select aria-label="Department" value={roundType} onChange={event => { setRoundType(event.target.value as RoundType); setFixtureNonce(value => value + 1); }}>{ROUND_TYPES.map(type => <option key={type} value={type}>{ROUND_LABELS[type]}</option>)}</select>
            </label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">State
              <select aria-label="State" value={visualState} onChange={event => { setVisualState(event.target.value as RoundVisualState); setFixtureNonce(value => value + 1); }}>{ROUND_VISUAL_STATES.map(state => <option key={state}>{state}</option>)}</select>
            </label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Candidates
              <select aria-label="Candidates" value={playerCount} onChange={event => { setPlayerCount(Number(event.target.value) as 1 | 2 | 4); setFixtureNonce(value => value + 1); }}>{[1, 2, 4].map(count => <option key={count}>{count}</option>)}</select>
            </label>
            <label className="grid gap-1 font-['Courier_Prime'] text-xs font-bold uppercase">Question
              <select aria-label="Question" value={questionLength} onChange={event => { setQuestionLength(event.target.value as 'SHORT' | 'LONG'); setFixtureNonce(value => value + 1); }}><option>SHORT</option><option>LONG</option></select>
            </label>
            <code className="ml-auto text-xs">/dev/gallery</code>
          </div>
          <p className="mt-2 font-['Courier_Prime'] text-xs text-[#665348]">
            {active ? 'The selected fixture is fully interactive.' : 'Controls are disabled while the selected certification state is imposed.'} Challenge: <strong>{challenge.id}</strong>
          </p>
        </header>

        <section key={fixtureKey} aria-label={`${ROUND_LABELS[roundType]} ${visualState.toLowerCase()} actual fixture`} data-gallery-actual-round={roundType.toLowerCase()}>
          <ApparatusStateOverrideContext.Provider value={visualState}>
            <fieldset disabled={!active} className="m-0 min-w-0 border-0 p-0 disabled:cursor-not-allowed">
              <ActualRoundFixture challenge={challenge} players={players} starterIndex={0} scorePaceProfile={scorePaceProfile} privacyCurtainEnabled={privacyCurtainEnabled} />
            </fieldset>
          </ApparatusStateOverrideContext.Provider>
        </section>

        {visualState === 'RESULT' ? (
          <CommentaryPlaque
            score={673}
            playerName={players[0].name}
            roundType={roundType}
            questionPrompt={challenge.prompt}
            explanation={resultExplanation(challenge)}
            source={resultSource(challenge)}
            playerAnswer={resultAnswer(challenge)}
            correctAnswer={resultAnswer(challenge)}
            currentTotal={1423}
            isCorrect
            onProceed={() => setVisualState('ACTIVE')}
          />
        ) : null}
      </div>
    </main>
  );
}
