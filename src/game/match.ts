import type { DifficultyProfile, GameAction, GameLengthPreset, MatchConfig, MatchState, PoliticsMode, RoundType, ScorePaceProfile, TurnTimerSeconds } from '../types';
import { gameRandom } from './random';

export const DEFAULT_ROUND_ORDER: RoundType[] = ['WHERE_IN_BRITAIN','TOP_10','PUT_UP_OR_SHUT_UP','THE_LIST','CLOSEST_WINS','RANK_IT','IMAGE_REVEAL','STOP_THE_SCORE'];
export const ALL_ROUND_TYPES: RoundType[] = [
  ...DEFAULT_ROUND_ORDER,
  'MISFILED_RECORDS','REDACTED_RECORDS','COMMON_DOSSIER','MISSING_MINUTES','PUBLIC_ENQUIRY',
  'CHAIN_OF_COMMAND','COMPLAINTS_DESK','SEATING_COMMITTEE','DISPATCH_BOX'
];
export const FIRST_ASSESSMENT_ROUND_ORDER: RoundType[] = ['COMPLAINTS_DESK','CLOSEST_WINS','IMAGE_REVEAL','DISPATCH_BOX'];
export const PRESET_ROUND_COUNTS: Record<Exclude<GameLengthPreset, 'CUSTOM'>, number> = { FIRST: 4, QUICK: 4, STANDARD: 6, FULL: 8 };

export type RoundFamily = 'KNOWLEDGE' | 'ESTIMATION' | 'MEMORY' | 'RISK' | 'VISUAL';

export interface SchedulePreferences {
  favouriteRoundTypes: RoundType[];
  excludedRoundTypes: RoundType[];
}

export const ROUND_FAMILIES: Record<RoundType, RoundFamily> = {
  WHERE_IN_BRITAIN: 'ESTIMATION', TOP_10: 'KNOWLEDGE', PUT_UP_OR_SHUT_UP: 'RISK', THE_LIST: 'RISK',
  CLOSEST_WINS: 'ESTIMATION', RANK_IT: 'VISUAL', IMAGE_REVEAL: 'VISUAL', STOP_THE_SCORE: 'RISK',
  MISFILED_RECORDS: 'VISUAL', REDACTED_RECORDS: 'VISUAL', COMMON_DOSSIER: 'KNOWLEDGE', MISSING_MINUTES: 'MEMORY',
  PUBLIC_ENQUIRY: 'ESTIMATION', CHAIN_OF_COMMAND: 'KNOWLEDGE', COMPLAINTS_DESK: 'KNOWLEDGE',
  SEATING_COMMITTEE: 'VISUAL', DISPATCH_BOX: 'KNOWLEDGE'
};

export const ROUND_FAMILY_LABELS: Record<RoundFamily, string> = {
  KNOWLEDGE: 'Knowledge', ESTIMATION: 'Estimation', MEMORY: 'Memory', RISK: 'Risk', VISUAL: 'Visual'
};

/** Relative dramatic intensity used only to arrange a selected itinerary.
 * It does not affect questions or scores. */
export const ROUND_MOMENTUM: Record<RoundType, number> = {
  WHERE_IN_BRITAIN:.45, TOP_10:.55, PUT_UP_OR_SHUT_UP:.85, THE_LIST:.8,
  CLOSEST_WINS:.35, RANK_IT:.5, IMAGE_REVEAL:.7, STOP_THE_SCORE:.95,
  MISFILED_RECORDS:.45, REDACTED_RECORDS:.65, COMMON_DOSSIER:.55, MISSING_MINUTES:.6,
  PUBLIC_ENQUIRY:.75, CHAIN_OF_COMMAND:.7, COMPLAINTS_DESK:.35,
  SEATING_COMMITTEE:.55, DISPATCH_BOX:.9,
};

type SimilarityGroup = 'OPEN_REGISTER' | 'ESTIMATE' | 'ORDERING' | 'REVEAL' | 'CLASSIFY' | 'RISK_GAUGE' | 'MAP' | 'RAPID';

const ROUND_SIMILARITY_GROUPS: Record<RoundType, SimilarityGroup> = {
  WHERE_IN_BRITAIN: 'MAP', TOP_10: 'OPEN_REGISTER', PUT_UP_OR_SHUT_UP: 'OPEN_REGISTER', THE_LIST: 'OPEN_REGISTER',
  CLOSEST_WINS: 'ESTIMATE', RANK_IT: 'ORDERING', IMAGE_REVEAL: 'REVEAL', STOP_THE_SCORE: 'RISK_GAUGE',
  MISFILED_RECORDS: 'CLASSIFY', REDACTED_RECORDS: 'REVEAL', COMMON_DOSSIER: 'CLASSIFY', MISSING_MINUTES: 'REVEAL',
  PUBLIC_ENQUIRY: 'ESTIMATE', CHAIN_OF_COMMAND: 'ORDERING', COMPLAINTS_DESK: 'CLASSIFY',
  SEATING_COMMITTEE: 'ORDERING', DISPATCH_BOX: 'RAPID'
};

export const areRoundsSimilar = (first: RoundType, second: RoundType): boolean =>
  ROUND_SIMILARITY_GROUPS[first] === ROUND_SIMILARITY_GROUPS[second];

export function shapeAssessmentMomentum(selected: RoundType[]): RoundType[] {
  if (selected.length < 2) return [...selected];
  const targetAt = (index:number) => .3 + .65 * index / (selected.length - 1);
  let best:RoundType[]|null=null;
  let bestCost=Number.POSITIVE_INFINITY;
  for (const opening of selected) {
    const sequence=[opening];
    const remaining=selected.filter(type=>type!==opening);
    let valid=true;
    while(remaining.length){
      const target=targetAt(sequence.length);
      const candidates=remaining.filter(type=>!areRoundsSimilar(sequence.at(-1)!,type));
      if(!candidates.length){valid=false;break;}
      candidates.sort((left,right)=>Math.abs(ROUND_MOMENTUM[left]-target)-Math.abs(ROUND_MOMENTUM[right]-target));
      const next=candidates[0];sequence.push(next);remaining.splice(remaining.indexOf(next),1);
    }
    if(!valid)continue;
    const cost=sequence.reduce((sum,type,index)=>sum+Math.abs(ROUND_MOMENTUM[type]-targetAt(index)),0);
    if(cost<bestCost){best=sequence;bestCost=cost;}
  }
  return best??[...selected];
}

export function composeAssessmentSchedule(count: number, random: () => number = gameRandom, recentRoundTypes: RoundType[] = [], preferences?: SchedulePreferences): RoundType[] {
  const required = Math.max(1, Math.min(ALL_ROUND_TYPES.length, Math.round(count)));
  const recent = new Set(recentRoundTypes.filter(type => ALL_ROUND_TYPES.includes(type)));
  const excluded = new Set(preferences?.excludedRoundTypes ?? []);
  const favourites = new Set(preferences?.favouriteRoundTypes ?? []);
  const permitted = ALL_ROUND_TYPES.filter(type => !excluded.has(type));
  const pool = permitted.length >= required ? permitted : [...permitted, ...ALL_ROUND_TYPES.filter(type => excluded.has(type))];
  const fresh = pool.filter(type => !recent.has(type));
  const available = fresh.length >= required ? [...fresh] : [...pool];
  const familyUse = new Map<RoundFamily, number>();
  const schedule: RoundType[] = [];

  while (schedule.length < required) {
    const unused = available.filter(type => !schedule.includes(type));
    const previous = schedule.at(-1);
    const dissimilar = previous ? unused.filter(type => !areRoundsSimilar(previous, type)) : unused;
    let candidates = dissimilar.length ? dissimilar : unused;
    const leastUsedFamily = Math.min(...candidates.map(type => familyUse.get(ROUND_FAMILIES[type]) ?? 0));
    candidates = candidates.filter(type => (familyUse.get(ROUND_FAMILIES[type]) ?? 0) === leastUsedFamily);
    const unseen = candidates.filter(type => !recent.has(type));
    if (unseen.length) candidates = unseen;
    const weighted = candidates.flatMap(type => favourites.has(type) ? [type, type, type] : [type]);
    const selected = weighted[Math.floor(random() * weighted.length)] ?? candidates[0];
    schedule.push(selected);
    familyUse.set(ROUND_FAMILIES[selected], (familyUse.get(ROUND_FAMILIES[selected]) ?? 0) + 1);
  }

  return shapeAssessmentMomentum(schedule);
}

export function createMatchConfig(preset: GameLengthPreset, selected: RoundType[] = DEFAULT_ROUND_ORDER, timerSeconds: TurnTimerSeconds = 0, politicsMode: PoliticsMode = 'STANDARD', guidedMode = true, difficultyProfile: DifficultyProfile = 'MIXED', random: () => number = gameRandom, recentRoundTypes: RoundType[] = [], preferences?: SchedulePreferences, scorePaceProfile: ScorePaceProfile = 'STANDARD'): MatchConfig {
  const unique = [...new Set(selected)].filter(type => ALL_ROUND_TYPES.includes(type));
  const count = preset === 'CUSTOM' ? Math.max(4, Math.min(8, unique.length)) : PRESET_ROUND_COUNTS[preset];
  const roundTypes = preset === 'FIRST'
    ? [...FIRST_ASSESSMENT_ROUND_ORDER]
    : preset === 'CUSTOM'
    ? [...unique, ...ALL_ROUND_TYPES.filter(type => !unique.includes(type))].slice(0, count)
    : composeAssessmentSchedule(count, random, recentRoundTypes, preferences);
  const firstAssessment = preset === 'FIRST';
  const selectedPolitics = firstAssessment ? 'OFF' : politicsMode;
  return {
    preset,
    roundTypes,
    timerSeconds: firstAssessment ? 0 : timerSeconds,
    officePolitics: selectedPolitics !== 'OFF',
    politicsMode: selectedPolitics,
    guidedMode: firstAssessment ? false : guidedMode,
    difficultyProfile: firstAssessment ? 'ACCESSIBLE' : difficultyProfile,
    scorePaceProfile: firstAssessment ? 'RELAXED' : scorePaceProfile
  };
}

export function createMatchConfigFromSchedule(preset: GameLengthPreset, roundTypes: RoundType[], timerSeconds: TurnTimerSeconds = 0, politicsMode: PoliticsMode = 'STANDARD', guidedMode = true, difficultyProfile: DifficultyProfile = 'MIXED', scorePaceProfile: ScorePaceProfile = 'STANDARD'): MatchConfig {
  const unique = [...new Set(roundTypes)].filter(type => ALL_ROUND_TYPES.includes(type));
  const count = preset === 'CUSTOM' ? Math.max(4, Math.min(8, unique.length)) : PRESET_ROUND_COUNTS[preset];
  const completed = preset === 'FIRST'
    ? [...FIRST_ASSESSMENT_ROUND_ORDER]
    : [...unique, ...ALL_ROUND_TYPES.filter(type => !unique.includes(type))].slice(0, count);
  const firstAssessment = preset === 'FIRST';
  const selectedPolitics = firstAssessment ? 'OFF' : politicsMode;
  return {
    preset,
    roundTypes: completed,
    timerSeconds: firstAssessment ? 0 : timerSeconds,
    officePolitics: selectedPolitics !== 'OFF',
    politicsMode: selectedPolitics,
    guidedMode: firstAssessment ? false : guidedMode,
    difficultyProfile: firstAssessment ? 'ACCESSIBLE' : difficultyProfile,
    scorePaceProfile: firstAssessment ? 'RELAXED' : scorePaceProfile
  };
}

export function miniGameBoundaries(roundCount: number): Set<number> {
  if (roundCount <= 4) return new Set([2]);
  return new Set([Math.max(2, Math.round(roundCount / 3)), Math.max(3, Math.round((roundCount * 2) / 3))]);
}

export function politicsRoundIndices(mode: PoliticsMode, roundCount: number): Set<number> {
  if (mode === 'OFF' || roundCount <= 1) return new Set();
  if (mode === 'STANDARD') return new Set(Array.from({length:roundCount-1},(_,index)=>index+1));
  const appearances=Math.max(1,Math.round(roundCount/3));
  return new Set(Array.from({length:appearances},(_,index)=>Math.min(roundCount-1,Math.round((index+1)*roundCount/(appearances+1)))));
}

export const shouldRunOfficePolitics = (mode: PoliticsMode, roundIndex: number, roundCount: number) =>
  politicsRoundIndices(mode,roundCount).has(roundIndex);

export function createMatchState(config: MatchConfig): MatchState {
  return {
    config, phase:'TITLE', selectedPlayerCount:2, players:[], currentRoundIndex:0, roundStarterIndex:0,
    playersCompletedThisRound:0, usedChallengeIdsThisRound:[], currentChallengeId:null,
    hiddenCommendations:[], scoreHistory:[], bureauReviewUsed:false, reviewEligiblePlayerId:null,
    armedAssets:{}, priorityStarterPlayerId:null, miniGameType:null, miniGamesPlayed:[],
    freeMotionPlayerId:null, rivalryTargetScore:null, finalCaseIndex:0, timerPaused:false,
    adjudicationHistory:[], committeePredictions:[], rivalryOutcomes:[]
  };
}

export function matchReducer(state: MatchState, action: GameAction): MatchState {
  switch (action.type) {
    case 'SET_PHASE': return { ...state, phase: action.phase };
    case 'ADVANCE_ROUND': return { ...state, currentRoundIndex: state.currentRoundIndex + 1, roundStarterIndex: action.starterIndex, playersCompletedThisRound: 0, timerPaused: false };
    case 'ADVANCE_PLAYER': return { ...state, playersCompletedThisRound: state.playersCompletedThisRound + 1, timerPaused: false };
    case 'SET_TIMER_PAUSED': return { ...state, timerPaused: action.paused };
    case 'RECORD_ADJUDICATION': return { ...state, adjudicationHistory: [...state.adjudicationHistory, action.record] };
    case 'REVERSE_LAST_ADJUDICATION': {
      let index = -1;
      for (let recordIndex = state.adjudicationHistory.length - 1; recordIndex >= 0; recordIndex -= 1) {
        const record = state.adjudicationHistory[recordIndex];
        if (record.challengeId === action.challengeId && record.reversedAt === undefined) { index = recordIndex; break; }
      }
      if (index < 0) return state;
      return {
        ...state,
        adjudicationHistory: state.adjudicationHistory.map((record, recordIndex) => recordIndex === index ? { ...record, reversedAt: action.reversedAt } : record)
      };
    }
    case 'SET_COMMITTEE': return { ...state, committeePredictions:action.predictions };
    case 'RESOLVE_RIVALRY': return { ...state, rivalryOutcomes:action.outcomes };
    case 'PATCH_MATCH': return { ...state, ...action.patch };
    case 'APPEND_SCORE_SNAPSHOT': return { ...state, scoreHistory:[...state.scoreHistory,action.snapshot] };
    case 'HYDRATE_MATCH': return action.state;
    case 'RESET_MATCH': return createMatchState(action.config);
  }
}
