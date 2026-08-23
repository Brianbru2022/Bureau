import type { Player, SecretDirective } from '../types';

export interface DirectiveEvaluation {
  completed: boolean;
  progressText: string;
}

const statBag = (player: Player) => player.stats as Player['stats'] & {
  challengeScores?: number[];
  mapScores?: number[];
  successfulListBanks?: number[];
  categoryScores?: Record<string, number[]>;
  assetsUsed?: string[];
};

export function evaluateSecretDirective(player: Player): DirectiveEvaluation {
  const stats = statBag(player);
  const scores = stats.challengeScores ?? [];
  const mapScores = stats.mapScores ?? [];
  const listBanks = stats.successfulListBanks ?? [];
  const categoryScores = stats.categoryScores ?? {};
  const scoredCategories = Object.values(categoryScores).filter(values => values.some(score => score > 0)).length;
  const mistakeRate = stats.totalAnswers > 0
    ? (stats.totalAnswers - stats.correctAnswers) / stats.totalAnswers
    : 1;
  const bestEstimateError = stats.estimateErrorsPercent.length > 0
    ? Math.min(...stats.estimateErrorsPercent)
    : Infinity;

  switch (player.secretDirective.id) {
    case 'dir-gambler': {
      const qualifying = scores.filter(score => score >= 850).length;
      return {
        completed: qualifying >= 2,
        progressText: `${qualifying}/2 challenge scores reached 850+.`
      };
    }
    case 'dir-cartographer': {
      const best = mapScores.length > 0 ? Math.max(...mapScores) : 0;
      return {
        completed: best >= 750,
        progressText: `Best map score: ${best}. Required: 750.`
      };
    }
    case 'dir-opportunist': {
      const intercepted = stats.interceptCount > 0;
      return {
        completed: intercepted || scoredCategories >= 3,
        progressText: intercepted
          ? `${stats.interceptCount} successful intercept${stats.interceptCount === 1 ? '' : 's'}.`
          : `Scored in ${scoredCategories}/3 departments.`
      };
    }
    case 'dir-generalist':
      return {
        completed: scoredCategories >= 4,
        progressText: `Scored in ${scoredCategories}/4 distinct categories.`
      };
    case 'dir-specialist': {
      const best = scores.length > 0 ? Math.max(...scores) : 0;
      return {
        completed: best >= 920,
        progressText: `Best challenge score: ${best}. Required: 920.`
      };
    }
    case 'dir-survivor': {
      const best = listBanks.length > 0 ? Math.max(...listBanks) : 0;
      return {
        completed: best >= 600,
        progressText: `Best successful List bank: ${best}. Required: 600.`
      };
    }
    case 'dir-conservative': {
      const pct = Math.round(mistakeRate * 100);
      return {
        completed: stats.totalAnswers > 0 && mistakeRate < 0.30,
        progressText: `Mistake rate: ${pct}%. Required: below 30%.`
      };
    }
    case 'dir-precisionist': {
      const display = Number.isFinite(bestEstimateError) ? `${bestEstimateError.toFixed(1)}%` : 'No estimate recorded';
      return {
        completed: bestEstimateError < 12,
        progressText: `Best estimate error: ${display}. Required: below 12%.`
      };
    }
    default:
      return { completed: false, progressText: 'No valid evaluation rule was found.' };
  }
}

export function applyDirectiveEvaluation(player: Player): Player {
  const result = evaluateSecretDirective(player);
  return {
    ...player,
    secretDirective: {
      ...player.secretDirective,
      isCompleted: result.completed,
      progressText: result.progressText
    }
  };
}
