import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allChallenges } from './questions';
import { QUESTION_PACK_MANIFEST } from './questionPackManifest';

describe('question pack manifest', () => {
  it('has a unique sourced record for every challenge', () => {
    expect(QUESTION_PACK_MANIFEST.schemaVersion).toBe(3);
    expect(QUESTION_PACK_MANIFEST.entries).toHaveLength(QUESTION_PACK_MANIFEST.challengeCount);
    expect(new Set(QUESTION_PACK_MANIFEST.entries.map(entry=>entry.challengeId)).size).toBe(QUESTION_PACK_MANIFEST.challengeCount);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>/^fnv1a32-[0-9a-f]{8}$/.test(entry.contentFingerprint))).toBe(true);
    expect(new Set(QUESTION_PACK_MANIFEST.entries.map(entry=>entry.contentFingerprint)).size).toBe(QUESTION_PACK_MANIFEST.challengeCount);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.source.trim().length>3)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.sourceReferences.length>0)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.sourceReferences.every(reference=>reference.citation.trim().length>3))).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.answerRationale.trim().length>12)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.acceptedAnswers.length>0)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.acceptedAnswers.every(answer=>answer.trim().length>0))).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.sourceRecordPreparedOn===QUESTION_PACK_MANIFEST.preparedOn)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>entry.difficultyReview.profile===entry.difficulty)).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.every(entry=>Array.isArray(entry.aliases))).toBe(true);
    expect(QUESTION_PACK_MANIFEST.entries.filter(entry=>['REDACTED_RECORDS','COMMON_DOSSIER'].includes(entry.roundType)).every(entry=>entry.aliases.length>0)).toBe(true);
  });

  it('gives every time-sensitive challenge a mandatory future review date', () => {
    const sensitive=QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.timeSensitive);
    expect(sensitive.length).toBeGreaterThan(0);
    expect(sensitive.every(entry=>/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewBy??''))).toBe(true);
    expect(sensitive.every(entry=>(entry.reviewBy??'')>QUESTION_PACK_MANIFEST.preparedOn)).toBe(true);
  });

  it('uses valid official URLs where an authority is recognised and a bibliographic fallback otherwise', () => {
    const references=QUESTION_PACK_MANIFEST.entries.flatMap(entry=>entry.sourceReferences);
    const linked=references.filter(reference=>reference.locatorKind==='URL');
    expect(linked.length).toBeGreaterThan(590);
    expect(QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.sourceReferences.some(reference=>reference.locatorKind==='URL'))).toHaveLength(424);
    expect(linked.every(reference=>{try{return new URL(reference.url??'').protocol==='https:';}catch{return false;}})).toBe(true);
    expect(references.every(reference=>reference.locatorKind==='URL'||reference.locatorKind==='BIBLIOGRAPHIC')).toBe(true);
  });

  it('does not manufacture independent editorial approval', () => {
    const pending=QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.editorialStatus==='READY_FOR_INDEPENDENT_REVIEW');
    expect(pending.length).toBe(QUESTION_PACK_MANIFEST.challengeCount);
    expect(pending.every(entry=>entry.independentReview===undefined)).toBe(true);
    expect(pending.every(entry=>entry.verificationDate===undefined)).toBe(true);
  });

  it('records an attributable licence for every shipped photograph', () => {
    const directory = join(process.cwd(), 'public', 'assets', 'reconnaissance');
    const licences = ['CORE-LICENCES.json', 'EXPANSION-LICENCES.json'].flatMap(file =>
      JSON.parse(readFileSync(join(directory, file), 'utf8')) as Array<{file:string;author:string;licence:string;licenceUrl:string;sourceImage:string;sha256?:string}>
    );
    const imageChallenges = allChallenges.filter(challenge => challenge.roundType === 'IMAGE_REVEAL');
    expect(licences).toHaveLength(imageChallenges.length);
    const byFile = new Map(licences.map(record => [record.file, record]));
    for (const challenge of imageChallenges) {
      const record = byFile.get(basename(challenge.imageUrl));
      expect(record, challenge.id).toBeDefined();
      expect(record?.author.trim(), challenge.id).not.toBe('');
      expect(record?.licence, challenge.id).toMatch(/^CC(?: BY|0)/);
      expect(record?.licenceUrl, challenge.id).toMatch(/^https?:\/\//);
      expect(record?.sourceImage, challenge.id).toMatch(/^https:\/\/commons\.wikimedia\.org/);
    }
    expect(QUESTION_PACK_MANIFEST.entries.filter(entry=>entry.roundType==='IMAGE_REVEAL').every(entry=>entry.mediaLicence?.includes('LICENCES.json'))).toBe(true);
  });
});
