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
 * Top 10 is a shared 1000-point pool. Lower-ranked, less obvious entries are
 * deliberately worth more. Item values are normalised so discovering every
 * entry distributes exactly 1000 points across the table.
 */
export function getTop10ItemScores(challenge: Top10Challenge): Record<number, number> {
  const rawWeights = challenge.items.map(item => {
    const rankProgress = challenge.items.length <= 1
      ? 1
      : (item.rank - 1) / (challenge.items.length - 1);
    const rarity = Math.max(0.75, item.rarityMultiplier || 1);
    return Math.pow(0.7 + rankProgress * 2.4, 1.35) * Math.pow(rarity, 1.2);
  });

  const total = rawWeights.reduce((sum, value) => sum + value, 0) || 1;
  const scores = rawWeights.map(weight => Math.max(1, Math.round((weight / total) * 1000)));

  // Correct rounding drift on the hardest entry so the pool remains exactly 1000.
  const drift = 1000 - scores.reduce((sum, value) => sum + value, 0);
  if (scores.length > 0) scores[scores.length - 1] += drift;

  return Object.fromEntries(challenge.items.map((item, index) => [item.rank, scores[index]]));
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
