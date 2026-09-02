import { describe, expect, it } from 'vitest';
import { FIRST_ASSESSMENT_ROUND_ORDER, composeAssessmentSchedule } from './match';
import { estimateAssessmentDuration, simulateFormatPacing } from './pacing';
import { seededRandom } from './progression';

describe('assessment pacing', () => {
  it.each(['FIRST','QUICK','STANDARD','FULL'] as const)('%s simulations stay inside the advertised duration contract', preset => {
    for (const playerCount of [1,2,3,4] as const) {
      const report = simulateFormatPacing(2_000, preset, playerCount, playerCount === 1 ? 'OFF' : 'STANDARD');
      expect(report.lowerDecileMinutes).toBeGreaterThanOrEqual(report.lowerMinutes);
      expect(report.upperDecileMinutes).toBeLessThanOrEqual(report.upperMinutes);
    }
  });

  it('increases duration as candidates and rounds are added', () => {
    const rounds = composeAssessmentSchedule(8, seededRandom(12));
    const solo = estimateAssessmentDuration(rounds.slice(0, 4), 1, 'QUICK', 'OFF');
    const fullTable = estimateAssessmentDuration(rounds, 4, 'FULL', 'STANDARD');
    expect(fullTable.typicalMinutes).toBeGreaterThan(solo.typicalMinutes * 2);
  });

  it('keeps the guided first assessment shorter than a standard four-round match', () => {
    const first = estimateAssessmentDuration(FIRST_ASSESSMENT_ROUND_ORDER, 2, 'FIRST', 'OFF');
    const quick = estimateAssessmentDuration(FIRST_ASSESSMENT_ROUND_ORDER, 2, 'QUICK', 'LIGHT');
    expect(first.typicalMinutes).toBeLessThan(quick.typicalMinutes);
  });
});
