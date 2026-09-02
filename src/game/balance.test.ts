import { describe,expect,it } from 'vitest';
import { ALL_ROUND_TYPES } from './match';
import { aggregateSimulations,simulateMatch,simulateRoundBalance,simulateSeatBalance } from './balance';

describe('deterministic balance laboratory',()=>{
  const candidates=[{id:'new',skill:.35},{id:'regular',skill:.6},{id:'expert',skill:.82}];
  it('reproduces an assessment exactly from its seed',()=>expect(simulateMatch(42,candidates,ALL_ROUND_TYPES)).toEqual(simulateMatch(42,candidates,ALL_ROUND_TYPES)));
  it('keeps skill meaningful across thousands of full assessments',()=>{const averages=aggregateSimulations(2_000,candidates,ALL_ROUND_TYPES);expect(averages.expert).toBeGreaterThan(averages.regular);expect(averages.regular).toBeGreaterThan(averages.new);});
  it('keeps every simulated department score within the public scale',()=>{const result=simulateMatch(7,candidates,ALL_ROUND_TYPES);expect(Object.values(result.roundScores).flat().every(score=>score>=0&&score<=1000)).toBe(true);});
  it('keeps every regular-player department near the shared continuous-value target',()=>{const report=simulateRoundBalance(5_000,ALL_ROUND_TYPES);expect(report).toHaveLength(17);for(const round of report){expect(round.mean,round.roundType).toBeGreaterThanOrEqual(475);expect(round.mean,round.roundType).toBeLessThanOrEqual(525);}const means=report.map(round=>round.mean);expect(Math.max(...means)/Math.min(...means)).toBeLessThan(1.06);});
  it('rewards expertise in every department over thousands of seeded attempts',()=>{const newPlayer=simulateRoundBalance(2_000,ALL_ROUND_TYPES,.35);const expert=simulateRoundBalance(2_000,ALL_ROUND_TYPES,.82);newPlayer.forEach((round,index)=>expect(expert[index].mean,round.roundType).toBeGreaterThan(round.mean));});
  it.each([1,2,4] as const)('keeps seat bias below two per cent with %i candidate(s)',playerCount=>{const report=simulateSeatBalance(2_000,playerCount,ALL_ROUND_TYPES);const mean=report.averages.reduce((sum,value)=>sum+value,0)/report.averages.length;expect(report.spread/mean).toBeLessThan(.02);});
});
