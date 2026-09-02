import { describe, expect, it } from 'vitest';
import { isCertifiedChain, potentialChainOfCommandScore, scoreChainOfCommand } from './chainOfCommand';

describe('Chain of Command', () => {
  it('uses continuous elapsed-time scoring', () => {
    expect(potentialChainOfCommandScore(0)).toBe(1000);
    expect(potentialChainOfCommandScore(10_000)).toBe(857);
    expect(potentialChainOfCommandScore(30_000)).toBe(667);
    expect(potentialChainOfCommandScore(30_500)).toBeLessThan(potentialChainOfCommandScore(30_000));
  });

  it('certifies only the complete ordered knowledge sequence', () => {
    const certified = ['William I', 'Henry VIII', 'Elizabeth I', 'Victoria', 'Elizabeth II'];
    expect(isCertifiedChain(certified, certified)).toBe(true);
    expect(isCertifiedChain(['William I', 'Elizabeth I', 'Henry VIII', 'Victoria', 'Elizabeth II'], certified)).toBe(false);
    expect(scoreChainOfCommand(10_000, true)).toBe(857);
    expect(scoreChainOfCommand(10_000, false)).toBe(0);
  });
});
