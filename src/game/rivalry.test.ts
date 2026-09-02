import { describe,expect,it } from 'vitest';
import type { Player } from '../types';
import { ALL_ROUND_TYPES } from './match';
import { simulateThresholdRate } from './balance';
import { resolveRivalry,rivalryThreshold } from './rivalry';

const player=(id:string,influence=2)=>({id,name:id,score:100,influence,assets:[],avatar:'x',color:'',department:'',secretDirective:{} as Player['secretDirective'],stats:{} as Player['stats']});
describe('Office Politics',()=>{
  it('defines a threshold for every department',()=>expect(rivalryThreshold('WHERE_IN_BRITAIN').value).toBeGreaterThan(0));
  it('keeps every standard prediction genuinely contestable',()=>{for(const roundType of ALL_ROUND_TYPES){const rate=simulateThresholdRate(5_000,roundType,rivalryThreshold(roundType).value);expect(rate,roundType).toBeGreaterThan(.25);expect(rate,roundType).toBeLessThan(.75);}});
  it('rewards correct predictions without taking target points',()=>{const result=resolveRivalry([player('a'),player('b')],[{playerId:'b',targetPlayerId:'a',stance:'BACK',motion:'COUNTER_SIGN'}],'a',800,'RANK_IT');expect(result.players.find(p=>p.id==='a')?.score).toBe(100);expect(result.players.find(p=>p.id==='b')?.score).toBeGreaterThan(100);});
  it('caps influence and never creates negative scores',()=>{const result=resolveRivalry([player('a'),player('b',3)],[{playerId:'b',targetPlayerId:'a',stance:'OBJECT',motion:'RAISE_STANDARD'}],'a',0,'TOP_10');expect(result.players.find(p=>p.id==='b')?.influence).toBeLessThanOrEqual(3);expect(result.players.every(p=>p.score>=0)).toBe(true);});
});
