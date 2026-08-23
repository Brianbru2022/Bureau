export type RoundType = 
  | 'TOP_10'
  | 'PUT_UP_OR_SHUT_UP'
  | 'THE_LIST'
  | 'WHERE_IN_BRITAIN'
  | 'CLOSEST_WINS'
  | 'RANK_IT'
  | 'IMAGE_REVEAL'
  | 'STOP_THE_SCORE';

export type RoundParticipationMode =
  | 'EVERYONE_TAKES_A_TURN'
  | 'SHARED_ROTATION'
  | 'HIDDEN_SEQUENTIAL';

export interface Player {
  id: string;
  name: string;
  avatar: string; // avatar key or emoji/symbol
  color: string;  // hex or tailwind identifier
  department: string; // e.g. "Department of Cartography & Spite"
  score: number;
  assets: BureauAssetKey[];
  secretDirective: SecretDirective;
  stats: {
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
  };
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

// 1. TOP 10 Item
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
    rarityMultiplier: number; // 1.0 (obvious) to 1.8 (obscure)
  }>;
  explanation: string;
  source: string;
}

// 2. Put Up Or Shut Up
export interface PutUpOrShutUpChallenge {
  id: string;
  roundType: 'PUT_UP_OR_SHUT_UP';
  category: string;
  prompt: string;
  targetUnit: string; // e.g. "Prime Ministers"
  validAnswers: Array<{
    name: string;
    aliases: string[];
    note?: string;
  }>;
  explanation: string;
  source: string;
}

// 3. The List (Push Your Luck)
export interface TheListChallenge {
  id: string;
  roundType: 'THE_LIST';
  category: string;
  prompt: string;
  validAnswers: Array<{
    name: string;
    aliases: string[];
    note?: string;
  }>;
  explanation: string;
  source: string;
}

// 4. Where In Britain
export interface WhereInBritainChallenge {
  id: string;
  roundType: 'WHERE_IN_BRITAIN';
  category: string;
  prompt: string;
  targetName: string;
  region: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  // Coordinates in percentage on the Britain SVG projection (0-100 x, 0-100 y)
  // or real lat/long converted
  lat: number;
  lng: number;
  mapX: number; // 0-100 SVG percentage
  mapY: number; // 0-100 SVG percentage
  explanation: string;
  source: string;
}

// 5. Closest Wins / Estimate
export interface ClosestWinsChallenge {
  id: string;
  roundType: 'CLOSEST_WINS';
  category: string;
  prompt: string;
  correctValue: number;
  unit: string;
  unitPrefix?: string;
  unitSuffix?: string;
  toleranceScale: number; // typical span for scoring
  formatDisplay?: (val: number) => string;
  explanation: string;
  source: string;
}

// 6. Rank It
export interface RankItChallenge {
  id: string;
  roundType: 'RANK_IT';
  category: string;
  prompt: string;
  items: Array<{
    id: string;
    label: string;
    correctRank: number; // 1 to N
    detail: string;
  }>;
  explanation: string;
  source: string;
}

// 7. Image Reveal
export interface ImageRevealChallenge {
  id: string;
  roundType: 'IMAGE_REVEAL';
  category: string;
  prompt: string;
  subjectName: string;
  aliases: string[];
  options?: string[]; // Multiple choice fallback or direct text entry
  imageUrl: string;
  svgGraphicType?: 'landmark' | 'artifact' | 'painting' | 'crest' | 'wildlife' | 'structure';
  visualHint: string;
  explanation: string;
  source: string;
}

// 8. Stop The Score
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

export type Challenge = 
  | Top10Challenge
  | PutUpOrShutUpChallenge
  | TheListChallenge
  | WhereInBritainChallenge
  | ClosestWinsChallenge
  | RankItChallenge
  | ImageRevealChallenge
  | StopTheScoreChallenge;

// Final Case Investigation Stage
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
    {
      stageNumber: 1;
      stageName: 'Visual Evidence Analysis';
      room: 'The Darkroom Archive';
      prompt: string;
      imageHint: string;
      options: string[];
      correctIndex: number;
      clueUnlocked: string;
    },
    {
      stageNumber: 2;
      stageName: 'Geographical Coordinates';
      room: 'The Imperial Atlas Room';
      prompt: string;
      targetLocation: { name: string; mapX: number; mapY: number };
      clueUnlocked: string;
    },
    {
      stageNumber: 3;
      stageName: 'Chronological Interrogation';
      room: 'The Hall of Records';
      prompt: string;
      correctYear: number;
      tolerance: number;
      clueUnlocked: string;
    }
  ];
  explanation: string;
}

export type GamePhase = 
  | 'TITLE'
  | 'SETUP'
  | 'DIRECTIVES'
  | 'ROOM_TRANSITION'
  | 'PLAYING_ROUND'
  | 'FINAL_CASE'
  | 'PODIUM';

export interface RoundConfig {
  roundNumber: number;
  type: RoundType;
  participationMode: RoundParticipationMode;
  name: string;
  roomName: string;
  roomTheme: string;
  challenge?: Challenge;
}
