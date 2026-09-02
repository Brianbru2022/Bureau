import { describe,expect,it } from 'vitest';
import { allChallenges } from './questions';
import { automatedEditorialIssues,difficultyDistribution,difficultyForRound,exposedAnswers } from './editorial';
import type { RoundType } from '../types';

describe('question editorial audit',()=>{
  it('does not expose a filed multi-word answer in its own prompt',()=>{const leaks=allChallenges.flatMap(challenge=>exposedAnswers(challenge).map(answer=>`${challenge.id}: ${answer}`));expect(leaks).toEqual([]);});
  it('produces difficulty metadata for the entire bank',()=>{const distribution=difficultyDistribution(allChallenges);expect(Object.values(distribution).reduce((a,b)=>a+b,0)).toBe(425);expect(distribution.EASY).toBeGreaterThan(0);expect(distribution.MEDIUM).toBeGreaterThan(0);expect(distribution.HARD).toBeGreaterThan(0);});
  it('passes the complete mechanical wording and answer-safety preflight',()=>{expect(automatedEditorialIssues(allChallenges)).toEqual([]);});
  it('ramps curated difficulty through an assessment',()=>expect([0,3,7].map(index=>difficultyForRound(index,8))).toEqual(['EASY','MEDIUM','HARD']));
  it('gives every promoted department more than one editorial difficulty',()=>{const promoted:RoundType[]=['MISFILED_RECORDS','REDACTED_RECORDS','COMMON_DOSSIER','MISSING_MINUTES','PUBLIC_ENQUIRY','CHAIN_OF_COMMAND','COMPLAINTS_DESK','SEATING_COMMITTEE','DISPATCH_BOX'];for(const type of promoted)expect(Object.values(difficultyDistribution(allChallenges.filter(challenge=>challenge.roundType===type))).filter(Boolean).length,type).toBeGreaterThanOrEqual(2);});
});
