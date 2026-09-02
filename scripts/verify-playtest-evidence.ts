import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PlaytestEvent, PlaytestSession } from '../src/types';
import { certifyBlindPlaytestEvidence } from '../src/game/playtest';
import { estimateAssessmentDuration } from '../src/game/pacing';

const requested = process.argv.slice(2);
const sources = requested.length ? requested : ['playtest-results'];
const certificationPath=resolve('PLAYTEST-CERTIFICATION.json');
const findingsPath=resolve('PLAYTEST-FINDINGS.md');
const files = sources.flatMap(source => {
  const absolute=resolve(source);
  if (!existsSync(absolute)) return [];
  return absolute.toLowerCase().endsWith('.json') ? [absolute] : readdirSync(absolute,{withFileTypes:true}).filter(entry=>entry.isFile()&&entry.name.toLowerCase().endsWith('.json')).map(entry=>resolve(absolute,entry.name));
});

const writeEvidenceFiles=(report:Record<string,unknown>,markdown:string)=>{
  writeFileSync(certificationPath,`${JSON.stringify(report,null,2)}\n`,'utf8');
  writeFileSync(findingsPath,`${markdown.trim()}\n`,'utf8');
};

if (!files.length) {
  const issues=['No structured play-test JSON reports found.','Need three independent passing groups.','Need the attested solo First Assessment, two-candidate Quick/Light and four-candidate Standard/Standard matrix.'];
  writeEvidenceFiles({schemaVersion:2,evidenceContractVersion:2,generatedAt:new Date().toISOString(),status:'AWAITING_EVIDENCE',reports:0,completedSessions:0,passingSessions:0,independentPassingGroups:0,issues,incidentCounts:{},qualityThresholds:{meanEnjoyment:3.5,meanClarity:3.5,meanPacing:3,wouldPlayAgainRate:2/3}},`# Closed-beta findings\n\nStatus: **AWAITING EVIDENCE**\n\nNo consented independent-group report has been imported. Run the three-session matrix in \`CLOSED-BETA-GUIDE.md\`, place the exported JSON files in \`playtest-results\`, then rerun \`pnpm playtest:verify\`.\n\n## Required matrix\n\n- Solo · First Assessment · Politics off\n- Two candidates · Quick · Light Politics\n- Four candidates · Standard · Standard Politics\n\nEvery session must contain a complete event trail for all scheduled departments.`);
  console.error('No structured play-test JSON reports found. Wrote an AWAITING_EVIDENCE certification and findings report.');
  process.exit(1);
}

const sessions:PlaytestSession[]=[];
const events:PlaytestEvent[]=[];
for (const file of files) {
  const report=JSON.parse(readFileSync(file,'utf8')) as {schemaVersion?:number;sessions?:PlaytestSession[];events?:PlaytestEvent[]};
  if (![3,4,5].includes(report.schemaVersion??0)||!Array.isArray(report.sessions)||!Array.isArray(report.events)) {
    console.error(`Invalid structured play-test report: ${file}`);
    process.exit(1);
  }
  sessions.push(...report.sessions);
  events.push(...report.events);
}

const uniqueSessions=[...new Map(sessions.map(session=>[session.id,session])).values()];
const uniqueEvents=[...new Map(events.map(event=>[event.id,event])).values()];
const certification=certifyBlindPlaytestEvidence(uniqueSessions,uniqueEvents);
console.log(`Reports: ${files.length}`);
console.log(`Completed sessions: ${certification.completedSessions}`);
console.log(`Passing sessions: ${certification.passingSessions}`);
console.log(`Independent passing groups: ${certification.passingGroups}`);
const pacingIssues:string[]=[];
for (const summary of certification.summaries) {
  const session=uniqueSessions.find(item=>item.id===summary.sessionId);
  if (!session?.preset||summary.matchDurationMs===undefined||session.roundTypes.length===0) continue;
  const estimate=estimateAssessmentDuration(session.roundTypes,session.playerCount,session.preset,session.playerCount===1?'OFF':session.politicsMode??'OFF');
  const actualMinutes=summary.matchDurationMs/60_000;
  console.log(`Pacing: ${summary.groupCode} · ${session.preset} · ${session.playerCount} candidate${session.playerCount===1?'':'s'} · ${actualMinutes.toFixed(1)} min measured · ${estimate.label} advertised`);
  if (actualMinutes<estimate.lowerMinutes||actualMinutes>estimate.upperMinutes) pacingIssues.push(`${summary.groupCode} completed in ${actualMinutes.toFixed(1)} minutes, outside its advertised ${estimate.label} range.`);
}
certification.issues.push(...pacingIssues);
const incidentTypes=['PAGE_SCROLL','CONTROL_CONFUSION','MISTAKEN_INPUT','HOST_ASSISTANCE','DEAD_TIME','PROGRESSION_FAILURE'] as const;
const incidentCounts=Object.fromEntries(incidentTypes.map(type=>[type,uniqueEvents.filter(event=>event.type===type).length]));
const deadTimeMs=uniqueEvents.filter(event=>event.type==='DEAD_TIME').reduce((sum,event)=>sum+(event.durationMs??0),0);
const mean=(values:Array<number|undefined>)=>{const filed=values.filter((value):value is number=>value!==undefined);return filed.length?Number((filed.reduce((sum,value)=>sum+value,0)/filed.length).toFixed(2)):null;};
const passed=certification.passed&&pacingIssues.length===0;
const documentedProblems=uniqueEvents.filter(event=>['CONTROL_CONFUSION','HOST_ASSISTANCE','PROGRESSION_FAILURE'].includes(event.type)).map(({id,sessionId,type,occurredAt,phase,roundType,challengeId,durationMs})=>({id,sessionId,type,occurredAt,phase,roundType,challengeId,durationMs}));
const evidenceReport={
  schemaVersion:2,
  evidenceContractVersion:2,
  generatedAt:new Date().toISOString(),
  status:passed?'PASS':'CHANGES_REQUIRED',
  reports:files.length,
  completedSessions:certification.completedSessions,
  passingSessions:certification.passingSessions,
  independentPassingGroups:certification.passingGroups,
  issues:certification.issues,
  incidentCounts,
  totalDeadTimeMs:deadTimeMs,
  meanRatings:{enjoyment:mean(certification.summaries.map(summary=>summary.enjoymentRating)),clarity:mean(certification.summaries.map(summary=>summary.clarityRating)),pacing:mean(certification.summaries.map(summary=>summary.pacingRating))},
  wouldPlayAgainRate:certification.summaries.length?Number((certification.summaries.filter(summary=>summary.wouldPlayAgain).length/certification.summaries.length).toFixed(4)):null,
  qualityThresholds:{meanEnjoyment:3.5,meanClarity:3.5,meanPacing:3,wouldPlayAgainRate:2/3},
  cohortSummaries:certification.summaries,
  documentedProblems,
};
const issueLines=certification.issues.length?certification.issues.map(issue=>`- ${issue}`).join('\n'):'- None';
const summaryLines=certification.summaries.length?certification.summaries.map(summary=>`- ${summary.groupCode}: ${summary.playerCount} candidate${summary.playerCount===1?'':'s'}, ${summary.preset??'unknown format'}, ${summary.eventEvidenceComplete?'complete event trail':'incomplete event trail'}, ${summary.passedUnassisted?'unassisted':'assistance or blocker recorded'}, enjoyment ${summary.enjoymentRating??'not filed'}/5, clarity ${summary.clarityRating??'not filed'}/5, pacing ${summary.pacingRating??'not filed'}/5, play again ${summary.wouldPlayAgain===undefined?'not filed':summary.wouldPlayAgain?'yes':'no'}`).join('\n'):'- No completed sessions';
writeEvidenceFiles(evidenceReport,`# Closed-beta findings\n\nStatus: **${evidenceReport.status}**\n\nReports: ${files.length}  \nCompleted sessions: ${certification.completedSessions}  \nPassing sessions: ${certification.passingSessions}  \nIndependent passing groups: ${certification.passingGroups}\n\n## Cohort summaries\n\n${summaryLines}\n\n## Structured incidents\n\n- Desktop page scrolls: ${incidentCounts.PAGE_SCROLL}\n- Control confusion: ${incidentCounts.CONTROL_CONFUSION}\n- Mistaken inputs: ${incidentCounts.MISTAKEN_INPUT}\n- Host assistance: ${incidentCounts.HOST_ASSISTANCE}\n- Dead-time incidents: ${incidentCounts.DEAD_TIME} (${(deadTimeMs/1000).toFixed(0)} seconds total)\n- Progression failures: ${incidentCounts.PROGRESSION_FAILURE}\n\n## Exit-gate issues\n\n${issueLines}\n\nFree-text observer notes and candidate names are intentionally absent from exported evidence.`);
console.log(`Wrote ${certificationPath}`);
console.log(`Wrote ${findingsPath}`);
if (!passed) {
  certification.issues.forEach(issue=>console.error(`FAIL: ${issue}`));
  process.exit(1);
}
console.log('Blind play-test exit gate passed.');
