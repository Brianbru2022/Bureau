import { describe, expect, it } from 'vitest';
import { dispatchCopy, motionDuration, PRESENTATION_TIMING, RESULT_SEQUENCE } from './presentation';

describe('presentation timing', () => {
  it('keeps ordinary feedback below 700 ms and major reveals below two seconds', () => {
    expect(PRESENTATION_TIMING.inputFeedbackMs).toBeLessThan(700);
    expect(PRESENTATION_TIMING.processingMs).toBeLessThan(700);
    expect(PRESENTATION_TIMING.dispatchMs).toBeLessThan(700);
    expect(PRESENTATION_TIMING.majorRevealMs).toBeLessThan(2_000);
    expect(PRESENTATION_TIMING.majorStepMs).toBeLessThan(2_000);
    expect(RESULT_SEQUENCE.dossierMs).toBeLessThan(700);
    expect(PRESENTATION_TIMING.dispatchMs).toBeLessThanOrEqual(300);
    expect(PRESENTATION_TIMING.majorRevealMs).toBeLessThanOrEqual(1_200);
  });

  it('does not make reduced motion users wait for visual travel', () => {
    expect(motionDuration(PRESENTATION_TIMING.majorRevealMs, true)).toBeLessThanOrEqual(120);
  });

  it('produces concise candidate, department and interruption dispatches', () => {
    expect(dispatchCopy({nextCandidateName:'Candidate 2'}).title).toBe('Next candidate: Candidate 2');
    expect(dispatchCopy({nextDepartmentName:'The Atlas Room'}).title).toBe('Next department: The Atlas Room');
    expect(dispatchCopy({destination:'BUREAU_REVIEW'}).title).toBe('Bureau Review');
    expect(dispatchCopy({destination:'MINI_GAME'}).title).toContain('Bureau Annex');
    expect(dispatchCopy({destination:'FINAL_CASE'}).title).toContain('Final Case');
  });
});
