import type { RankItChallenge, RoundType, Top10Challenge } from '../types';

export const clampScore = (value: number): number =>
  Math.max(0, Math.min(1000, Math.round(Number.isFinite(value) ? value : 0)));

/**
 * Evidence-led economy calibration. Each power curve is applied to the exact
 * continuous result produced by a department; it never converts performance
 * into bands or fixed awards. Baselines are the Stage 5 seeded regular-player
 * means and are replaced only when sufficient consented beta evidence exists.
 */
export const DEPARTMENT_SCORE_CALIBRATION: Record<RoundType, { exponent: number; baselineMean: number }> = {
  WHERE_IN_BRITAIN: { exponent:.905, baselineMean: 465 },
  TOP_10: { exponent:1.58, baselineMean: 645 },
  PUT_UP_OR_SHUT_UP: { exponent:.42, baselineMean: 391 },
  THE_LIST: { exponent:.72, baselineMean: 409 },
  CLOSEST_WINS: { exponent:1.402, baselineMean: 610 },
  RANK_IT: { exponent:1.70, baselineMean: 651 },
  IMAGE_REVEAL: { exponent:.48, baselineMean: 405 },
  STOP_THE_SCORE: { exponent:.44, baselineMean: 397 },
  MISFILED_RECORDS: { exponent:.954, baselineMean: 484 },
  REDACTED_RECORDS: { exponent:.58, baselineMean: 442 },
  COMMON_DOSSIER: { exponent:.78, baselineMean: 469 },
  MISSING_MINUTES: { exponent:.36, baselineMean: 372 },
  PUBLIC_ENQUIRY: { exponent:1.55, baselineMean: 639 },
  CHAIN_OF_COMMAND: { exponent:.36, baselineMean: 378 },
  COMPLAINTS_DESK: { exponent:.39, baselineMean: 394 },
  SEATING_COMMITTEE: { exponent:1.044, baselineMean: 515 },
  DISPATCH_BOX: { exponent:.64, baselineMean: 361 },
};

export const calibrateDepartmentScore = (roundType: RoundType, continuousScore: number): number =>
  continuousScore <= 0 ? 0 : continuousScore >= 1000 ? 1000 : clampScore(1000*Math.pow(continuousScore/1000,DEPARTMENT_SCORE_CALIBRATION[roundType].exponent));

const stableUnit = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 9999;
};

/**
 * Top 10 values are awarded per discovered entry. Obvious high-ranking entries
 * sit in the low hundreds; obscure lower-ranked entries can approach 1000.
 * Values remain deterministic and granular rather than fixed score bands.
 */
export function getTop10ItemScores(challenge: Top10Challenge, candidateCount = 1): Record<number, number> {
  const rawWeights = challenge.items.map(item => {
    const rankProgress = challenge.items.length <= 1
      ? 1
      : (item.rank - 1) / (challenge.items.length - 1);
    const rarityProgress = Math.max(0, Math.min(1, ((item.rarityMultiplier || 1) - 1) / 0.8));
    const rankValue = 125 + 725 * Math.pow(rankProgress, 1.18);
    const rarityBonus = 115 * rarityProgress;
    const texture = (stableUnit(`${challenge.id}:${item.rank}`) - 0.5) * 34;
    return { rank: item.rank, weight: Math.max(1, rankValue + rarityBonus + texture) };
  });
  const totalWeight = rawWeights.reduce((sum, item) => sum + item.weight, 0);
  // Shared boards gain value as more candidates divide the ten files, but the
  // square-root scale prevents the round from overwhelming the wider economy.
  const boardValue = 1000 * Math.sqrt(Math.max(1, Math.min(4, candidateCount)));
  return Object.fromEntries(rawWeights.map(item => [item.rank, clampScore((item.weight / totalWeight) * boardValue)]));
}

/** Push-your-luck value for The List. Smooth curve: early answers matter, but
 * the final third accelerates. Completing the whole valid set is worth 1000.
 */
export function scoreListProgress(correctCount: number, totalCount: number): number {
  if (correctCount <= 0 || totalCount <= 0) return 0;
  if (correctCount >= totalCount) return 1000;
  const progress = correctCount / totalCount;
  const shaped = 0.16 * Math.sqrt(progress) + 0.84 * Math.pow(progress, 1.48);
  return clampScore(1000 * shaped);
}

/** Image Reveal retains four visual reveal states for now, but scoring is a
 * continuous formula rather than a fixed ladder. Challenge ID supplies a small,
 * deterministic difficulty variation so values are naturally non-round. */
export function scoreImageReveal(challengeId: string, revealStep: number, maxSteps = 4): number {
  const step = Math.max(0, Math.min(maxSteps - 1, revealStep));
  const revealedFraction = step / Math.max(1, maxSteps - 1);
  const difficultyFactor = 0.94 + stableUnit(challengeId) * 0.06;
  const retainedValue = Math.pow(1 - revealedFraction * 0.78, 1.08);
  return clampScore(1000 * difficultyFactor * retainedValue);
}

/** Estimate scoring. toleranceScale is the percentage error that should feel
 * roughly mid-table; it now actually influences scoring. */
export function scoreEstimate(errorPercent: number, toleranceScale = 25): number {
  if (errorPercent <= 0) return 1000;
  const scale = Math.max(5, toleranceScale);
  const score = 1000 * Math.exp(-Math.pow(errorPercent / scale, 0.92) * 0.72);
  return score < 8 ? 0 : clampScore(score);
}

/** Current map mode still supplies approximate km until Stage 3 replaces the
 * map itself. This central curve can be retained when real geodesic distance lands. */
export function scoreMapDistance(distanceKm: number): number {
  if (distanceKm <= 0) return 1000;
  const score = 1000 * Math.exp(-Math.pow(distanceKm / 82, 0.78));
  return score < 8 ? 0 : clampScore(score);
}

/** Ranking rewards exact placement and, more importantly, correct pairwise
 * ordering. This produces granular scores without arbitrary point buckets. */
export function scoreRanking(
  orderedItems: RankItChallenge['items']
): number {
  const n = orderedItems.length;
  if (n <= 1) return 1000;

  let exact = 0;
  let correctPairs = 0;
  const totalPairs = (n * (n - 1)) / 2;

  orderedItems.forEach((item, index) => {
    if (item.correctRank === index + 1) exact += 1;
  });

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      if (orderedItems[i].correctRank < orderedItems[j].correctRank) correctPairs += 1;
    }
  }

  const pairRatio = correctPairs / totalPairs;
  const exactRatio = exact / n;
  const accuracy = 0.68 * pairRatio + 0.32 * exactRatio;
  return clampScore(1000 * Math.pow(accuracy, 1.28));
}

/** Bidding rewards how much of the complete valid set a player confidently
 * commits to. The curve steepens toward a near-complete claim. */
export function scoreBidSuccess(bid: number, totalValidAnswers: number): number {
  if (bid <= 0 || totalValidAnswers <= 0) return 0;
  const proportion = Math.min(1, bid / totalValidAnswers);
  return clampScore(1000 * Math.pow(proportion, 0.72));
}
