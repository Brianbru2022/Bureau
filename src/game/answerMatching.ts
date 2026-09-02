import type { AdjudicationDecision } from '../types';

export interface AnswerCandidate { name: string; aliases: string[] }
export type AnswerMatchBasis = 'CANONICAL' | 'ALIAS' | 'NORMALISED_CANONICAL' | 'NORMALISED_ALIAS';
export interface AnswerMatch { candidate: AnswerCandidate | null; normalized: string; decision: AdjudicationDecision | null; basis: AnswerMatchBasis | null; reason: string }

const IRREGULAR_PLURALS: Record<string, string> = {
  children: 'child', men: 'man', women: 'woman', people: 'person', mice: 'mouse', geese: 'goose', feet: 'foot', teeth: 'tooth'
};

const singulariseWord = (word: string): string => {
  if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes') || word.endsWith('ches') || word.endsWith('shes')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
};

export const normalizeAnswer = (value: string): string => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\b(the|a|an)\b/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map(singulariseWord)
  .join(' ');

export function findAnswerMatch(input: string, candidates: AnswerCandidate[]): AnswerMatch {
  const normalized = normalizeAnswer(input);
  if (!normalized) return { candidate: null, normalized, decision: null, basis: null, reason: 'No answer was entered.' };
  const trimmed = input.trim().toLocaleLowerCase('en-GB');
  for (const candidate of candidates) {
    if (candidate.name.trim().toLocaleLowerCase('en-GB') === trimmed) {
      return { candidate, normalized, decision: 'AUTOMATIC', basis: 'CANONICAL', reason: `Exact filed answer: ${candidate.name}.` };
    }
    const exactAlias = candidate.aliases.find(alias => alias.trim().toLocaleLowerCase('en-GB') === trimmed);
    if (exactAlias) return { candidate, normalized, decision: 'AUTOMATIC', basis: 'ALIAS', reason: `Recognised filed variant “${exactAlias}” for ${candidate.name}.` };
    if (normalizeAnswer(candidate.name) === normalized) {
      return { candidate, normalized, decision: 'AUTOMATIC', basis: 'NORMALISED_CANONICAL', reason: `Matched ${candidate.name} after normalising punctuation, articles or plurals.` };
    }
    const normalisedAlias = candidate.aliases.find(alias => normalizeAnswer(alias) === normalized);
    if (normalisedAlias) return { candidate, normalized, decision: 'AUTOMATIC', basis: 'NORMALISED_ALIAS', reason: `Matched filed variant “${normalisedAlias}” for ${candidate.name} after normalisation.` };
  }
  return { candidate: null, normalized, decision: null, basis: null, reason: 'No canonical answer or filed variant matched.' };
}
