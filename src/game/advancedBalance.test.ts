import { describe, expect, it } from 'vitest';
import { simulatePoliticsPower, simulateRiskStrategies, simulateScheduleVariety } from './advancedBalance';

describe('advanced balance laboratory', () => {
  it('keeps cautious, balanced and aggressive risk strategies viable', () => {
    const reports = simulateRiskStrategies(8_000);
    const totals = reports.map(report => report.meanTotal);
    expect(Math.max(...totals) / Math.min(...totals)).toBeLessThan(1.28);
    expect(reports.every(report => Object.values(report.roundMeans).every(mean => mean > 150))).toBe(true);
  });

  it('keeps Office Politics bounded beside a 1,000-point department', () => {
    const reports = simulatePoliticsPower(5_000);
    expect(reports.every(report => report.maximumScoreAwarded <= 150)).toBe(true);
    const returns = reports.map(report => report.scorePerInfluence);
    expect(Math.max(...returns) / Math.min(...returns)).toBeLessThan(1.6);
  });

  it('avoids duplicate departments and adjacent mechanical repetition', () => {
    const reports = simulateScheduleVariety(3_000);
    expect(reports.every(report => report.meanDistinctRounds === report.roundCount)).toBe(true);
    expect(reports.every(report => report.adjacentSimilarityRate === 0)).toBe(true);
    expect(reports.every(report => report.meanClosingMomentum > report.meanOpeningMomentum + .15)).toBe(true);
  });
});
