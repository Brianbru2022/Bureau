import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const requireHuman=process.argv.includes('--require-human');
const read=(file:string)=>readFileSync(resolve(file),'utf8');
const csv=(file:string)=>read(file).trim().split(/\r?\n/).slice(1).filter(Boolean).map(line=>line.split(',').map(cell=>cell.trim()));
const performance=JSON.parse(read('PERFORMANCE-CERTIFICATION.json')) as {status:string;checks:Record<string,boolean>;measuredAt:string};
const requiredAccessibility=['KEYBOARD_ONLY','REDUCED_MOTION','TEXT_200_PERCENT','SCREEN_READER'];
const accessibilityRows=csv('ACCESSIBILITY-ACCEPTANCE.csv');
const passingAccessibility=new Set(accessibilityRows.filter(row=>row[5]?.toUpperCase()==='PASS'&&row[6]&&/^\d{4}-\d{2}-\d{2}$/.test(row[7]??'')).map(row=>row[0]?.toUpperCase()));
const windowsRows=csv('WINDOWS-ACCEPTANCE.csv');
const passingWindows=windowsRows.filter(row=>row.length>=17&&row[0]&&row[2]?.toLowerCase()==='true'&&row[3]==='Valid'&&row.slice(4,14).every(value=>value.toLowerCase()==='true')&&row[14]&&/^\d{4}-\d{2}-\d{2}$/.test(row[15]??''));
const uniqueWindows=new Set(passingWindows.map(row=>row[0]));
const technicalBlockers:string[]=[];
if(performance.status!=='PASS'||!Object.values(performance.checks).every(Boolean)) technicalBlockers.push('Performance certification does not pass every separate budget.');
for(const file of ['ACCESSIBILITY.md','ACCESSIBILITY-ACCEPTANCE.csv','WINDOWS-ACCEPTANCE.csv','STAGE-9-CERTIFICATION.md']) if(!existsSync(resolve(file))) technicalBlockers.push(`Missing ${file}.`);
const humanBlockers=requiredAccessibility.filter(scenario=>!passingAccessibility.has(scenario)).map(scenario=>`Missing independently witnessed ${scenario} pass.`);
if(uniqueWindows.size<3) humanBlockers.push(`Need three unique clean-Windows passing records; found ${uniqueWindows.size}.`);
const report={
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  status:technicalBlockers.length?'TECHNICAL_FAILURE':humanBlockers.length?'AWAITING_HUMAN_EVIDENCE':'CERTIFIED',
  performance:{status:performance.status,measuredAt:performance.measuredAt,checks:performance.checks},
  accessibility:{required:requiredAccessibility,passing:[...passingAccessibility],pending:requiredAccessibility.filter(item=>!passingAccessibility.has(item))},
  windows:{passingMachines:[...uniqueWindows],requiredMachines:3},
  technicalBlockers,
  humanBlockers,
};
writeFileSync(resolve('STAGE-9-CERTIFICATION.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(`Stage 9 certification: ${report.status}.`);
technicalBlockers.forEach(blocker=>console.error(`TECHNICAL: ${blocker}`));
humanBlockers.forEach(blocker=>console.log(`HUMAN EVIDENCE: ${blocker}`));
if(technicalBlockers.length||(requireHuman&&humanBlockers.length)) process.exitCode=1;
