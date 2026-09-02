import type { QuestionPackEntry } from '../types';
import type { EditorialApproval } from './editorialApprovals';

export const EDITORIAL_REVIEW_ATTESTATIONS = [
  'reviewerIndependent',
  'sourceVerified',
  'wordingChecked',
  'answersAndAliasesChecked',
  'difficultyChecked',
  'playtested',
] as const;

export type EditorialReviewAttestationKey = typeof EDITORIAL_REVIEW_ATTESTATIONS[number];
export type EditorialReviewRow = Record<string,string>;

export interface EditorialReviewValidation {
  decisions: Record<string,EditorialApproval>;
  errors: string[];
  ignoredRows: number;
}

const forbiddenReviewerIds=/^(?:ai|author|automation|chatgpt|codex|none|pending|reviewer|tbc|unknown)$/i;
const trueCell=(value:string)=>/^(?:true|yes|y|1|checked)$/i.test(value.trim());

export function parseEditorialReviewCsv(input:string):EditorialReviewRow[]{
  const matrix:string[][]=[];let row:string[]=[];let field='';let quoted=false;
  for(let index=0;index<input.length;index+=1){
    const character=input[index];
    if(quoted){
      if(character==='"'&&input[index+1]==='"'){field+='"';index+=1;}
      else if(character==='"')quoted=false;
      else field+=character;
    }else if(character==='"'&&!field)quoted=true;
    else if(character===','){row.push(field);field='';}
    else if(character==='\n'){row.push(field.replace(/\r$/,''));matrix.push(row);row=[];field='';}
    else field+=character;
  }
  if(quoted)throw new Error('The editorial CSV ends inside a quoted field.');
  if(field||row.length){row.push(field.replace(/\r$/,''));matrix.push(row);}
  const [headings,...records]=matrix.filter(record=>record.some(value=>value.trim()));
  if(!headings)return [];
  return records.map(record=>Object.fromEntries(headings.map((heading,index)=>[heading.trim(),record[index]??''])));
}

export function validateEditorialReviewRows(rows:EditorialReviewRow[],entries:QuestionPackEntry[],today=new Date().toISOString().slice(0,10)):EditorialReviewValidation{
  const errors:string[]=[];const decisions:Record<string,EditorialApproval>={};let ignoredRows=0;
  const byId=new Map(entries.map(entry=>[entry.challengeId,entry]));
  const seen=new Set<string>();
  for(const [index,row] of rows.entries()){
    const line=index+2;const challengeId=(row.challengeId??'').trim();const status=(row.editorialStatus??'').trim();
    if(!challengeId){errors.push(`Row ${line}: challengeId is missing.`);continue;}
    if(!status||status==='READY_FOR_INDEPENDENT_REVIEW'){ignoredRows+=1;continue;}
    if(status!=='APPROVED'&&status!=='CHANGES_REQUIRED'){errors.push(`Row ${line} (${challengeId}): editorialStatus must be APPROVED, CHANGES_REQUIRED or left pending.`);continue;}
    if(seen.has(challengeId)){errors.push(`Row ${line} (${challengeId}): duplicate review decision.`);continue;}seen.add(challengeId);
    const entry=byId.get(challengeId);
    if(!entry){errors.push(`Row ${line} (${challengeId}): challenge is not in the current question pack.`);continue;}
    const reviewerId=(row.reviewerId??'').trim();const reviewedOn=(row.reviewedOn??'').trim();const reviewerFingerprint=(row.reviewerFingerprint??'').trim();const notes=(row.reviewerNotes??'').trim();
    if(reviewerFingerprint!==entry.contentFingerprint)errors.push(`Row ${line} (${challengeId}): reviewerFingerprint is stale or missing; expected ${entry.contentFingerprint}.`);
    if(reviewerId.length<3||forbiddenReviewerIds.test(reviewerId))errors.push(`Row ${line} (${challengeId}): supply a durable independent reviewer ID, not a role or automated-system label.`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)||Number.isNaN(Date.parse(`${reviewedOn}T00:00:00Z`)))errors.push(`Row ${line} (${challengeId}): reviewedOn must be a real ISO date.`);
    else {
      if(reviewedOn>today)errors.push(`Row ${line} (${challengeId}): reviewedOn cannot be in the future.`);
      if(reviewedOn<entry.sourceRecordPreparedOn)errors.push(`Row ${line} (${challengeId}): review predates the source record.`);
    }
    const attestation=Object.fromEntries(EDITORIAL_REVIEW_ATTESTATIONS.map(key=>[key,trueCell(row[key]??'')])) as Record<EditorialReviewAttestationKey,boolean>;
    if(!attestation.reviewerIndependent)errors.push(`Row ${line} (${challengeId}): independent-reviewer attestation is required.`);
    if(status==='APPROVED')for(const key of EDITORIAL_REVIEW_ATTESTATIONS)if(!attestation[key])errors.push(`Row ${line} (${challengeId}): ${key} must be TRUE before approval.`);
    if(status==='CHANGES_REQUIRED'&&notes.length<8)errors.push(`Row ${line} (${challengeId}): changes-required decisions need actionable reviewer notes.`);
    decisions[challengeId]={reviewerId,reviewedOn,contentFingerprint:reviewerFingerprint,status,notes:notes||undefined,attestation};
  }
  return {decisions,errors,ignoredRows};
}

export function renderEditorialApprovalsModule(approvals:Readonly<Record<string,EditorialApproval>>):string{
  const ordered=Object.fromEntries(Object.entries(approvals).sort(([left],[right])=>left.localeCompare(right)));
  return `export interface EditorialApproval {\n  reviewerId: string;\n  reviewedOn: string;\n  /** Copy the exact fingerprint from the generated review queue. Any later\n   * change to the prompt, answers, rationale or sources invalidates sign-off. */\n  contentFingerprint: string;\n  status: 'APPROVED' | 'CHANGES_REQUIRED';\n  notes?: string;\n  attestation: {\n    reviewerIndependent: boolean;\n    sourceVerified: boolean;\n    wordingChecked: boolean;\n    answersAndAliasesChecked: boolean;\n    difficultyChecked: boolean;\n    playtested: boolean;\n  };\n}\n\n/** Decisions imported from the independent review worksheet. Fingerprints bind\n * each decision to the exact reviewed content; scripts never invent approval. */\nexport const EDITORIAL_APPROVALS: Readonly<Record<string, EditorialApproval>> = ${JSON.stringify(ordered,null,2)};\n`;
}
