import type { AdjudicationRecord, Challenge, Player, ScorePaceProfile } from '../../types';
import { assignSecretDirectives } from '../../data/secretDirectives';
import { WhereInBritainRound } from '../rounds/WhereInBritainRound';
import { Top10Round } from '../rounds/Top10Round';
import { PutUpOrShutUpRound } from '../rounds/PutUpOrShutUpRound';
import { TheListRound } from '../rounds/TheListRound';
import { ClosestWinsRound } from '../rounds/ClosestWinsRound';
import { RankItRound } from '../rounds/RankItRound';
import { ImageRevealRound } from '../rounds/ImageRevealRound';
import { StopTheScoreRound } from '../rounds/StopTheScoreRound';
import { MisfiledRecordsRound } from '../rounds/MisfiledRecordsRound';
import { RedactedRecordsRound } from '../rounds/RedactedRecordsRound';
import { CommonDossierRound } from '../rounds/CommonDossierRound';
import { MissingMinutesRound } from '../rounds/MissingMinutesRound';
import { PublicEnquiryRound } from '../rounds/PublicEnquiryRound';
import { ChainOfCommandRound } from '../rounds/ChainOfCommandRound';
import { ComplaintsDeskRound } from '../rounds/ComplaintsDeskRound';
import { SeatingCommitteeRound } from '../rounds/SeatingCommitteeRound';
import { DispatchBoxRound } from '../rounds/DispatchBoxRound';

const PLAYER_COLOURS = ['#2f9da4', '#e39b39', '#df6753', '#477b5a'];

export const makeDevPlayers = (count: 1 | 2 | 4): Player[] => {
  const directives = assignSecretDirectives(count, () => 0.42);
  return Array.from({ length: count }, (_, index) => ({
    id: `lab-candidate-${index + 1}`,
    name: `Candidate ${index + 1}`,
    avatar: '',
    portraitIndex: index,
    color: PLAYER_COLOURS[index],
    department: 'Development Inspection',
    score: index * 250,
    influence: 1,
    assets: [],
    secretDirective: directives[index],
    stats: {
      roundsPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      bestScore: 0,
      worstScore: 1000,
      mapDistancesKm: [],
      estimateErrorsPercent: [],
      risksTaken: 0,
      successfulRisks: 0,
      highestBankedList: 0,
      categoriesAttempted: new Set<string>(),
      interceptCount: 0,
      challengeScores: [],
      mapScores: [],
      successfulListBanks: [],
      categoryScores: {},
      roundScores: {},
      successfulRiskScores: [],
      assetsUsed: [],
    },
  }));
};

export interface ActualRoundFixtureResult {
  summary: string;
  scores?: Record<string, number>;
}

interface ActualRoundFixtureProps {
  challenge: Challenge;
  players: Player[];
  starterIndex: number;
  scorePaceProfile?: ScorePaceProfile;
  privacyCurtainEnabled?: boolean;
  onAdjudication?: (record: Omit<AdjudicationRecord, 'challengeId' | 'recordedAt'>) => void;
  onUndoAdjudication?: () => void;
  onFinish?: (result: ActualRoundFixtureResult) => void;
}

export const ActualRoundFixture = ({
  challenge,
  players,
  starterIndex,
  scorePaceProfile = 'STANDARD',
  privacyCurtainEnabled = false,
  onAdjudication = () => undefined,
  onUndoAdjudication = () => undefined,
  onFinish = () => undefined,
}: ActualRoundFixtureProps) => {
  const activePlayer = players[starterIndex % players.length];
  const finish = (summary: string, scores?: Record<string, number>) => onFinish({ summary, scores });

  switch (challenge.roundType) {
    case 'WHERE_IN_BRITAIN':
      return <WhereInBritainRound challenge={challenge} currentPlayer={activePlayer} onComplete={(score, errorKm) => finish(`${score} points, ${Math.round(errorKm)} km error`)} />;
    case 'TOP_10':
      return <Top10Round challenge={challenge} players={players} currentPlayerIndex={starterIndex} onAdjudication={onAdjudication} onUndoAdjudication={onUndoAdjudication} onCompleteRound={scores => finish('Top 10 register completed', scores)} />;
    case 'PUT_UP_OR_SHUT_UP':
      return <PutUpOrShutUpRound challenge={challenge} players={players} currentPlayerIndex={starterIndex} onAdjudication={onAdjudication} onUndoAdjudication={onUndoAdjudication} onComplete={(winnerId, score) => finish(`${winnerId} completed the contract`, { [winnerId]: score })} />;
    case 'THE_LIST':
      return <TheListRound challenge={challenge} currentPlayer={activePlayer} onAdjudication={onAdjudication} onUndoAdjudication={onUndoAdjudication} onComplete={(score, banked) => finish(`${score} points with ${banked} entries banked`)} />;
    case 'CLOSEST_WINS':
      return <ClosestWinsRound challenge={challenge} players={players} privacyCurtainEnabled={privacyCurtainEnabled} onCompleteRound={(scores, errors) => finish(`Comparison filed; errors ${JSON.stringify(errors)}`, scores)} />;
    case 'RANK_IT':
      return <RankItRound challenge={challenge} currentPlayer={activePlayer} onComplete={score => finish(`${score} points`)} />;
    case 'IMAGE_REVEAL':
      return <ImageRevealRound challenge={challenge} currentPlayer={activePlayer} onComplete={score => finish(`${score} points`)} />;
    case 'STOP_THE_SCORE':
      return <StopTheScoreRound challenge={challenge} currentPlayer={activePlayer} onComplete={(score, correct, risked) => finish(`${score} points; ${correct ? 'correct' : 'incorrect'}; ${risked} risked`)} />;
    case 'MISFILED_RECORDS':
      return <MisfiledRecordsRound challenge={challenge} currentPlayer={activePlayer} onComplete={score => finish(`${score} points filed`)} />;
    case 'REDACTED_RECORDS':
      return <RedactedRecordsRound challenge={challenge} currentPlayer={activePlayer} onComplete={score => finish(`${score} points filed`)} />;
    case 'COMMON_DOSSIER':
      return <CommonDossierRound challenge={challenge} currentPlayer={activePlayer} onComplete={score => finish(`${score} points filed`)} />;
    case 'MISSING_MINUTES':
      return <MissingMinutesRound challenge={challenge} currentPlayer={activePlayer} scorePaceProfile={scorePaceProfile} onComplete={score => finish(`${score} points filed`)} />;
    case 'PUBLIC_ENQUIRY':
      return <PublicEnquiryRound challenge={challenge} players={players} currentPlayerIndex={starterIndex} privacyCurtainEnabled={privacyCurtainEnabled} onComplete={scores => finish('Public enquiry confidence filed', scores)} />;
    case 'CHAIN_OF_COMMAND':
      return <ChainOfCommandRound challenge={challenge} currentPlayer={activePlayer} scorePaceProfile={scorePaceProfile} onComplete={score => finish(`${score} points filed`)} />;
    case 'COMPLAINTS_DESK':
      return <ComplaintsDeskRound challenge={challenge} currentPlayer={activePlayer} scorePaceProfile={scorePaceProfile} onComplete={score => finish(`${score} points filed`)} />;
    case 'SEATING_COMMITTEE':
      return <SeatingCommitteeRound challenge={challenge} currentPlayer={activePlayer} scorePaceProfile={scorePaceProfile} onComplete={score => finish(`${score} points filed`)} />;
    case 'DISPATCH_BOX':
      return <DispatchBoxRound challenge={challenge} currentPlayer={activePlayer} scorePaceProfile={scorePaceProfile} onComplete={score => finish(`${score} points filed`)} />;
  }
};
