import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PlaytestEvent, PlaytestSession } from '../src/types';
import { analyseBetaBalance } from '../src/game/betaBalance';

const directory=join(process.cwd(),'playtest-results');
const reports=existsSync(directory)?readdirSync(directory).filter(file=>file.endsWith('.json')).flatMap(file=>{
  try{
    const parsed=JSON.parse(readFileSync(join(directory,file),'utf8')) as {schemaVersion?:number;events?:PlaytestEvent[];sessions?:PlaytestSession[]};
    return [3,4,5].includes(parsed.schemaVersion??0)&&Array.isArray(parsed.events)&&Array.isArray(parsed.sessions)?[{events:parsed.events,sessions:parsed.sessions}]:[];
  }catch{return [];} 
}):[];
const events=[...new Map(reports.flatMap(report=>report.events).map(event=>[event.id,event])).values()];
const sessions=[...new Map(reports.flatMap(report=>report.sessions).map(session=>[session.id,session])).values()];
const report=analyseBetaBalance(events,8,sessions,6);
writeFileSync(join(process.cwd(),'BETA-BALANCE-REPORT.json'),`${JSON.stringify({schemaVersion:2,generatedAt:new Date().toISOString(),...report},null,2)}\n`);
console.log(`Beta balance: ${report.status}; ${report.scoredAttempts} scored attempts.`);
console.log(`Eligible evidence: ${report.eligibleSessions} sessions from ${report.independentGroups} independent groups; candidate counts ${report.representedPlayerCounts.join(', ')||'none'}.`);
report.issues.forEach(issue=>console.log(`- ${issue}`));
