import type { ArmedAssetState, BureauAssetKey, Player, RoundParticipationMode } from '../types';
export type { ArmedAssetState } from '../types';

export interface AssetScoreResult {
  baseScores: Record<string, number>;
  finalScores: Record<string, number>;
  consumed: Array<{ playerId: string; asset: BureauAssetKey }>;
}

export function resolveAssetScores(
  scoreOrScores: number | Record<string, number>,
  activePlayerId: string | null,
  players: Player[],
  armedAssets: ArmedAssetState,
  participationMode: RoundParticipationMode,
  extraData?: Record<string, unknown>
): AssetScoreResult {
  const baseScores: Record<string, number> = typeof scoreOrScores === 'number'
    ? activePlayerId ? { [activePlayerId]: scoreOrScores } : {}
    : { ...scoreOrScores };
  const finalScores = { ...baseScores };
  const consumed: AssetScoreResult['consumed'] = [];

  Object.entries(baseScores).forEach(([playerId, baseScore]) => {
    const armed = armedAssets[playerId] ?? [];
    if (armed.includes('SECOND_OPINION')) {
      if (baseScore > 0) finalScores[playerId] += Math.min(100, Math.round(baseScore * 0.12));
      consumed.push({ playerId, asset: 'SECOND_OPINION' });
    }
    if (armed.includes('DOUBLE_ENTRY')) {
      if (baseScore > 0) finalScores[playerId] += Math.min(350, Math.round(baseScore * 0.40));
      consumed.push({ playerId, asset: 'DOUBLE_ENTRY' });
    }
    if (armed.includes('INSURANCE')) {
      if (baseScore === 0) {
        const riskedValue = typeof extraData?.riskedValue === 'number' ? extraData.riskedValue : 0;
        finalScores[playerId] += Math.min(350, Math.max(150, Math.round(riskedValue * 0.35)));
      }
      consumed.push({ playerId, asset: 'INSURANCE' });
    }
  });

  if (participationMode === 'EVERYONE_TAKES_A_TURN') {
    const scoringOpponent = Object.entries(baseScores).find(([, score]) => score > 0);
    if (scoringOpponent) {
      const [victimId, victimBase] = scoringOpponent;
      const interceptor = players.find(player => player.id !== victimId && (armedAssets[player.id] ?? []).includes('INTERCEPT'));
      if (interceptor) {
        const transfer = Math.max(1, Math.round(victimBase * 0.20));
        finalScores[victimId] = Math.max(0, finalScores[victimId] - transfer);
        finalScores[interceptor.id] = (finalScores[interceptor.id] || 0) + transfer;
        consumed.push({ playerId: interceptor.id, asset: 'INTERCEPT' });
      }
    }
  }

  return { baseScores, finalScores, consumed };
}
