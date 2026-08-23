import type { RankItChallenge, Top10Challenge } from '../types';

export const clampScore = (value: number): number =>
  Math.max(0, Math.min(1000, Math.round(Number.isFinite(value) ? value : 0)));

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
export function getTop10ItemScores(challenge: Top10Challenge): Record<number, number> {
  return Object.fromEntries(challenge.items.map(item => {
    const rankProgress = challenge.items.length <= 1
      ? 1
      : (item.rank - 1) / (challenge.items.length - 1);
    const rarityProgress = Math.max(0, Math.min(1, ((item.rarityMultiplier || 1) - 1) / 0.8));
    const rankValue = 125 + 725 * Math.pow(rankProgress, 1.18);
    const rarityBonus = 115 * rarityProgress;
    const texture = (stableUnit(`${challenge.id}:${item.rank}`) - 0.5) * 34;
    return [item.rank, clampScore(rankValue + rarityBonus + texture)];
  }));
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
  return clampScore(1000 * (0.74 * pairRatio + 0.26 * exactRatio));
}

/** Bidding rewards how much of the complete valid set a player confidently
 * commits to. The curve steepens toward a near-complete claim. */
export function scoreBidSuccess(bid: number, totalValidAnswers: number): number {
  if (bid <= 0 || totalValidAnswers <= 0) return 0;
  const proportion = Math.min(1, bid / totalValidAnswers);
  return clampScore(1000 * Math.pow(proportion, 0.72));
}
