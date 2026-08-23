import { HiddenCommendation, Player } from '../types';

export const allPossibleCommendations: Array<{
  id: string;
  title: string;
  description: string;
  evaluator: (players: Player[]) => { winnerId: string; note: string } | null;
  bonusPoints: number;
}> = [
  {
    id: 'comm-human-sat-nav',
    title: 'HUMAN SAT NAV',
    description: 'Awarded for extraordinary British cartographical precision.',
    bonusPoints: 350,
    evaluator: (players) => {
      const candidates = players.filter(p => p.stats.mapDistancesKm.length > 0);
      if (candidates.length === 0) return null;
      const sorted = [...candidates].sort((a, b) => {
        const avgA = a.stats.mapDistancesKm.reduce((acc, v) => acc + v, 0) / a.stats.mapDistancesKm.length;
        const avgB = b.stats.mapDistancesKm.reduce((acc, v) => acc + v, 0) / b.stats.mapDistancesKm.length;
        return avgA - avgB;
      });
      const winner = sorted[0];
      const avg = (winner.stats.mapDistancesKm.reduce((acc, v) => acc + v, 0) / winner.stats.mapDistancesKm.length).toFixed(1);
      return {
        winnerId: winner.id,
        note: `Average map pin error of just ${avg} km. The Ordnance Survey acknowledges your existence.`
      };
    }
  },
  {
    id: 'comm-walking-encyclopaedia',
    title: 'WALKING ENCYCLOPAEDIA',
    description: 'Highest overall factual accuracy rate across all questions.',
    bonusPoints: 400,
    evaluator: (players) => {
      const candidates = players.filter(p => p.stats.totalAnswers > 0);
      if (candidates.length === 0) return null;
      const sorted = [...candidates].sort((a, b) => {
        const rateA = a.stats.correctAnswers / a.stats.totalAnswers;
        const rateB = b.stats.correctAnswers / b.stats.totalAnswers;
        return rateB - rateA;
      });
      const winner = sorted[0];
      const pct = Math.round((winner.stats.correctAnswers / Math.max(1, winner.stats.totalAnswers)) * 100);
      return {
        winnerId: winner.id,
        note: `Maintained a ${pct}% factual hit-rate. The Bureau finds your competence mildly unnerving.`
      };
    }
  },
  {
    id: 'comm-confidently-incorrect',
    title: 'CONFIDENTLY INCORRECT',
    description: 'Highest confidence / score risked on a catastrophic blunder.',
    bonusPoints: 300,
    evaluator: (players) => {
      const candidates = players.filter(p => p.stats.risksTaken > 0);
      if (candidates.length === 0) {
        // Fallback to lowest single score
        const worst = [...players].sort((a, b) => a.stats.worstScore - b.stats.worstScore)[0];
        return {
          winnerId: worst.id,
          note: 'Displayed unwavering courage while being thoroughly mistaken.'
        };
      }
      const sorted = [...candidates].sort((a, b) => (a.stats.risksTaken - a.stats.successfulRisks) - (b.stats.risksTaken - b.stats.successfulRisks));
      const winner = sorted[sorted.length - 1];
      return {
        winnerId: winner.id,
        note: 'Gambled with supreme self-assurance and was rewarded with absolute catastrophe.'
      };
    }
  },
  {
    id: 'comm-comeback-king',
    title: 'SPECTACULAR RECOVERY',
    description: 'Greatest comeback from a subterranean point deficit.',
    bonusPoints: 400,
    evaluator: (players) => {
      if (players.length < 2) return null;
      const sorted = [...players].sort((a, b) => b.score - a.score);
      const winner = sorted[0];
      return {
        winnerId: winner.id,
        note: 'Clawed back out of bureaucratic ignominy to claim victory.'
      };
    }
  },
  {
    id: 'comm-absolute-chaos',
    title: 'BUREAUCRATIC SURVIVOR',
    description: 'Most consistent resilience under high-pressure risk rounds.',
    bonusPoints: 350,
    evaluator: (players) => {
      const sorted = [...players].sort((a, b) => b.stats.highestBankedList - a.stats.highestBankedList);
      const winner = sorted[0];
      return {
        winnerId: winner.id,
        note: `Banked ${winner.stats.highestBankedList || 500} points right on the precipice of ruin.`
      };
    }
  }
];

export function selectSecretCommendations(): HiddenCommendation[] {
  const picked = [...allPossibleCommendations].sort(() => Math.random() - 0.5).slice(0, 2);
  return picked.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    evaluationNote: '',
    winnerPlayerId: null,
    bonusPoints: c.bonusPoints
  }));
}

export function evaluateCommendations(players: Player[]): {
  commendationsWithWinners: Array<{ commendation: HiddenCommendation; winner: Player }>;
  playerBonusMap: Record<string, number>;
} {
  const commendationsWithWinners: Array<{ commendation: HiddenCommendation; winner: Player }> = [];
  const playerBonusMap: Record<string, number> = {};

  allPossibleCommendations.slice(0, 3).forEach(c => {
    const res = c.evaluator(players);
    const winnerId = res ? res.winnerId : (players[0]?.id || 'p-1');
    const winner = players.find(p => p.id === winnerId) || players[0];
    const note = res ? res.note : 'Conferred by special Bureau deliberation.';

    if (winner) {
      commendationsWithWinners.push({
        commendation: {
          id: c.id,
          title: c.title,
          description: c.description,
          evaluationNote: note,
          winnerPlayerId: winner.id,
          bonusPoints: c.bonusPoints
        },
        winner
      });
      playerBonusMap[winner.id] = (playerBonusMap[winner.id] || 0) + c.bonusPoints;
    }
  });

  return { commendationsWithWinners, playerBonusMap };
}
