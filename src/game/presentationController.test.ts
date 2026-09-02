import { describe, expect, it } from 'vitest';
import { presentationReducer, type PresentationAction } from './presentationController';

describe('round presentation controller', () => {
  it.each([
    ['RESET','IDLE'],['ACTIVATE','ACTIVE'],['PROCESS','PROCESSING'],['ACCEPT','ACCEPTED'],['REJECT','REJECTED'],['SHOW_RESULT','RESULT'],
  ] as const)('%s produces %s', (type, expected) => {
    expect(presentationReducer('ACTIVE', { type } as PresentationAction)).toBe(expected);
  });
});
