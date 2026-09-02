import { describe, expect, it } from 'vitest';
import { tickTurnTimer } from './timer';

describe('turn timer',()=>{
  it('counts down and stops at zero',()=>{
    expect(tickTurnTimer(30,false)).toBe(29);
    expect(tickTurnTimer(0,false)).toBe(0);
  });
  it('does not move while paused',()=>expect(tickTurnTimer(30,true)).toBe(30));
});
