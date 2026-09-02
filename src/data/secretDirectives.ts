import { SecretDirective } from '../types';

export const secretDirectivesPool: Omit<SecretDirective, 'isCompleted' | 'progressText'>[] = [
  {
    id: 'dir-gambler',
    codeName: 'OPERATION HAZARD',
    title: 'The Gambler',
    description: 'Score 850 or higher in at least TWO separate challenges.',
    targetMetric: '850+ score twice',
    bonusPoints: 650,
  },
  {
    id: 'dir-cartographer',
    codeName: 'OPERATION ORDNANCE',
    title: 'The Cartographer',
    description: 'Score at least 750 in any British Map navigation challenge.',
    targetMetric: '750+ on map challenge',
    bonusPoints: 550,
  },
  {
    id: 'dir-opportunist',
    codeName: 'OPERATION COLD-ENTRY',
    title: 'The Opportunist',
    description: 'Successfully use an Intercept asset or score in 3 different departments.',
    targetMetric: 'Score in 3 different departments',
    bonusPoints: 500,
  },
  {
    id: 'dir-generalist',
    codeName: 'OPERATION ENCYCLOPAEDIA',
    title: 'The Generalist',
    description: 'Earn points across at least 4 distinct challenge categories.',
    targetMetric: '4 unique categories scored',
    bonusPoints: 600,
  },
  {
    id: 'dir-specialist',
    codeName: 'OPERATION MASTERY',
    title: 'The Specialist',
    description: 'Achieve a singular triumph scoring 920 or higher on any challenge.',
    targetMetric: 'Single score 920+',
    bonusPoints: 700,
  },
  {
    id: 'dir-survivor',
    codeName: 'OPERATION RETENTION',
    title: 'The Survivor',
    description: 'Successfully bank at least 600 points in The List without wiping out.',
    targetMetric: 'Bank 600+ on The List',
    bonusPoints: 550,
  },
  {
    id: 'dir-conservative',
    codeName: 'OPERATION PRUDENCE',
    title: 'The Conservative',
    description: 'Finish the assessment with a mistake-rate below 30% across all rounds.',
    targetMetric: '< 30% mistake rate',
    bonusPoints: 600,
  },
  {
    id: 'dir-precisionist',
    codeName: 'OPERATION MICROMETER',
    title: 'The Precisionist',
    description: 'Achieve an estimate error under 12% on any numerical estimate challenge.',
    targetMetric: '< 12% estimate error',
    bonusPoints: 650,
  }
];

export function assignSecretDirectives(playerCount: number, random: () => number = Math.random): SecretDirective[] {
  const shuffled = [...secretDirectivesPool].sort(() => random() - 0.5);
  return shuffled.slice(0, playerCount).map(d => ({
    ...d,
    isCompleted: false,
    progressText: 'Assessing operational progress...'
  }));
}
