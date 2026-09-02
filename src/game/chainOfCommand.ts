import { clampScore } from './scoring';
import type { ScorePaceProfile } from '../types';
import { scoringElapsedMs } from './scorePacing';

const DECAY_WINDOW_MS = 60_000;

export const potentialChainOfCommandScore = (elapsedMs: number, pace: ScorePaceProfile = 'RAPID'): number =>
  clampScore(Math.round(1000 / (1 + scoringElapsedMs(elapsedMs, pace) / DECAY_WINDOW_MS)));

export const isCertifiedChain = (candidate: string[], certified: string[]): boolean =>
  candidate.length === certified.length && candidate.every((word, index) => word === certified[index]);

export const scoreChainOfCommand = (elapsedMs: number, correct: boolean, pace: ScorePaceProfile = 'RAPID'): number =>
  correct ? potentialChainOfCommandScore(elapsedMs, pace) : 0;
