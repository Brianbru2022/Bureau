import { HiddenCommendation, Player, type ScoreSnapshot } from '../types';
export type { ScoreSnapshot } from '../types';

type EvaluationContext = {
  players: Player[];
  scoreHistory: ScoreSnapshot[];
};

type CommendationDefinition = {
  id: string;
  title: string;
  description: string;
  evaluator: (context: EvaluationContext) => { winnerId: string; note: string } | null;
  bonusPoints: number;
};

const statBag = (player: Player) => player.stats as Player['stats'] & {
  challengeScores?: number[];
  mapScores?: number[];
  successfulListBanks?: number[];
  categoryScores?: Record<string, number[]>;
  assetsUsed?: string[];
};

export const allPossibleCommendations: CommendationDefinition[] = [
  {
    id: 'comm-human-sat-nav',
    title: 'HUMAN SAT NAV',
    description: 'Best genuine UK map performance.',
    bonusPoints: 350,
    evaluator: ({ players }) => {
      const candidates = players.filter(p => p.stats.mapDistancesKm.length > 0);
      if (candidates.length === 0) return null;
      const winner = [...candidates].sort((a, b) => {
        const avgA = a.stats.mapDistancesKm.reduce((sum, v) => sum + v, 0) / a.stats.mapDistancesKm.length;
        const avgB = b.stats.mapDistancesKm.reduce((sum, v) => sum + v, 0) / b.stats.mapDistancesKm.length;
        return avgA - avgB;
      })[0];
      const avg = winner.stats.mapDistancesKm.reduce((sum, v) => sum + v, 0) / winner.stats.mapDistancesKm.length;
      return { winnerId: winner.id, note: `Average map error: ${avg.toFixed(1)} km. Irritatingly navigable.` };
    }
  },
  {
    id: 'comm-walking-encyclopaedia',
    title: 'WALKING ENCYCLOPAEDIA',
    description: 'Highest overall recorded accuracy.',
    bonusPoints: 400,
    evaluator: ({ players }) => {
      const candidates = players.filter(p => p.stats.totalAnswers > 0);
      if (candidates.length === 0) return null;
      const winner = [...candidates].sort((a, b) =>
        (b.stats.correctAnswers / Math.max(1, b.stats.totalAnswers)) -
        (a.stats.correctAnswers / Math.max(1, a.stats.totalAnswers))
      )[0];
      const pct = Math.round((winner.stats.correctAnswers / Math.max(1, winner.stats.totalAnswers)) * 100);
      return { winnerId: winner.id, note: `${pct}% recorded accuracy. The Bureau has checked for cheating and found only competence.` };
    }
  },
  {
    id: 'comm-confidently-incorrect',
    title: 'CONFIDENTLY INCORRECT',
    description: 'Most failed high-risk attempts.',
    bonusPoints: 300,
    evaluator: ({ players }) => {
      const candidates = players.filter(p => p.stats.risksTaken > 0);
      if (candidates.length === 0) return null;
      const winner = [...candidates].sort((a, b) =>
        (b.stats.risksTaken - b.stats.successfulRisks) - (a.stats.risksTaken - a.stats.successfulRisks)
      )[0];
      const failed = winner.stats.risksTaken - winner.stats.successfulRisks;
      return { winnerId: winner.id, note: `${failed} high-confidence failure${failed === 1 ? '' : 's'}. Courage has again outpaced evidence.` };
    }
  },
  {
    id: 'comm-comeback-king',
    title: 'SPECTACULAR RECOVERY',
    description: 'Largest deficit genuinely recovered during the game.',
    bonusPoints: 400,
    evaluator: ({ players, scoreHistory }) => {
      if (players.length < 2 || scoreHistory.length < 2) return null;
      let best: { playerId: string; recovery: number } | null = null;

      players.forEach(player => {
        let worstDeficit = 0;
        scoreHistory.forEach(snapshot => {
          const own = snapshot.scores[player.id] ?? 0;
          const leader = Math.max(...Object.values(snapshot.scores));
          worstDeficit = Math.max(worstDeficit, leader - own);
        });
        const finalSnapshot = scoreHistory[scoreHistory.length - 1];
        const finalOwn = finalSnapshot.scores[player.id] ?? player.score;
        const finalLeader = Math.max(...Object.values(finalSnapshot.scores));
        const remainingDeficit = finalLeader - finalOwn;
        const recovery = worstDeficit - remainingDeficit;
        if (!best || recovery > best.recovery) best = { playerId: player.id, recovery };
      });

      if (!best || best.recovery <= 0) return null;
      return { winnerId: best.playerId, note: `Recovered ${Math.round(best.recovery)} points from their worst deficit. The paperwork for the collapse had already been prepared.` };
    }
  },
  {
    id: 'comm-bureaucratic-survivor',
    title: 'BUREAUCRATIC SURVIVOR',
    description: 'Best successful bank in The List.',
    bonusPoints: 350,
    evaluator: ({ players }) => {
      const candidates = players.filter(p => (statBag(p).successfulListBanks ?? []).length > 0);
      if (candidates.length === 0) return null;
      const winner = [...candidates].sort((a, b) =>
        Math.max(...(statBag(b).successfulListBanks ?? [0])) - Math.max(...(statBag(a).successfulListBanks ?? [0]))
      )[0];
      const best = Math.max(...(statBag(winner).successfulListBanks ?? [0]));
      return { winnerId: winner.id, note: `Banked ${best} points without detonating the list. Restraint has been provisionally acknowledged.` };
    }
  },
  {
    id: 'comm-generalist',
    title: 'UNPLEASANTLY WELL-ROUNDED',
    description: 'Scored positively across the widest range of categories.',
    bonusPoints: 375,
    evaluator: ({ players }) => {
      const counts = players.map(player => ({
        player,
        count: Object.values(statBag(player).categoryScores ?? {}).filter(scores => scores.some(score => score > 0)).length
      }));
      const winner = [...counts].sort((a, b) => b.count - a.count)[0];
      if (!winner || winner.count === 0) return null;
      return { winnerId: winner.player.id, note: `Scored in ${winner.count} categories. Apparently specialising was considered beneath them.` };
    }
  },
  {
    id: 'comm-specialist',
    title: 'DISTURBINGLY SPECIFIC',
    description: 'Highest single unassisted challenge score.',
    bonusPoints: 325,
    evaluator: ({ players }) => {
      const scored = players.map(player => ({
        player,
        best: Math.max(...(statBag(player).challengeScores ?? [0]))
      }));
      const winner = [...scored].sort((a, b) => b.best - a.best)[0];
      if (!winner || winner.best <= 0) return null;
      return { winnerId: winner.player.id, note: `Best recorded challenge score: ${winner.best}. A regrettably convincing display of expertise.` };
    }
  }
];

export function selectSecretCommendations(count = 2, random: () => number = Math.random): HiddenCommendation[] {
  const shuffled = [...allPossibleCommendations].sort(() => random() - 0.5).slice(0, count);
  return shuffled.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    evaluationNote: '',
    winnerPlayerId: null,
    bonusPoints: c.bonusPoints
  }));
}

export function evaluateCommendations(
  players: Player[],
  selected: HiddenCommendation[],
  scoreHistory: ScoreSnapshot[]
): {
  commendationsWithWinners: Array<{ commendation: HiddenCommendation; winner: Player }>;
  playerBonusMap: Record<string, number>;
} {
  const commendationsWithWinners: Array<{ commendation: HiddenCommendation; winner: Player }> = [];
  const playerBonusMap: Record<string, number> = {};
  const selectedIds = new Set(selected.map(c => c.id));

  allPossibleCommendations
    .filter(definition => selectedIds.has(definition.id))
    .forEach(definition => {
      const result = definition.evaluator({ players, scoreHistory });
      if (!result) return;
      const winner = players.find(player => player.id === result.winnerId);
      if (!winner) return;

      const commendation: HiddenCommendation = {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        evaluationNote: result.note,
        winnerPlayerId: winner.id,
        bonusPoints: definition.bonusPoints
      };

      commendationsWithWinners.push({ commendation, winner });
      playerBonusMap[winner.id] = (playerBonusMap[winner.id] || 0) + definition.bonusPoints;
    });

  return { commendationsWithWinners, playerBonusMap };
}
