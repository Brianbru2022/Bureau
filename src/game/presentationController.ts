import { useCallback, useReducer } from 'react';
import type { RoundVisualState } from '../types';

export type PresentationAction =
  | { type: 'RESET' }
  | { type: 'ACTIVATE' }
  | { type: 'PROCESS' }
  | { type: 'ACCEPT' }
  | { type: 'REJECT' }
  | { type: 'SHOW_RESULT' };

export const presentationReducer = (_state: RoundVisualState, action: PresentationAction): RoundVisualState => {
  switch (action.type) {
    case 'RESET': return 'IDLE';
    case 'ACTIVATE': return 'ACTIVE';
    case 'PROCESS': return 'PROCESSING';
    case 'ACCEPT': return 'ACCEPTED';
    case 'REJECT': return 'REJECTED';
    case 'SHOW_RESULT': return 'RESULT';
  }
};

export const useRoundPresentationController = (initial: RoundVisualState = 'ACTIVE') => {
  const [state, dispatch] = useReducer(presentationReducer, initial);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const activate = useCallback(() => dispatch({ type: 'ACTIVATE' }), []);
  const process = useCallback(() => dispatch({ type: 'PROCESS' }), []);
  const accept = useCallback(() => dispatch({ type: 'ACCEPT' }), []);
  const reject = useCallback(() => dispatch({ type: 'REJECT' }), []);
  const showResult = useCallback(() => dispatch({ type: 'SHOW_RESULT' }), []);
  return { state, reset, activate, process, accept, reject, showResult };
};
