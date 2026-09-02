import type { RoundVisualState } from '../types';

export type ApparatusSignal =
  | 'WAITING'
  | 'INPUT_ENABLED'
  | 'SUBMITTED'
  | 'ANSWER_ACCEPTED'
  | 'ANSWER_REJECTED'
  | 'SHOW_RESULT';

export const resolveRoundVisualState = (signal: ApparatusSignal): RoundVisualState => {
  switch (signal) {
    case 'WAITING': return 'IDLE';
    case 'INPUT_ENABLED': return 'ACTIVE';
    case 'SUBMITTED': return 'PROCESSING';
    case 'ANSWER_ACCEPTED': return 'ACCEPTED';
    case 'ANSWER_REJECTED': return 'REJECTED';
    case 'SHOW_RESULT': return 'RESULT';
  }
};

export const markArtworkUnavailable = (image: Pick<HTMLImageElement, 'hidden'>) => {
  image.hidden = true;
};
