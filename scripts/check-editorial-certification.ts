import { allChallenges } from '../src/data/questions';
import { automatedEditorialIssues } from '../src/data/editorial';
import { QUESTION_PACK_MANIFEST } from '../src/data/questionPackManifest';

const requireApproved=process.argv.includes('--require-approved');
const entries=QUESTION_PACK_MANIFEST.entries;
const invalid=entries.filter(entry=>!entry.sourceReferences.length||entry.sourceReferences.some(reference=>reference.citation.trim().length<4)||(entry.timeSensitive&&!entry.reviewBy)||entry.answerRationale.trim().length<13||!entry.acceptedAnswers.length||entry.acceptedAnswers.some(answer=>!answer.trim())||entry.sourceRecordPreparedOn!==QUESTION_PACK_MANIFEST.preparedOn);
const today=new Date().toISOString().slice(0,10);
const forbiddenReviewerIds=/^(?:ai|author|automation|chatgpt|codex|none|pending|reviewer|tbc|unknown)$/i;
const invalidApprovals=entries.filter(entry=>entry.independentReview&&(!entry.independentReview.reviewerId.trim()||forbiddenReviewerIds.test(entry.independentReview.reviewerId.trim())||!/^\d{4}-\d{2}-\d{2}$/.test(entry.independentReview.reviewedOn)||entry.independentReview.reviewedOn>today||entry.independentReview.reviewedOn<entry.sourceRecordPreparedOn||entry.independentReview.contentFingerprint!==entry.contentFingerprint||(entry.editorialStatus==='APPROVED'&&entry.verificationDate!==entry.independentReview.reviewedOn)||!entry.independentReview.attestation.reviewerIndependent||(entry.editorialStatus==='APPROVED'&&Object.values(entry.independentReview.attestation).some(value=>!value))));
const preflightIssues=automatedEditorialIssues(allChallenges);
const linkedReferences=entries.flatMap(entry=>entry.sourceReferences).filter(reference=>reference.locatorKind==='URL').length;
const entriesWithLinkedAuthority=entries.filter(entry=>entry.sourceReferences.some(reference=>reference.locatorKind==='URL')).length;
const weakBibliographic=entries.filter(entry=>!entry.sourceReferences.some(reference=>reference.locatorKind==='URL')&&entry.sourceReferences.some(reference=>reference.locatorKind==='BIBLIOGRAPHIC'&&!/(?:18|19|20)\d{2}|ISBN|\b(?:ed\.|edition|vol\.|case|tribunal)\b/i.test(reference.citation)));
const timeSensitive=entries.filter(entry=>entry.timeSensitive).length;
const approved=entries.filter(entry=>entry.editorialStatus==='APPROVED').length;
const changesRequired=entries.filter(entry=>entry.editorialStatus==='CHANGES_REQUIRED').length;
const pending=entries.length-approved-changesRequired;
const expired=entries.filter(entry=>entry.timeSensitive&&entry.editorialStatus==='APPROVED'&&(entry.reviewBy??'')<today);

console.log(`Editorial records: ${entries.length}`);
console.log(`Official URL references: ${linkedReferences}`);
console.log(`Challenges with an authority URL: ${entriesWithLinkedAuthority}`);
console.log(`Weak unlocated bibliographic records: ${weakBibliographic.length}`);
console.log(`Time-sensitive review deadlines: ${timeSensitive}`);
console.log(`Automated wording/answer issues: ${preflightIssues.length}`);
console.log(`Independently approved: ${approved}`);
console.log(`Changes required: ${changesRequired}`);
console.log(`Awaiting independent review: ${pending}`);
if(invalid.length){console.error(`Invalid editorial metadata: ${invalid.map(entry=>entry.challengeId).join(', ')}`);process.exit(1);}
if(preflightIssues.length){console.error(`Automated editorial preflight failed: ${preflightIssues.map(issue=>`${issue.challengeId} (${issue.kind}: ${issue.detail})`).join('; ')}`);process.exit(1);}
if(invalidApprovals.length){console.error(`Invalid or stale independent approvals: ${invalidApprovals.map(entry=>entry.challengeId).join(', ')}. Re-review the current fingerprint; never copy an old approval onto changed content.`);process.exit(1);}
if(requireApproved&&(pending||changesRequired||expired.length||weakBibliographic.length)){console.error(`Commercial editorial certification is incomplete. A reviewer other than the question author must approve every challenge in src/data/editorialApprovals.ts, no approval may be stale or past its review deadline, and weak sources must be replaced.${expired.length?` Expired: ${expired.map(entry=>entry.challengeId).join(', ')}`:''}${weakBibliographic.length?` Weak sources: ${weakBibliographic.map(entry=>entry.challengeId).join(', ')}`:''}`);process.exit(1);}
console.log(requireApproved?'Editorial certification passed.':'Editorial metadata audit passed; independent approval remains a separate gate.');
