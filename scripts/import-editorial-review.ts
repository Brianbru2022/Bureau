import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EDITORIAL_APPROVALS } from '../src/data/editorialApprovals';
import { parseEditorialReviewCsv, renderEditorialApprovalsModule, validateEditorialReviewRows } from '../src/data/editorialReview';
import { QUESTION_PACK_MANIFEST } from '../src/data/questionPackManifest';

const inputArgument=process.argv.slice(2).find(argument=>!argument.startsWith('--'));
const write=process.argv.includes('--write');
if(!inputArgument){
  console.error('Usage: pnpm editorial:import -- <completed-review.csv> [--write]');
  process.exit(1);
}
const inputPath=resolve(inputArgument);
if(!existsSync(inputPath)){console.error(`Review worksheet not found: ${inputPath}`);process.exit(1);}

let rows;
try{rows=parseEditorialReviewCsv(readFileSync(inputPath,'utf8'));}
catch(error){console.error(error instanceof Error?error.message:String(error));process.exit(1);}
const validation=validateEditorialReviewRows(rows,QUESTION_PACK_MANIFEST.entries);
console.log(`Review rows: ${rows.length}`);
console.log(`Decisions ready to import: ${Object.keys(validation.decisions).length}`);
console.log(`Rows still pending: ${validation.ignoredRows}`);
if(validation.errors.length){
  console.error(`Review import rejected with ${validation.errors.length} issue${validation.errors.length===1?'':'s'}:`);
  for(const error of validation.errors)console.error(`- ${error}`);
  process.exit(1);
}
if(!Object.keys(validation.decisions).length){console.error('No completed APPROVED or CHANGES_REQUIRED decisions were found; nothing was imported.');process.exit(1);}
const merged={...EDITORIAL_APPROVALS,...validation.decisions};
if(!write){
  console.log('Dry run passed. Re-run with --write to update src/data/editorialApprovals.ts.');
  process.exit(0);
}
writeFileSync(resolve('src/data/editorialApprovals.ts'),renderEditorialApprovalsModule(merged),'utf8');
console.log(`Imported ${Object.keys(validation.decisions).length} independently supplied decision${Object.keys(validation.decisions).length===1?'':'s'}. Run pnpm release:records and pnpm editorial:certify next.`);
