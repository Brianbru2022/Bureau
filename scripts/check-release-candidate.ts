import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { PlaytestEvent, PlaytestSession } from '../src/types';
import { certifyBlindPlaytestEvidence } from '../src/game/playtest';

type GateName = 'LEGAL'|'CONTENT'|'ACCESSIBILITY'|'PERFORMANCE'|'INSTALLATION'|'FULL_MATCH'|'DEFECTS';
type Gate = { name:GateName; passed:boolean; evidence:string[]; blockers:string[] };
type KnownIssue = { id:string; category:string; severity:string; status:string; summary:string };

const automatedPassed=process.argv.includes('--automated-passed');
const requireGo=process.argv.includes('--require-go');
const read=(file:string)=>readFileSync(resolve(file),'utf8');
const json=<T>(file:string)=>JSON.parse(read(file)) as T;
const hasIncompleteFields=(file:string)=>/TO BE COMPLETED|\[LEGAL PUBLISHER|\[SUPPORT CONTACT|\[DATE\]/.test(read(file));
const csvRows=(file:string)=>existsSync(file)?read(file).split(/\r?\n/).slice(1).filter(row=>row.trim()):[];
const pass=(name:GateName,evidence:string[],blockers:string[]):Gate=>({name,passed:blockers.length===0,evidence,blockers});

const pkg=json<{version:string;author?:string}>('package.json');
const rights=json<{groups:Array<{id:string;status:string}>}>('ASSET-RIGHTS.json');
const identity=json<{status:string;publisher:{legalName:string|null};trademark:{status:string};legalReview:{status:string}}>('COMMERCIAL-IDENTITY.json');
const artProvenance=json<{status:string;legacyAssets:{status:string};records:Array<{status:string}>}>('GENERATED-ART-PROVENANCE.json');
const legalBlockers:string[]=[];
const uncleared=rights.groups.filter(group=>group.status!=='CLEARED');
if(uncleared.length) legalBlockers.push(`Uncleared asset groups: ${uncleared.map(group=>`${group.id} (${group.status})`).join(', ')}.`);
for(const file of ['ARTWORK-PROVENANCE.md','TRADEMARK-CLEARANCE.md','EULA.md','SUPPORT.md']) if(hasIncompleteFields(file)) legalBlockers.push(`${file} contains incomplete legal or publisher fields.`);
if(!pkg.author||/private project|must be named/i.test(pkg.author)) legalBlockers.push('package.json does not name the legal publisher.');
if(identity.status!=='APPROVED'||!identity.publisher.legalName) legalBlockers.push(`Structured commercial identity is ${identity.status} and does not yet name an approved publisher.`);
if(identity.trademark.status!=='CLEARED') legalBlockers.push(`Professional trade mark status is ${identity.trademark.status}, not CLEARED.`);
if(identity.legalReview.status!=='APPROVED') legalBlockers.push(`Commercial-policy legal review status is ${identity.legalReview.status}, not APPROVED.`);
if(artProvenance.status!=='CLEARED'||artProvenance.legacyAssets.status!=='CLEARED'||artProvenance.records.some(record=>record.status!=='CLEARED')) legalBlockers.push('Generated-art provenance register is not fully cleared.');
const legal=pass('LEGAL',['Asset-rights and generated-art registers parsed.','Structured publisher, EULA, support and trade mark records inspected.'],legalBlockers);

const editorial=json<{challengeCount:number;approved:number;changesRequired:number;pending:number}>('EDITORIAL-CERTIFICATION.json');
const contentBlockers:string[]=[];
if(editorial.approved!==editorial.challengeCount||editorial.pending||editorial.changesRequired) contentBlockers.push(`${editorial.approved}/${editorial.challengeCount} question records are independently approved; ${editorial.pending} pending and ${editorial.changesRequired} changes required.`);
const content=pass('CONTENT',['Versioned editorial certification parsed.'],contentBlockers);

const accessibilityRows=csvRows('ACCESSIBILITY-ACCEPTANCE.csv');
const requiredAccessibility=['KEYBOARD_ONLY','REDUCED_MOTION','TEXT_200_PERCENT','SCREEN_READER'];
const recordedAccessibility=new Set(accessibilityRows.filter(row=>/,PASS,/i.test(`,${row},`)).map(row=>row.split(',')[0]?.trim().toUpperCase()));
const accessibilityBlockers:string[]=[];
if(!automatedPassed) accessibilityBlockers.push('The complete automated browser and accessibility suite was not run in this audit invocation.');
for(const scenario of requiredAccessibility) if(!recordedAccessibility.has(scenario)) accessibilityBlockers.push(`Missing passing ${scenario} acceptance row.`);
const accessibility=pass('ACCESSIBILITY',['Accessibility statement present.','Automated suite includes keyboard, focus, reduced-motion and enlarged-text paths.'],accessibilityBlockers);

const performanceCertification=existsSync('PERFORMANCE-CERTIFICATION.json')?json<{status:string;startup:{encodedBytes:number;roundArtworkRequests:number};setupInteraction:{medianMs:number};imageMemory:{activeScreenDecodedBytes:number};checks:Record<string,boolean>}>('PERFORMANCE-CERTIFICATION.json'):null;
const performanceBlockers:string[]=[];
if(!automatedPassed) performanceBlockers.push('The production build, asset-budget audit and E2E suite were not run in this audit invocation.');
if(!performanceCertification) performanceBlockers.push('No measured production performance certification was found.');
else if(performanceCertification.status!=='PASS'||!Object.values(performanceCertification.checks).every(Boolean)) performanceBlockers.push('One or more separate startup, latency or image-memory budgets failed.');
const performance=pass('PERFORMANCE',performanceCertification?[
  `Opening encoded transfer: ${performanceCertification.startup.encodedBytes} bytes; eager round-art requests: ${performanceCertification.startup.roundArtworkRequests}.`,
  `Median setup response: ${performanceCertification.setupInteraction.medianMs} ms; active decoded-image estimate: ${performanceCertification.imageMemory.activeScreenDecodedBytes} bytes.`,
]:['No measured performance evidence.'],performanceBlockers);

const acceptanceRows=csvRows('WINDOWS-ACCEPTANCE.csv');
const acceptedMachines=new Set(acceptanceRows.filter(row=>{
  const cells=row.split(',').map(value=>value.trim());
  return cells.length>=17&&cells[0]&&cells[2]?.toLowerCase()==='true'&&cells[3]==='Valid'&&cells.slice(4,14).every(value=>value.toLowerCase()==='true')&&cells[14]&&/^\d{4}-\d{2}-\d{2}$/.test(cells[15]??'');
}).map(row=>row.split(',')[0]?.trim()).filter(Boolean));
const update=json<{enabled:boolean;feedUrl:string|null}>('UPDATE-CHANNEL.json');
const installers=existsSync('release')?readdirSync('release').filter(file=>/-setup-x64\.exe$/i.test(file)).map(file=>resolve('release',file)).sort((a,b)=>statSync(b).mtimeMs-statSync(a).mtimeMs):[];
let signatureStatus='MISSING';
if(installers[0]) {
  const escaped=installers[0].replace(/'/g,"''");
  const result=spawnSync('C:\\Program Files\\PowerShell\\7\\pwsh.exe',['-NoProfile','-Command',`(Get-AuthenticodeSignature -LiteralPath '${escaped}').Status.ToString()`],{encoding:'utf8'});
  signatureStatus=result.status===0?result.stdout.trim()||'UNKNOWN':`ERROR (${result.error?.message||result.stderr.trim()||`exit ${result.status}`})`;
}
const installationBlockers:string[]=[];
if(!installers.length) installationBlockers.push('No NSIS release-candidate installer was found.');
if(signatureStatus!=='Valid') installationBlockers.push(`Latest installer signature status is ${signatureStatus}, not Valid.`);
if(acceptedMachines.size<3) installationBlockers.push(`Need three clean-machine passing records; found ${acceptedMachines.size}.`);
if(!update.enabled||!update.feedUrl?.startsWith('https://')) installationBlockers.push('The production HTTPS update channel is not enabled.');
const installation=pass('INSTALLATION',[installers[0]?`Latest installer: ${basename(installers[0])}.`:'No installer.',`Clean-machine records: ${acceptedMachines.size}.`,`Update channel enabled: ${update.enabled}.`],installationBlockers);

const reportFiles=existsSync('playtest-results')?readdirSync('playtest-results').filter(file=>file.toLowerCase().endsWith('.json')).map(file=>resolve('playtest-results',file)):[];
const sessions:PlaytestSession[]=[];
const events:PlaytestEvent[]=[];
const invalidReports:string[]=[];
for(const file of reportFiles){
  try{
    const report=JSON.parse(readFileSync(file,'utf8')) as {schemaVersion?:number;sessions?:PlaytestSession[];events?:PlaytestEvent[]};
    if(![3,4,5].includes(report.schemaVersion??0)||!Array.isArray(report.sessions)||!Array.isArray(report.events)){invalidReports.push(basename(file));continue;}
    sessions.push(...report.sessions); events.push(...report.events);
  }catch{invalidReports.push(basename(file));}
}
const certification=certifyBlindPlaytestEvidence([...new Map(sessions.map(session=>[session.id,session])).values()],[...new Map(events.map(event=>[event.id,event])).values()]);
const fullMatchBlockers=[...certification.issues];
if(!reportFiles.length) fullMatchBlockers.unshift('No consented closed-beta reports were found in playtest-results.');
if(invalidReports.length) fullMatchBlockers.push(`Invalid beta reports: ${invalidReports.join(', ')}.`);
if(!automatedPassed) fullMatchBlockers.push('Automated complete one-, two- and four-candidate journeys were not run in this audit invocation.');
const fullMatch=pass('FULL_MATCH',[`Consented reports: ${reportFiles.length}.`,`Independent passing groups: ${certification.passingGroups}.`,`Passing sessions: ${certification.passingSessions}.`],fullMatchBlockers);

const issueRegister=json<{issues:KnownIssue[]}>('KNOWN-ISSUES.json');
const blockingIssues=issueRegister.issues.filter(issue=>issue.status==='OPEN'&&['CRITICAL','HIGH','RELEASE_BLOCKER'].includes(issue.severity));
const defects=pass('DEFECTS',[`${issueRegister.issues.length} known issues registered.`,`Open critical/high/release blockers: ${blockingIssues.length}.`],blockingIssues.map(issue=>`${issue.id}: ${issue.summary}`));

const gates=[legal,content,accessibility,performance,installation,fullMatch,defects];
const go=gates.every(gate=>gate.passed);
const report={
  schemaVersion:1,
  product:'The Bureau of Questionable Knowledge',
  version:pkg.version,
  generatedAt:new Date().toISOString(),
  automatedVerificationPassed:automatedPassed,
  decision:go?'GO':'NO_GO',
  gates,
  nextReviewRule:'Repeat after every candidate rebuild or evidence change. GO requires every gate to pass with no open critical, high or release-blocking issue.',
};
writeFileSync('RELEASE-CANDIDATE-STATUS.json',`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(`Release-candidate decision: ${report.decision}`);
for(const gate of gates){
  console.log(`${gate.passed?'PASS':'FAIL'} ${gate.name}`);
  gate.blockers.forEach(blocker=>console.log(`  - ${blocker}`));
}
console.log('Wrote RELEASE-CANDIDATE-STATUS.json');
if(requireGo&&!go) process.exit(1);
