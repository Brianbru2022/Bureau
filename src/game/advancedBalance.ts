import type { CommitteePrediction, Player, RivalryMotion, RoundType } from '../types';
import { ALL_ROUND_TYPES, areRoundsSimilar, composeAssessmentSchedule, PRESET_ROUND_COUNTS, ROUND_MOMENTUM } from './match';
import { seededRandom } from './progression';
import { resolveRivalry } from './rivalry';
import { calibrateDepartmentScore, clampScore, scoreBidSuccess, scoreListProgress } from './scoring';
import { simulateRoundScore } from './balance';

export type RiskStrategy = 'CAUTIOUS' | 'BALANCED' | 'AGGRESSIVE';

export interface RiskStrategyReport {
  strategy: RiskStrategy;
  meanTotal: number;
  roundMeans: Record<'PUT_UP_OR_SHUT_UP' | 'THE_LIST' | 'STOP_THE_SCORE', number>;
}

export interface PoliticsPowerReport {
  motion: Exclude<RivalryMotion, 'NONE'>;
  meanScoreAwarded: number;
  maximumScoreAwarded: number;
  scorePerInfluence: number;
}

const riskSettings: Record<RiskStrategy, { ambition: number; safety: number }> = {
  CAUTIOUS: { ambition: .66, safety: .08 },
  BALANCED: { ambition: .83, safety: .02 },
  AGGRESSIVE: { ambition: 1, safety: -.05 },
};

const rawRiskScore = (roundType: 'PUT_UP_OR_SHUT_UP' | 'THE_LIST' | 'STOP_THE_SCORE', strategy: RiskStrategy, random: () => number) => {
  const { ambition, safety } = riskSettings[strategy];
  const performance = Math.max(.05, Math.min(.98, .6 + (random() + random() - 1) * .28));
  if (roundType === 'PUT_UP_OR_SHUT_UP') {
    const bid = Math.max(1, Math.round(1 + performance * 8 * ambition));
    const succeeds = random() < Math.max(.12, .97 - bid * .075 + safety);
    return succeeds ? scoreBidSuccess(bid, 10) : 0;
  }
  if (roundType === 'THE_LIST') {
    const count = Math.max(1, Math.round(1 + performance * 8 * ambition));
    const survives = random() < Math.max(.18, .94 - count * .055 + safety);
    return survives ? scoreListProgress(count, 10) : 0;
  }
  const stake = clampScore(140 + performance * 820 * ambition);
  const correct = random() < Math.max(.2, .42 + performance * .5 + safety - ambition * .08);
  return correct ? stake : 0;
};

const riskScore = (roundType: 'PUT_UP_OR_SHUT_UP' | 'THE_LIST' | 'STOP_THE_SCORE', strategy: RiskStrategy, random: () => number) =>
  calibrateDepartmentScore(roundType,rawRiskScore(roundType,strategy,random));

export function simulateRiskStrategies(count: number): RiskStrategyReport[] {
  const rounds = ['PUT_UP_OR_SHUT_UP','THE_LIST','STOP_THE_SCORE'] as const;
  return (Object.keys(riskSettings) as RiskStrategy[]).map((strategy, strategyIndex) => {
    const totals = Object.fromEntries(rounds.map(round => [round, 0])) as Record<(typeof rounds)[number], number>;
    for (let sample = 1; sample <= Math.max(1, count); sample += 1) {
      rounds.forEach((roundType, roundIndex) => {
        totals[roundType] += riskScore(roundType, strategy, seededRandom(sample * 3571 + strategyIndex * 101 + roundIndex * 17));
      });
    }
    const roundMeans = Object.fromEntries(rounds.map(round => [round, Math.round(totals[round] / Math.max(1, count))])) as RiskStrategyReport['roundMeans'];
    return { strategy, roundMeans, meanTotal: Object.values(roundMeans).reduce((sum, value) => sum + value, 0) };
  });
}

const laboratoryPlayer = (id: string): Player => ({
  id, name:id, avatar:'', color:'', department:'', score:0, influence:3, assets:[],
  secretDirective:{} as Player['secretDirective'], stats:{} as Player['stats'],
});

export function simulatePoliticsPower(count: number): PoliticsPowerReport[] {
  const motions: Array<Exclude<RivalryMotion, 'NONE'>> = ['RAISE_STANDARD','COUNTER_SIGN','SECOND_READING'];
  return motions.map((motion, motionIndex) => {
    let totalAwarded = 0;
    let maximumScoreAwarded = 0;
    for (let sample = 1; sample <= Math.max(1, count); sample += 1) {
      const roundType = ALL_ROUND_TYPES[(sample + motionIndex * 5) % ALL_ROUND_TYPES.length];
      const random = seededRandom(sample * 2903 + motionIndex * 131);
      const targetScore = simulateRoundScore(roundType, .6, random);
      const prediction: CommitteePrediction = { playerId:'challenger', targetPlayerId:'target', stance:random() > .5 ? 'BACK' : 'OBJECT', motion };
      const result = resolveRivalry([laboratoryPlayer('target'),laboratoryPlayer('challenger')],[prediction],'target',targetScore,roundType);
      const awarded = result.outcomes.reduce((sum, outcome) => sum + Math.max(0, outcome.scoreDelta), 0);
      totalAwarded += awarded;
      maximumScoreAwarded = Math.max(maximumScoreAwarded, awarded);
    }
    const meanScoreAwarded = Math.round(totalAwarded / Math.max(1, count));
    const costs: Record<Exclude<RivalryMotion, 'NONE'>, number> = { RAISE_STANDARD:1, COUNTER_SIGN:2, SECOND_READING:2 };
    return { motion, meanScoreAwarded, maximumScoreAwarded, scorePerInfluence: Math.round(meanScoreAwarded / costs[motion]) };
  });
}

export function simulateScheduleVariety(count: number) {
  return ([4,6,8] as const).map(roundCount => {
    let adjacentSimilarPairs = 0;
    let totalAdjacentPairs = 0;
    let distinctRoundTotal = 0;
    let openingMomentumTotal = 0;
    let closingMomentumTotal = 0;
    for (let seed = 1; seed <= Math.max(1, count); seed += 1) {
      const schedule = composeAssessmentSchedule(roundCount, seededRandom(seed));
      distinctRoundTotal += new Set(schedule).size;
      openingMomentumTotal += ROUND_MOMENTUM[schedule[0]];
      closingMomentumTotal += ROUND_MOMENTUM[schedule.at(-1)!];
      for (let index = 1; index < schedule.length; index += 1) {
        totalAdjacentPairs += 1;
        if (areRoundsSimilar(schedule[index - 1], schedule[index])) adjacentSimilarPairs += 1;
      }
    }
    return {
      roundCount,
      expectedPresetCount: Object.values(PRESET_ROUND_COUNTS).includes(roundCount),
      adjacentSimilarityRate: Number((adjacentSimilarPairs / Math.max(1, totalAdjacentPairs)).toFixed(4)),
      meanDistinctRounds: Number((distinctRoundTotal / Math.max(1, count)).toFixed(2)),
      meanOpeningMomentum:Number((openingMomentumTotal/Math.max(1,count)).toFixed(3)),
      meanClosingMomentum:Number((closingMomentumTotal/Math.max(1,count)).toFixed(3)),
    };
  });
}
