export const PRESENTATION_TIMING = {
  inputFeedbackMs: 120,
  processingMs: 300,
  mapRouteMs: 820,
  majorRevealMs: 1_200,
  majorStepMs: 650,
  dispatchMs: 300,
} as const;

export const RESULT_SEQUENCE = {
  decisionMs: PRESENTATION_TIMING.processingMs,
  dossierMs: PRESENTATION_TIMING.processingMs + PRESENTATION_TIMING.inputFeedbackMs,
} as const;

interface DispatchCopyInput {
  nextCandidateName?: string;
  nextDepartmentName?: string;
  destination?: 'BUREAU_REVIEW' | 'MINI_GAME' | 'FINAL_CASE';
}

export function dispatchCopy(input: DispatchCopyInput): { eyebrow:string; title:string; detail:string } {
  if (input.nextCandidateName) return { eyebrow:'Candidate dispatch', title:`Next candidate: ${input.nextCandidateName}`, detail:'A fresh file is being placed at the apparatus.' };
  if (input.destination === 'BUREAU_REVIEW') return { eyebrow:'Supervisory dispatch', title:'Bureau Review', detail:'The trailing file has been selected for intervention.' };
  if (input.destination === 'MINI_GAME') return { eyebrow:'Unscheduled dispatch', title:'Proceed to the Bureau Annex', detail:'A short administrative interruption has been authorised.' };
  if (input.destination === 'FINAL_CASE') return { eyebrow:'Final dispatch', title:'Proceed to the Final Case', detail:'Departmental files are closed. The concluding dossier awaits.' };
  return { eyebrow:'Department dispatch', title:`Next department: ${input.nextDepartmentName ?? 'Awaiting assignment'}`, detail:'The next apparatus is being prepared.' };
}

export const motionDuration = (durationMs: number, reducedMotion: boolean) =>
  reducedMotion ? Math.min(120, durationMs) : durationMs;
