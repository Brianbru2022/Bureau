import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const requireGo=process.argv.includes('--require-go');
const read=(file:string)=>readFileSync(resolve(file),'utf8');
const rc=JSON.parse(read('RELEASE-CANDIDATE-STATUS.json')) as {decision:string;gates:Array<{name:string;passed:boolean;blockers:string[]}>};
const stage9=JSON.parse(read('STAGE-9-CERTIFICATION.json')) as {status:string;humanBlockers:string[];technicalBlockers:string[]};
const captures=JSON.parse(read('STOREFRONT-CAPTURES.json')) as {captures:unknown[]};
const technicalBlockers:string[]=[];
for(const file of ['HOST-QUICK-REFERENCE.md','SUPPORT.md','FIRST-MONTH-SUPPORT-PLAN.md','STOREFRONT-CAPTURES.json','STOREFRONT-ASSET-BRIEF.md']) if(!existsSync(resolve(file))) technicalBlockers.push(`Missing ${file}.`);
if(captures.captures.length!==6) technicalBlockers.push(`Need six filed storefront captures; found ${captures.captures.length}.`);
const supportPlan=read('FIRST-MONTH-SUPPORT-PLAN.md');
const supportRecord=read('SUPPORT.md');
const externalBlockers=[...new Set([
  ...rc.gates.flatMap(gate=>gate.blockers),
  ...stage9.humanBlockers,
  ...(supportPlan.includes('Accountable owner: **TO BE COMPLETED**')?['The first-month support plan has no accountable owner.']:[]),
  ...(supportRecord.includes('Support email or website: **TO BE COMPLETED**')?['The public support route has not been supplied.']:[]),
])];
const report={schemaVersion:1,generatedAt:new Date().toISOString(),status:technicalBlockers.length?'TECHNICAL_FAILURE':rc.decision==='GO'&&stage9.status==='CERTIFIED'?'GO':'AWAITING_EXTERNAL_CLEARANCE',storefrontCaptures:captures.captures.length,technicalBlockers,externalBlockers,nextCommand:'Complete the external evidence and credentials, then run pnpm rc:go.'};
writeFileSync(resolve('STAGE-10-READINESS.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(`Stage 10 readiness: ${report.status}.`);
technicalBlockers.forEach(blocker=>console.error(`TECHNICAL: ${blocker}`));
externalBlockers.forEach(blocker=>console.log(`EXTERNAL: ${blocker}`));
if(technicalBlockers.length||(requireGo&&report.status!=='GO')) process.exitCode=1;
