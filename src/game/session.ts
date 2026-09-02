import type { Challenge, MatchConfig, MatchState, Player, RoundType } from '../types';
import { ALL_ROUND_TYPES, type SchedulePreferences } from './match';

const SESSION_KEY = 'the-bureau.active-game.v4';
const V3_SESSION_KEY = 'the-bureau.active-game.v3';
const V2_SESSION_KEY = 'the-bureau.active-game.v2';
const LEGACY_SESSION_KEY = 'the-bureau.active-game.v1';
const RECENT_KEY = 'the-bureau.recent-challenges.v1';
const RECENT_DEPARTMENTS_KEY = 'the-bureau.recent-departments.v1';
const RECENT_DEPARTMENTS_V2_KEY = 'the-bureau.recent-departments.v2';
const DEPARTMENT_PREFERENCES_KEY = 'the-bureau.department-preferences.v1';
const MAX_RECENT_CHALLENGES = 80;
const MAX_EXCLUDED_DEPARTMENTS = ALL_ROUND_TYPES.length - 8;
let lastLoadNotice:string|null=null;

export interface SavedGame {
  version: 4;
  savedAt: number;
  state: MatchState;
}

const serialisePlayers = (players: Player[]) => players.map(player => ({
  ...player,
  stats: {
    ...player.stats,
    categoriesAttempted: [...player.stats.categoriesAttempted]
  }
}));

const restorePlayers = (players: Player[]): Player[] => players.map(player => ({
  ...player,
  influence: Math.max(0,Math.min(3,player.influence??1)),
  stats: {
    ...player.stats,
    categoriesAttempted: new Set(Array.isArray(player.stats.categoriesAttempted) ? player.stats.categoriesAttempted : [])
  }
}));

export function saveGame(game: SavedGame): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...game, state:{...game.state,players:serialisePlayers(game.state.players)} }));
  } catch {
    // Storage can be unavailable in privacy modes. Gameplay remains functional.
  }
}

export function loadGame(): SavedGame | null {
  try {
    const current = localStorage.getItem(SESSION_KEY);
    const versionThree = localStorage.getItem(V3_SESSION_KEY);
    const previous = localStorage.getItem(V2_SESSION_KEY);
    const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
    const raw = current ?? versionThree ?? previous ?? legacy;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedGame> & Record<string,unknown>;
    const currentState=parsed.version===4&&parsed.state?parsed.state:undefined;
    const legacyState=parsed as Record<string,any>;
    const players=(currentState?.players??legacyState.players) as Player[]|undefined;
    const phase=currentState?.phase??legacyState.phase;
    if (!players?.length || phase === 'TITLE') {
      if (raw && phase !== 'TITLE') lastLoadNotice='An incomplete Bureau save was discarded because it contained no candidates.';
      return null;
    }
    const roundLimit=legacyState.roundLimit??8;
    const sourceConfig=(currentState?.config??legacyState.matchConfig) as MatchConfig|undefined;
    const config:MatchConfig=sourceConfig?{...sourceConfig,officePolitics:sourceConfig.officePolitics??false,politicsMode:sourceConfig.politicsMode??(sourceConfig.officePolitics?'STANDARD':'OFF'),guidedMode:sourceConfig.guidedMode??true,difficultyProfile:sourceConfig.difficultyProfile??'MIXED',scorePaceProfile:sourceConfig.scorePaceProfile??'STANDARD'}:{preset:legacyState.preset??'FULL',roundTypes:(['WHERE_IN_BRITAIN','TOP_10','PUT_UP_OR_SHUT_UP','THE_LIST','CLOSEST_WINS','RANK_IT','IMAGE_REVEAL','STOP_THE_SCORE'] as RoundType[]).slice(0,roundLimit),timerSeconds:0,officePolitics:false,politicsMode:'OFF',guidedMode:true,difficultyProfile:'MIXED',scorePaceProfile:'STANDARD'};
    const source=currentState??legacyState;
    const state:MatchState={
      config,phase,selectedPlayerCount:source.selectedPlayerCount??players.length,players:restorePlayers(players),
      currentRoundIndex:source.currentRoundIndex??0,roundStarterIndex:source.roundStarterIndex??0,playersCompletedThisRound:source.playersCompletedThisRound??0,
      usedChallengeIdsThisRound:source.usedChallengeIdsThisRound??[],currentChallengeId:source.currentChallengeId??null,
      hiddenCommendations:source.hiddenCommendations??[],scoreHistory:source.scoreHistory??[],bureauReviewUsed:source.bureauReviewUsed??false,
      reviewEligiblePlayerId:source.reviewEligiblePlayerId??null,armedAssets:source.armedAssets??{},priorityStarterPlayerId:source.priorityStarterPlayerId??null,
      miniGameType:source.miniGameType??null,miniGamesPlayed:source.miniGamesPlayed??[],freeMotionPlayerId:source.freeMotionPlayerId??null,
      rivalryTargetScore:source.rivalryTargetScore??null,finalCaseIndex:source.finalCaseIndex??0,timerPaused:source.timerPaused??false,
      adjudicationHistory:source.adjudicationHistory??[],committeePredictions:source.committeePredictions??[],rivalryOutcomes:source.rivalryOutcomes??[]
    };
    const migrated:SavedGame={version:4,savedAt:typeof parsed.savedAt==='number'?parsed.savedAt:Date.now(),state};
    if (!current) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...migrated,state:{...state,players:serialisePlayers(state.players)} }));
    return migrated;
  } catch {
    lastLoadNotice='A damaged Bureau save was discarded. You can begin a new assessment safely.';
    try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(V3_SESSION_KEY); localStorage.removeItem(V2_SESSION_KEY); localStorage.removeItem(LEGACY_SESSION_KEY); } catch { /* ignored */ }
    return null;
  }
}

export function consumeLoadNotice():string|null { const notice=lastLoadNotice;lastLoadNotice=null;return notice; }

export function clearSavedGame(): void {
  try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(V3_SESSION_KEY); localStorage.removeItem(V2_SESSION_KEY); localStorage.removeItem(LEGACY_SESSION_KEY); } catch { /* ignored */ }
}

export function rememberChallenge(challenge: Challenge | null): void {
  if (!challenge) return;
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    localStorage.setItem(RECENT_KEY, JSON.stringify([challenge.id, ...existing.filter(id => id !== challenge.id)].slice(0, MAX_RECENT_CHALLENGES)));
  } catch { /* ignored */ }
}

export function loadRecentChallengeIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberAssessmentDepartments(roundTypes: RoundType[]): void {
  try {
    const valid = [...new Set(roundTypes)].filter(type => ALL_ROUND_TYPES.includes(type));
    const existing = loadRecentAssessmentDepartments();
    const history = [valid, ...existing.filter(assessment => assessment.join('|') !== valid.join('|'))].slice(0, 2);
    localStorage.setItem(RECENT_DEPARTMENTS_V2_KEY, JSON.stringify(history));
    localStorage.setItem(RECENT_DEPARTMENTS_KEY, JSON.stringify(valid));
  } catch { /* ignored */ }
}

export function loadRecentAssessmentDepartments(): RoundType[][] {
  try {
    const current = localStorage.getItem(RECENT_DEPARTMENTS_V2_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, 2).map(assessment => Array.isArray(assessment)
        ? [...new Set(assessment.filter((item): item is RoundType => typeof item === 'string' && ALL_ROUND_TYPES.includes(item as RoundType)))]
        : []).filter(assessment => assessment.length > 0);
    }
    const legacy = JSON.parse(localStorage.getItem(RECENT_DEPARTMENTS_KEY) ?? '[]');
    const valid = Array.isArray(legacy) ? legacy.filter((item): item is RoundType => typeof item === 'string' && ALL_ROUND_TYPES.includes(item as RoundType)) : [];
    return valid.length ? [[...new Set(valid)]] : [];
  } catch {
    return [];
  }
}

export function loadRecentDepartmentIds(): RoundType[] {
  return [...new Set(loadRecentAssessmentDepartments().flat())];
}

const sanitiseDepartmentPreferences = (value?: Partial<SchedulePreferences> | null): SchedulePreferences => {
  const excludedRoundTypes = [...new Set(value?.excludedRoundTypes ?? [])]
    .filter(type => ALL_ROUND_TYPES.includes(type)).slice(0, MAX_EXCLUDED_DEPARTMENTS);
  const excluded = new Set(excludedRoundTypes);
  const favouriteRoundTypes = [...new Set(value?.favouriteRoundTypes ?? [])]
    .filter(type => ALL_ROUND_TYPES.includes(type) && !excluded.has(type));
  return { favouriteRoundTypes, excludedRoundTypes };
};

export function loadDepartmentPreferences(): SchedulePreferences {
  try {
    return sanitiseDepartmentPreferences(JSON.parse(localStorage.getItem(DEPARTMENT_PREFERENCES_KEY) ?? '{}'));
  } catch {
    return sanitiseDepartmentPreferences();
  }
}

export function saveDepartmentPreferences(preferences: SchedulePreferences): SchedulePreferences {
  const sanitised = sanitiseDepartmentPreferences(preferences);
  try { localStorage.setItem(DEPARTMENT_PREFERENCES_KEY, JSON.stringify(sanitised)); } catch { /* ignored */ }
  return sanitised;
}
