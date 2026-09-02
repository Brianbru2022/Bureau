import { clampScore } from './scoring';

const probability = (confidencePercent: number) => Math.max(0, Math.min(100, confidencePercent)) / 100;

/** Continuous calibration: 50% earns zero because it makes no decision. The
 * award follows justified certainty in the correct direction, so an ordinary
 * 70–80% judgement no longer outpays a very strong result elsewhere. */
export const scorePublicEnquiryJuror = (confidencePercent: number, isTrue: boolean): number => {
  const belief = probability(confidencePercent);
  const correctDirection = isTrue ? belief >= .5 : belief <= .5;
  if (!correctDirection) return 0;
  const justifiedCertainty = Math.abs(belief - .5) * 2;
  return clampScore(1000 * Math.pow(justifiedCertainty, .9));
};

/** The witness must defend the claim whether it is true or false. Their score
 * is the jury's exact mean belief in the claim, not a success band. */
export const scorePublicEnquiryWitness = (confidencePercents: number[]): number => {
  if (!confidencePercents.length) return 0;
  const meanBelief = confidencePercents.reduce((sum, value) => sum + probability(value), 0) / confidencePercents.length;
  return clampScore(Math.round(meanBelief * 1000));
};
