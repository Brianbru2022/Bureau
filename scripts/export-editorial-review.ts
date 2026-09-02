import { writeFileSync } from 'node:fs';
import { allChallenges } from '../src/data/questions';
import { QUESTION_PACK_MANIFEST } from '../src/data/questionPackManifest';

const prompts=new Map(allChallenges.map(challenge=>[challenge.id,challenge.prompt]));
const cell=(value:unknown)=>`"${String(value??'').replace(/"/g,'""')}"`;
const headings=['challengeId','contentFingerprint','roundType','prompt','acceptedAnswers','aliases','difficulty','difficultyMethod','answerRationale','sourceRecordPreparedOn','verificationDate','sourceReferences','timeSensitive','reviewBy','editorialStatus','reviewerId','reviewedOn','reviewerFingerprint','reviewerIndependent','sourceVerified','wordingChecked','answersAndAliasesChecked','difficultyChecked','playtested','reviewerNotes'];
const rows=QUESTION_PACK_MANIFEST.entries.map(entry=>[
  entry.challengeId,entry.contentFingerprint,entry.roundType,prompts.get(entry.challengeId),entry.acceptedAnswers.join(' || '),entry.aliases.join(' || '),entry.difficulty,entry.difficultyReview.method,entry.answerRationale,entry.sourceRecordPreparedOn,entry.verificationDate,
  entry.sourceReferences.map(reference=>reference.url?`${reference.citation} | ${reference.url}`:reference.citation).join(' || '),
  entry.timeSensitive,entry.reviewBy,entry.editorialStatus,entry.independentReview?.reviewerId,entry.independentReview?.reviewedOn,entry.independentReview?.contentFingerprint,entry.independentReview?.attestation.reviewerIndependent,entry.independentReview?.attestation.sourceVerified,entry.independentReview?.attestation.wordingChecked,entry.independentReview?.attestation.answersAndAliasesChecked,entry.independentReview?.attestation.difficultyChecked,entry.independentReview?.attestation.playtested,entry.independentReview?.notes,
].map(cell).join(','));
writeFileSync('EDITORIAL-REVIEW-QUEUE.csv',[headings.join(','),...rows].join('\r\n'),'utf8');
writeFileSync('EDITORIAL-CERTIFICATION.json',`${JSON.stringify({schemaVersion:2,reviewAttestationVersion:1,packId:QUESTION_PACK_MANIFEST.packId,preparedOn:QUESTION_PACK_MANIFEST.preparedOn,challengeCount:QUESTION_PACK_MANIFEST.challengeCount,approved:QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.editorialStatus==='APPROVED').length,changesRequired:QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.editorialStatus==='CHANGES_REQUIRED').length,pending:QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.editorialStatus==='READY_FOR_INDEPENDENT_REVIEW').length,timeSensitive:QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.timeSensitive).length,challengesWithAuthorityUrl:QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.sourceReferences.some(reference=>reference.locatorKind==='URL')).length,bibliographicOnly:QUESTION_PACK_MANIFEST.entries.filter(entry=>!entry.sourceReferences.some(reference=>reference.locatorKind==='URL')).length},null,2)}\n`,'utf8');
console.log(`Exported ${QUESTION_PACK_MANIFEST.challengeCount} editorial review rows.`);
