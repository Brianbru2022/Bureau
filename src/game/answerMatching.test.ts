import { describe, expect, it } from 'vitest';
import { findAnswerMatch, normalizeAnswer } from './answerMatching';

describe('Bureau answer matching', () => {
  const answers = [{ name: 'Tower Bridge', aliases: ['The Tower Bridge'] }, { name: 'City', aliases: ['Cities'] }];
  it('normalises punctuation, articles and plurals', () => {
    expect(normalizeAnswer("The cities!" )).toBe('city');
    expect(findAnswerMatch('the tower bridge.', answers).candidate?.name).toBe('Tower Bridge');
  });
  it('does not accept dangerous substring matches', () => {
    expect(findAnswerMatch('Tower', answers).candidate).toBeNull();
    expect(findAnswerMatch('Tower Bridge is my answer', answers).candidate).toBeNull();
  });
  it('marks automatic matches and leaves unknown answers for the host', () => {
    expect(findAnswerMatch('cities', answers).decision).toBe('AUTOMATIC');
    expect(findAnswerMatch('possibly London', answers).decision).toBeNull();
  });
  it('explains whether a canonical answer, alias or normalised form matched', () => {
    expect(findAnswerMatch('Tower Bridge', answers)).toMatchObject({ basis:'CANONICAL', reason:'Exact filed answer: Tower Bridge.' });
    expect(findAnswerMatch('Cities', answers)).toMatchObject({ basis:'ALIAS', candidate:{name:'City'} });
    expect(findAnswerMatch('the tower bridge.', answers)).toMatchObject({ basis:'NORMALISED_CANONICAL', candidate:{name:'Tower Bridge'} });
    expect(findAnswerMatch('unknown', answers)).toMatchObject({ basis:null, reason:'No canonical answer or filed variant matched.' });
  });
});
