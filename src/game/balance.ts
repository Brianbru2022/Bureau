import type { RankItChallenge, RoundType } from '../types';
import { scoreChainOfCommand } from './chainOfCommand';
import { scoreCommonDossier } from './commonDossier';
import { scoreComplaintsDesk } from './complaintsDesk';
import { dispatchTotal, scoreDispatchAnswer } from './dispatchBox';
import { scoreMisfiledRecords } from './misfiledRecords';
import { scoreMissingMinutes } from './missingMinutes';
import { scorePublicEnquiryJuror } from './publicEnquiry';
import { scoreRedactedRecords } from './redactedRecords';
import { calibrateDepartmentScore, clampScore, scoreBidSuccess, scoreEstimate, scoreImageReveal, scoreListProgress, scoreMapDistance, scoreRanking } from './scoring';
import { scoreSeatingCommittee } from './seatingCommittee';

export interface SimulatedCandidate { id: string; skill: number }
export interface SimulatedMatchResult { totals: Record<string, number>; roundScores: Record<string, number[]> }
export interface RoundBalanceStatistics { roundType: RoundType; minimum: number; lowerDecile: number; typical: number; mean: number; upperDecile: number; maximum: number; zeroRate: number }
export interface SeatBalanceReport { averages: number[]; spread: number }

const clampUnit = (value: number) => Math.max(0, Math.min(1, value));
const seededUnit = (seed: number) => {
  let state = (seed >>> 0) || 1;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
};
const roundSalt = (roundType: RoundType) => {
  let hash = 2166136261;
  for (const character of roundType) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
};
const performanceSample = (skill: number, random: () => number, volatility = .24) =>
  clampUnit(skill + ((random() + random() + random()) / 3 - .5) * 2 * volatility);
const succeeds = (performance: number, random: () => number, difficulty = .45) =>
  random() < clampUnit(.08 + performance * .9 - difficulty * .08);
const elapsedFromPerformance = (performance: number, random: () => number, maximumMs: number) =>
  Math.round(3_000 + (1 - performance) * maximumMs + random() * maximumMs * .16);
const orderedItems = (performance: number, random: () => number): RankItChallenge['items'] => {
  const items = Array.from({ length: 5 }, (_, index) => ({ id: String(index), label: String(index), correctRank: index + 1, detail: '' }));
  const swaps = Math.max(0, Math.round((1 - performance) * 6 + random() * 2 - 1));
  for (let index = 0; index < swaps; index += 1) {
    const first = Math.floor(random() * (items.length - 1));
    [items[first], items[first + 1]] = [items[first + 1], items[first]];
  }
  return items;
};
const orderedNames = (performance: number, random: () => number) => orderedItems(performance, random).map(item => item.label);

/** Feeds representative performance into the real scoring functions. This is
 * a deterministic economy laboratory, not an AI opponent. */
function simulateRawRoundScore(roundType: RoundType, skill: number, random: () => number): number {
  const performance = performanceSample(clampUnit(skill), random);
  const correct = succeeds(performance, random);
  switch (roundType) {
    case 'WHERE_IN_BRITAIN': return scoreMapDistance(Math.pow(1 - performance, 1.55) * 240);
    case 'TOP_10': return clampScore(1000 * Math.pow(performance, .86));
    case 'PUT_UP_OR_SHUT_UP': {
      const bid = Math.max(1, Math.round(1 + performance * 8));
      return correct ? scoreBidSuccess(bid, 10) : 0;
    }
    case 'THE_LIST': {
      const correctCount = Math.max(1, Math.round(1 + performance * 8));
      return random() < Math.max(.04, .38 - performance * .34) ? 0 : scoreListProgress(correctCount, 10);
    }
    case 'CLOSEST_WINS': return scoreEstimate(Math.pow(1 - performance, 1.65) * 82, 25);
    case 'RANK_IT': return scoreRanking(orderedItems(performance, random));
    case 'IMAGE_REVEAL': {
      const revealStep = Math.min(3, Math.floor((1 - performance) * 4));
      return correct ? scoreImageReveal(`balance-${roundSalt(roundType)}`, revealStep) : 0;
    }
    case 'STOP_THE_SCORE': return correct ? clampScore(180 + performance * 780 + (random() - .5) * 120) : 0;
    case 'MISFILED_RECORDS': {
      const clues = Math.min(2, Math.floor((1 - performance) * 3));
      return scoreMisfiledRecords(clues, succeeds(performance, random, .38), succeeds(performance, random, .5));
    }
    case 'REDACTED_RECORDS': return scoreRedactedRecords(Math.min(4, Math.max(1, Math.ceil((1 - performance) * 4))), correct);
    case 'COMMON_DOSSIER': return scoreCommonDossier(Math.min(4, Math.max(1, Math.ceil((1 - performance) * 4))), correct);
    case 'MISSING_MINUTES': return scoreMissingMinutes(elapsedFromPerformance(performance, random, 52_000), correct);
    case 'PUBLIC_ENQUIRY': {
      const trueClaim = random() >= .5;
      const directionalConfidence = 50 + performance * 50;
      return scorePublicEnquiryJuror(trueClaim ? directionalConfidence : 100 - directionalConfidence, trueClaim);
    }
    case 'CHAIN_OF_COMMAND': return scoreChainOfCommand(elapsedFromPerformance(performance, random, 68_000), correct);
    case 'COMPLAINTS_DESK': return scoreComplaintsDesk(elapsedFromPerformance(performance, random, 62_000), 45 + performance * 55, correct);
    case 'SEATING_COMMITTEE': return scoreSeatingCommittee(orderedNames(performance, random), ['0', '1', '2', '3', '4'], elapsedFromPerformance(performance, random, 75_000));
    case 'DISPATCH_BOX': return dispatchTotal(Array.from({ length: 5 }, () => scoreDispatchAnswer(succeeds(performance, random, .42), elapsedFromPerformance(performance, random, 13_000))));
  }
}

export function simulateRoundScore(roundType: RoundType, skill: number, random: () => number): number {
  return calibrateDepartmentScore(roundType, simulateRawRoundScore(roundType, skill, random));
}

/** Repeatable full-match distributions for detecting runaway volatility,
 * worthless departments and changes that make player skill irrelevant. */
export function simulateMatch(seed: number, candidates: SimulatedCandidate[], rounds: RoundType[]): SimulatedMatchResult {
  const totals = Object.fromEntries(candidates.map(candidate => [candidate.id, 0])) as Record<string, number>;
  const roundScores = Object.fromEntries(candidates.map(candidate => [candidate.id, []])) as Record<string, number[]>;
  rounds.forEach((roundType, roundIndex) => candidates.forEach((candidate, candidateIndex) => {
    const candidateSalt = Math.imul(candidateIndex + 1, 2654435761);
    const random = seededUnit((seed ^ roundSalt(roundType) ^ candidateSalt ^ Math.imul(roundIndex + 1, 2246822519)) >>> 0);
    const score = simulateRoundScore(roundType, candidate.skill, random);
    totals[candidate.id] += score;
    roundScores[candidate.id].push(score);
  }));
  return { totals, roundScores };
}

export function aggregateSimulations(count: number, candidates: SimulatedCandidate[], rounds: RoundType[]) {
  const totals = Object.fromEntries(candidates.map(candidate => [candidate.id, 0])) as Record<string, number>;
  for (let seed = 1; seed <= count; seed += 1) {
    const result = simulateMatch(seed, candidates, rounds);
    for (const candidate of candidates) totals[candidate.id] += result.totals[candidate.id];
  }
  return Object.fromEntries(candidates.map(candidate => [candidate.id, Math.round(totals[candidate.id] / Math.max(1, count))]));
}

const percentile = (sorted: number[], fraction: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)))] ?? 0;
export function simulateRoundBalance(count: number, rounds: RoundType[], skill = .6): RoundBalanceStatistics[] {
  return rounds.map(roundType => {
    const scores = Array.from({ length: Math.max(1, count) }, (_, index) => simulateRoundScore(roundType, skill, seededUnit(((index + 1) ^ roundSalt(roundType)) >>> 0))).sort((left, right) => left - right);
    return {
      roundType,
      minimum: scores[0] ?? 0,
      lowerDecile: percentile(scores, .1),
      typical: percentile(scores, .5),
      mean: Math.round(scores.reduce((total, score) => total + score, 0) / scores.length),
      upperDecile: percentile(scores, .9),
      maximum: scores.at(-1) ?? 0,
      zeroRate: Number((scores.filter(score => score === 0).length / scores.length).toFixed(4)),
    };
  });
}

export function simulateThresholdRate(count: number, roundType: RoundType, threshold: number, skill = .6): number {
  let successes = 0;
  for (let index = 0; index < Math.max(1, count); index += 1) {
    const random = seededUnit(((index + 1) ^ roundSalt(roundType)) >>> 0);
    if (simulateRoundScore(roundType, skill, random) >= threshold) successes += 1;
  }
  return successes / Math.max(1, count);
}

export function simulateSeatBalance(count: number, playerCount: 1 | 2 | 4, rounds: RoundType[], skill = .6): SeatBalanceReport {
  const candidates = Array.from({ length: playerCount }, (_, index) => ({ id: `seat-${index + 1}`, skill }));
  const totals = Array.from({ length: playerCount }, () => 0);
  for (let seed = 1; seed <= count; seed += 1) {
    const result = simulateMatch(seed, candidates, rounds);
    candidates.forEach((candidate, index) => { totals[index] += result.totals[candidate.id]; });
  }
  const averages = totals.map(total => Math.round(total / Math.max(1, count)));
  return { averages, spread: Math.max(...averages) - Math.min(...averages) };
}
