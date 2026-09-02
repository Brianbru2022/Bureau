import type { Player, RoundParticipationMode } from '../types';

export type ScoreMap = Record<string, number>;

export interface TrailingResult {
  score: number;
  players: Player[];
}

/** Returns every player tied for the lowest score, preserving table order. */
export function findTrailingPlayers(players: Player[]): TrailingResult | null {
  if (players.length === 0) return null;
  const score = Math.min(...players.map(player => player.score));
  return { score, players: players.filter(player => player.score === score) };
}

/** Ties are resolved deterministically in favour of the earliest seated player. */
export function selectReviewCandidate(players: Player[]): Player | null {
  return findTrailingPlayers(players)?.players[0] ?? null;
}

export function nextStarterIndex(
  playerCount: number,
  nextRoundIndex: number,
  priorityPlayerIndex: number | null = null
): number {
  if (playerCount <= 0) return 0;
  if (priorityPlayerIndex !== null && priorityPlayerIndex >= 0 && priorityPlayerIndex < playerCount) {
    return priorityPlayerIndex;
  }
  return nextRoundIndex % playerCount;
}

/** Returns whether a round component should hand the apparatus to another
 * candidate before the shared round result is filed. */
export function hasAnotherCandidateTurn(
  participationMode: RoundParticipationMode,
  completedCandidateTurns: number,
  playerCount: number,
): boolean {
  return participationMode === 'EVERYONE_TAKES_A_TURN'
    && completedCandidateTurns + 1 < Math.max(0, playerCount);
}

export function applyScoreDeltas(players: Player[], deltas: ScoreMap): Player[] {
  return players.map(player => ({
    ...player,
    score: Math.max(0, player.score + (deltas[player.id] ?? 0))
  }));
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
