import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Capture={id:string;file:string;buildVersion:string;seed:string;viewport:string;state:string;source:string;anonymised:boolean;sha256:string};
const manifest=JSON.parse(readFileSync(resolve('STOREFRONT-CAPTURES.json'),'utf8')) as {schemaVersion:number;buildVersion:string;captures:Capture[]};
const pkg=JSON.parse(readFileSync(resolve('package.json'),'utf8')) as {version:string};
const required=['01-opening-screen','02-four-candidate-apparatus','03-cartography-route','04-top-ten-elimination','05-result-dossier','06-post-assessment-dossiers'];
const failures:string[]=[];
if(manifest.schemaVersion!==1) failures.push('Unsupported storefront manifest schema.');
if(manifest.buildVersion!==pkg.version) failures.push('Storefront build version does not match package version.');
if(JSON.stringify(manifest.captures.map(capture=>capture.id))!==JSON.stringify(required)) failures.push('Storefront capture set is incomplete or out of order.');
for(const capture of manifest.captures){
  const path=resolve(capture.file);
  if(!existsSync(path)){failures.push(`Missing ${capture.file}.`);continue;}
  const bytes=readFileSync(path);
  const width=bytes.readUInt32BE(16);const height=bytes.readUInt32BE(20);
  if(width!==1600||height!==900) failures.push(`${capture.file} is not 1600x900.`);
  const hash=createHash('sha256').update(bytes).digest('hex').toUpperCase();
  if(hash!==capture.sha256) failures.push(`${capture.file} checksum is stale.`);
  if(capture.source!=='ACTUAL_GAMEPLAY'||!capture.anonymised) failures.push(`${capture.file} is not filed as anonymised genuine gameplay.`);
  if(!capture.state||capture.viewport!=='1600x900'||!capture.seed) failures.push(`${capture.file} lacks capture metadata.`);
}
if(failures.length){console.error(`Storefront verification failed:\n- ${failures.join('\n- ')}`);process.exit(1);}
console.log(`Storefront verification passed for ${manifest.captures.length} genuine gameplay captures.`);
