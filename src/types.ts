export type RoundType = 
  | 'TOP_10'
  | 'PUT_UP_OR_SHUT_UP'
  | 'THE_LIST'
  | 'WHERE_IN_BRITAIN'
  | 'CLOSEST_WINS'
  | 'RANK_IT'
  | 'IMAGE_REVEAL'
  | 'STOP_THE_SCORE'
  | 'MISFILED_RECORDS'
  | 'REDACTED_RECORDS'
  | 'COMMON_DOSSIER'
  | 'MISSING_MINUTES'
  | 'PUBLIC_ENQUIRY'
  | 'CHAIN_OF_COMMAND'
  | 'COMPLAINTS_DESK'
  | 'SEATING_COMMITTEE'
  | 'DISPATCH_BOX';

/** Kept as a compatibility alias for the development laboratory. These
 * departments are now also members of the normal assessment pool. */
export type PrototypeRoundType = Extract<RoundType, 'MISFILED_RECORDS' | 'REDACTED_RECORDS' | 'COMMON_DOSSIER' | 'MISSING_MINUTES' | 'PUBLIC_ENQUIRY' | 'CHAIN_OF_COMMAND' | 'COMPLAINTS_DESK' | 'SEATING_COMMITTEE' | 'DISPATCH_BOX'>;

export type RoundVisualState =
  | 'IDLE'
  | 'ACTIVE'
  | 'PROCESSING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RESULT';

export type DifficultyProfile = 'ACCESSIBLE' | 'MIXED' | 'EXPERT';
export type ScorePaceProfile = 'RELAXED' | 'STANDARD' | 'RAPID';
export type MiniGameType = 'RED_BUTTON' | 'FILE_CABINET' | 'HIGHER_LOWER' | 'THREE_FILES';

export interface ScoreSnapshot {
  roundNumber: number;
  scores: Record<string, number>;
}

export type ArmedAssetState = Record<string, BureauAssetKey[]>;

export interface MiniGameEffect {
  playerId: string;
  pointsDelta?: number;
  asset?: BureauAssetKey;
  priorityNextRound?: boolean;
  note: string;
}

export interface ApparatusAttachmentPoint {
  id: string;
  xPercent: number;
  yPercent: number;
  kind: 'LAMP' | 'NEEDLE' | 'SHUTTER' | 'PAPER_FEED' | 'CONTROL_APERTURE';
  /** Required for control apertures so the visual housing and the live DOM
   * surface share an explicit, testable rectangle rather than a vague point. */
  widthPercent?: number;
  heightPercent?: number;
}

export interface VisualAssetVariant {
  desktop: string;
  compact: string;
  alt: '';
  stateTreatment?: RoundVisualState;
  sourceFile?: string;
  overlay?: {
    desktop: string;
    compact: string;
    requiresAlpha: true;
  };
  attachments?: ApparatusAttachmentPoint[];
}

export type VisualAssetManifest = Record<
  RoundType,
  Partial<Record<RoundVisualState, VisualAssetVariant>>
>;

export interface RoundDevScenario {
  id: string;
  roundType: RoundType;
  visualState: RoundVisualState;
  playerCount: 1 | 2 | 4;
  questionLength: 'SHORT' | 'LONG';
  question: string;
}

export type RoundParticipationMode =
  | 'EVERYONE_TAKES_A_TURN'
  | 'SHARED_ROTATION'
  | 'HIDDEN_SEQUENTIAL';

export interface PlayerStats {
  roundsPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
  bestScore: number;
  worstScore: number;
  mapDistancesKm: number[];
  estimateErrorsPercent: number[];
  risksTaken: number;
  successfulRisks: number;
  highestBankedList: number;
  categoriesAttempted: Set<string>;
  interceptCount: number;
  challengeScores: number[];
  mapScores: number[];
  successfulListBanks: number[];
  categoryScores: Record<string, number[]>;
  assetsUsed: string[];
  roundScores?: Partial<Record<RoundType, number[]>>;
  successfulRiskScores?: number[];
  rivalryPredictionsWon?: number;
  rivalryMotionsSucceeded?: number;
  influenceEarned?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  portraitIndex?: number;
  color: string;
  department: string;
  score: number;
  influence?: number;
  assets: BureauAssetKey[];
  secretDirective: SecretDirective;
  stats: PlayerStats;
}

export type BureauAssetKey = 
  | 'SECOND_OPINION'
  | 'REFILE'
  | 'DOUBLE_ENTRY'
  | 'INTERCEPT'
  | 'INSURANCE'
  | 'PRIORITY_ACCESS';

export interface BureauAsset {
  id: BureauAssetKey;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  consumed: boolean;
}

export interface SecretDirective {
  id: string;
  codeName: string;
  title: string;
  description: string;
  targetMetric: string;
  bonusPoints: number;
  isCompleted: boolean;
  progressText: string;
}

export interface HiddenCommendation {
  id: string;
  title: string;
  description: string;
  evaluationNote: string;
  winnerPlayerId: string | null;
  winnerDetails?: string;
  bonusPoints: number;
}

export interface Top10Challenge {
  id: string;
  roundType: 'TOP_10';
  category: string;
  prompt: string;
  items: Array<{
    rank: number;
    name: string;
    aliases: string[];
    detail: string;
    rarityMultiplier: number;
  }>;
  explanation: string;
  source: string;
}

export interface PutUpOrShutUpChallenge {
  id: string;
  roundType: 'PUT_UP_OR_SHUT_UP';
  category: string;
  prompt: string;
  targetUnit: string;
  validAnswers: Array<{ name: string; aliases: string[]; note?: string }>;
  explanation: string;
  source: string;
}

export interface TheListChallenge {
  id: string;
  roundType: 'THE_LIST';
  category: string;
  prompt: string;
  validAnswers: Array<{ name: string; aliases: string[]; note?: string }>;
  explanation: string;
  source: string;
}

export interface WhereInBritainChallenge {
  id: string;
  roundType: 'WHERE_IN_BRITAIN';
  category: string;
  prompt: string;
  targetName: string;
  region: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  explanation: string;
  source: string;
}

export interface ClosestWinsChallenge {
  id: string;
  roundType: 'CLOSEST_WINS';
  category: string;
  prompt: string;
  correctValue: number;
  unit: string;
  unitPrefix?: string;
  unitSuffix?: string;
  toleranceScale: number;
  formatDisplay?: (val: number) => string;
  explanation: string;
  source: string;
}

export interface RankItChallenge {
  id: string;
  roundType: 'RANK_IT';
  category: string;
  prompt: string;
  items: Array<{ id: string; label: string; correctRank: number; detail: string }>;
  explanation: string;
  source: string;
}

export interface ImageRevealChallenge {
  id: string;
  roundType: 'IMAGE_REVEAL';
  category: string;
  prompt: string;
  subjectName: string;
  aliases: string[];
  options?: string[];
  imageUrl: string;
  svgGraphicType?: 'landmark' | 'artifact' | 'painting' | 'crest' | 'wildlife' | 'structure';
  visualHint: string;
  explanation: string;
  source: string;
  mediaLicence?: string;
}

export interface StopTheScoreChallenge {
  id: string;
  roundType: 'STOP_THE_SCORE';
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}

export interface MisfiledRecordsChallenge {
  id: string;
  roundType: 'MISFILED_RECORDS';
  category: string;
  prompt: string;
  records: Array<{ id: string; label: string }>;
  misfiledRecordId: string;
  connectionOptions: string[];
  correctConnectionIndex: number;
  clues: [string, string];
  explanation: string;
  source: string;
}

export interface RedactedRecordsChallenge {
  id: string;
  roundType: 'REDACTED_RECORDS';
  category: string;
  prompt: string;
  subjectName: string;
  aliases: string[];
  clues: [string, string, string, string];
  options: string[];
  explanation: string;
  source: string;
}

export interface CommonDossierChallenge {
  id: string;
  roundType: 'COMMON_DOSSIER';
  category: string;
  prompt: string;
  connection: string;
  aliases: string[];
  exhibits: [string, string, string, string];
  options: [string, string, string, string];
  explanation: string;
  source: string;
}

export interface MissingMinutesChallenge {
  id: string;
  roundType: 'MISSING_MINUTES';
  category: string;
  prompt: string;
  recordTitle: string;
  entries: [string, string, string, string, string, string];
  missingEntryIndex: number;
  options: [string, string, string, string];
  explanation: string;
  source: string;
}

export interface PublicEnquiryChallenge {
  id: string;
  roundType: 'PUBLIC_ENQUIRY';
  category: string;
  prompt: string;
  claim: string;
  isTrue: boolean;
  witnessBrief: string;
  explanation: string;
  source: string;
}

export interface ChainOfCommandChallenge {
  id: string;
  roundType: 'CHAIN_OF_COMMAND';
  category: string;
  prompt: string;
  chain: [string, string, string, string, string];
  tileOptions: [string, string, string, string, string, string];
  explanation: string;
  source: string;
}

export interface ComplaintsDeskChallenge {
  id: string;
  roundType: 'COMPLAINTS_DESK';
  category: string;
  prompt: string;
  caseTitle: string;
  certifiedFacts: [string, string, string];
  statements: [string, string, string, string, string];
  falseStatementIndex: number;
  explanation: string;
  source: string;
}

export interface SeatingCommitteeChallenge {
  id: string;
  roundType: 'SEATING_COMMITTEE';
  category: string;
  prompt: string;
  hearingTitle: string;
  officials: [string, string, string, string, string];
  clues: [string, string, string, string];
  correctOrder: [string, string, string, string, string];
  explanation: string;
  source: string;
}

export interface DispatchBoxQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  source: string;
}

export interface DispatchBoxChallenge {
  id: string;
  roundType: 'DISPATCH_BOX';
  category: string;
  prompt: string;
  questions: [DispatchBoxQuestion, DispatchBoxQuestion, DispatchBoxQuestion, DispatchBoxQuestion, DispatchBoxQuestion];
}

export type Challenge = Top10Challenge | PutUpOrShutUpChallenge | TheListChallenge | WhereInBritainChallenge | ClosestWinsChallenge | RankItChallenge | ImageRevealChallenge | StopTheScoreChallenge | MisfiledRecordsChallenge | RedactedRecordsChallenge | CommonDossierChallenge | MissingMinutesChallenge | PublicEnquiryChallenge | ChainOfCommandChallenge | ComplaintsDeskChallenge | SeatingCommitteeChallenge | DispatchBoxChallenge;

export interface FinalCase {
  id: string;
  title: string;
  subtitle: string;
  introduction: string;
  verdictPrompt: string;
  options: string[];
  correctOptionIndex: number;
  finalVerdictText: string;
  stages: [
    { stageNumber: 1; stageName: 'Visual Evidence Analysis'; room: 'The Darkroom Archive'; prompt: string; imageHint: string; options: string[]; correctIndex: number; clueUnlocked: string },
    { stageNumber: 2; stageName: 'Geographical Coordinates'; room: 'The Imperial Atlas Room'; prompt: string; targetLocation: { name: string; mapX: number; mapY: number }; clueUnlocked: string },
    { stageNumber: 3; stageName: 'Chronological Interrogation'; room: 'The Hall of Records'; prompt: string; correctYear: number; tolerance: number; clueUnlocked: string }
  ];
  explanation: string;
}

export type GamePhase = 'TITLE' | 'SETUP' | 'DIRECTIVES' | 'COMMITTEE' | 'ROOM_TRANSITION' | 'PLAYING_ROUND' | 'MINI_GAME' | 'FINAL_CASE' | 'PODIUM';

export type GameLengthPreset = 'FIRST' | 'QUICK' | 'STANDARD' | 'FULL' | 'CUSTOM';

export type TurnTimerSeconds = 0 | 30 | 45 | 60;
export type PoliticsMode = 'OFF' | 'LIGHT' | 'STANDARD';

export interface MatchConfig {
  preset: GameLengthPreset;
  roundTypes: RoundType[];
  timerSeconds: TurnTimerSeconds;
  officePolitics: boolean;
  politicsMode: PoliticsMode;
  guidedMode: boolean;
  difficultyProfile: DifficultyProfile;
  scorePaceProfile: ScorePaceProfile;
}

export type PlaytestEventType =
  | 'SESSION_STARTED'
  | 'MATCH_STARTED'
  | 'FIRST_QUESTION_READY'
  | 'PAGE_SCROLL'
  | 'CONTROL_CONFUSION'
  | 'MISTAKEN_INPUT'
  | 'HOST_ASSISTANCE'
  | 'DEAD_TIME'
  | 'PROGRESSION_FAILURE'
  | 'ROUND_COMPLETED'
  | 'MATCH_COMPLETED';

export interface PlaytestEvent {
  version: 1;
  id: string;
  occurredAt: number;
  sessionId?: string;
  type: PlaytestEventType;
  phase: GamePhase;
  roundType?: RoundType;
  challengeId?: string;
  playerCount: number;
  durationMs?: number;
  roundNumber?: number;
  /** Scores in candidate-seat order. Null means that seat did not act in this event. */
  seatScores?: Array<number | null>;
  detail?: string;
}

export type PlaytestRating = 1 | 2 | 3 | 4 | 5;
export type PlaytestSessionStatus = 'ARMED' | 'ACTIVE' | 'AWAITING_DEBRIEF' | 'COMPLETED' | 'ABANDONED';
export type PlaytestCohortSlot = 'SOLO_FIRST' | 'TWO_QUICK_LIGHT' | 'FOUR_STANDARD_STANDARD' | 'FOUR_FULL_BALANCE';

export interface PlaytestConsent {
  version: 1;
  noticeVersion: 'RC1-CLOSED-BETA-V1' | 'RC1-CLOSED-BETA-V2';
  acceptedAt: number;
  localRecordingOnly: true;
  excludesNamesAudioAndNetworkData: true;
  manualExportOnly: true;
}

export interface PlaytestEligibility {
  version: 1;
  confirmedAt: number;
  participantsUnfamiliarWithDevelopment: true;
  independentGroupConfirmed: true;
  anonymousGroupCodeConfirmed: true;
}

export interface PlaytestDebrief {
  enjoymentRating: PlaytestRating;
  clarityRating: PlaytestRating;
  pacingRating?: PlaytestRating;
  wouldPlayAgain: boolean;
  completedUnassisted: boolean;
  favouriteDepartment?: RoundType;
  mostConfusingDepartment?: RoundType;
  leastClearMoment?: string;
  observerNotes?: string;
}

export interface PlaytestSession {
  version: 2 | 3 | 4;
  id: string;
  groupCode: string;
  status: PlaytestSessionStatus;
  startedAt: number;
  matchStartedAt?: number;
  firstQuestionAt?: number;
  matchCompletedAt?: number;
  endedAt?: number;
  playerCount: number;
  preset?: GameLengthPreset;
  roundTypes: RoundType[];
  timerSeconds?: TurnTimerSeconds;
  politicsMode?: PoliticsMode;
  difficultyProfile?: DifficultyProfile;
  scorePaceProfile?: ScorePaceProfile;
  consent?: PlaytestConsent;
  cohortSlot?: PlaytestCohortSlot;
  eligibility?: PlaytestEligibility;
  debrief?: PlaytestDebrief;
}

export interface PlaytestSessionSummary {
  sessionId: string;
  groupCode: string;
  status: PlaytestSessionStatus;
  playerCount: number;
  preset?: GameLengthPreset;
  cohortSlot?: PlaytestCohortSlot;
  consented: boolean;
  independentGroupConfirmed: boolean;
  configurationMatchesCohort: boolean;
  eventEvidenceComplete: boolean;
  matchDurationMs?: number;
  timeToFirstQuestionMs?: number;
  eventCounts: Partial<Record<PlaytestEventType, number>>;
  passedUnassisted: boolean;
  enjoymentRating?: PlaytestRating;
  clarityRating?: PlaytestRating;
  pacingRating?: PlaytestRating;
  wouldPlayAgain?: boolean;
  favouriteDepartment?: RoundType;
  mostConfusingDepartment?: RoundType;
}

export interface QuestionPackEntry {
  challengeId: string;
  contentFingerprint: string;
  roundType: RoundType;
  sourceRecordPreparedOn: string;
  verificationDate?: string;
  difficulty: DifficultyProfile;
  difficultyReview: {
    profile: DifficultyProfile;
    method: 'RULES_ENGINE' | 'INDEPENDENT_REVIEW';
    rationale: string;
  };
  source: string;
  sourceReferences: Array<{
    citation: string;
    locatorKind: 'URL' | 'BIBLIOGRAPHIC';
    url?: string;
  }>;
  answerRationale: string;
  acceptedAnswers: string[];
  aliases: string[];
  timeSensitive: boolean;
  reviewBy?: string;
  editorialStatus: 'READY_FOR_INDEPENDENT_REVIEW' | 'APPROVED' | 'CHANGES_REQUIRED';
  independentReview?: {
    reviewerId: string;
    reviewedOn: string;
    contentFingerprint: string;
    notes?: string;
    attestation: {
      reviewerIndependent: boolean;
      sourceVerified: boolean;
      wordingChecked: boolean;
      answersAndAliasesChecked: boolean;
      difficultyChecked: boolean;
      playtested: boolean;
    };
  };
  mediaLicence?: string;
}

export interface QuestionPackManifest {
  schemaVersion: 3;
  packId: string;
  title: string;
  challengeCount: number;
  preparedOn: string;
  entries: QuestionPackEntry[];
}

export type CommitteeStance = 'BACK' | 'OBJECT' | 'ABSTAIN';
export type RivalryMotion = 'NONE' | 'RAISE_STANDARD' | 'COUNTER_SIGN' | 'SECOND_READING';

export interface CommitteePrediction {
  playerId: string;
  targetPlayerId: string;
  stance: CommitteeStance;
  motion: RivalryMotion;
}

export interface RivalryOutcome {
  playerId: string;
  influenceDelta: number;
  scoreDelta: number;
  description: string;
}

export type AdjudicationDecision = 'AUTOMATIC' | 'HOST_ACCEPTED' | 'HOST_REJECTED' | 'HOST_EDITED';

export interface AdjudicationRecord {
  challengeId: string;
  playerId: string;
  submittedAnswer: string;
  acceptedAnswer?: string;
  decision: AdjudicationDecision;
  reason?: string;
  recordedAt: number;
  reversedAt?: number;
}

export interface MatchState {
  config: MatchConfig;
  phase: GamePhase;
  selectedPlayerCount: number;
  players: Player[];
  currentRoundIndex: number;
  roundStarterIndex: number;
  playersCompletedThisRound: number;
  usedChallengeIdsThisRound: string[];
  currentChallengeId: string | null;
  hiddenCommendations: HiddenCommendation[];
  scoreHistory: ScoreSnapshot[];
  bureauReviewUsed: boolean;
  reviewEligiblePlayerId: string | null;
  armedAssets: ArmedAssetState;
  priorityStarterPlayerId: string | null;
  miniGameType: MiniGameType | null;
  miniGamesPlayed: MiniGameType[];
  freeMotionPlayerId: string | null;
  rivalryTargetScore: number | null;
  finalCaseIndex: number;
  timerPaused: boolean;
  adjudicationHistory: AdjudicationRecord[];
  committeePredictions: CommitteePrediction[];
  rivalryOutcomes: RivalryOutcome[];
}

export type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADVANCE_ROUND'; starterIndex: number }
  | { type: 'ADVANCE_PLAYER' }
  | { type: 'SET_TIMER_PAUSED'; paused: boolean }
  | { type: 'RECORD_ADJUDICATION'; record: AdjudicationRecord }
  | { type: 'REVERSE_LAST_ADJUDICATION'; challengeId: string; reversedAt: number }
  | { type: 'SET_COMMITTEE'; predictions: CommitteePrediction[] }
  | { type: 'RESOLVE_RIVALRY'; outcomes: RivalryOutcome[] }
  | { type: 'PATCH_MATCH'; patch: Partial<MatchState> }
  | { type: 'APPEND_SCORE_SNAPSHOT'; snapshot: ScoreSnapshot }
  | { type: 'HYDRATE_MATCH'; state: MatchState }
  | { type: 'RESET_MATCH'; config: MatchConfig };

export interface RoundConfig {
  roundNumber: number;
  type: RoundType;
  participationMode: RoundParticipationMode;
  name: string;
  roomName: string;
  roomTheme: string;
  challenge?: Challenge;
}
