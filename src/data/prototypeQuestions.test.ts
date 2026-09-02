import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chainOfCommandChallenges, commonDossierChallenges, complaintsDeskChallenges, dispatchBoxChallenges, misfiledRecordsChallenges, missingMinutesChallenges, publicEnquiryChallenges, redactedRecordsChallenges, seatingCommitteeChallenges } from './prototypeQuestions';
import { CHAIN_OF_COMMAND_ART, COMMON_DOSSIER_ART, COMPLAINTS_DESK_ART, DISPATCH_BOX_ART, MISFILED_RECORDS_ART, MISSING_MINUTES_ART, PUBLIC_ENQUIRY_ART, REDACTED_RECORDS_ART, SEATING_COMMITTEE_ART } from './promotedVisualAssets';

const webpDimensions = (path: string) => {
  const bytes = readFileSync(path);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8X') return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  if (chunk === 'VP8L') { const bits = bytes.readUInt32LE(21); return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
  throw new Error(`${path} is not a supported WebP file`);
};

describe('Misfiled Records prototype pack', () => {
  it('contains 25 complete, uniquely identified files', () => {
    expect(misfiledRecordsChallenges).toHaveLength(25);
    expect(new Set(misfiledRecordsChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of misfiledRecordsChallenges) {
      expect(challenge.records).toHaveLength(5);
      expect(challenge.records.some(record => record.id === challenge.misfiledRecordId), challenge.id).toBe(true);
      expect(challenge.connectionOptions).toHaveLength(3);
      expect(challenge.correctConnectionIndex).toBeGreaterThanOrEqual(0);
      expect(challenge.correctConnectionIndex).toBeLessThan(3);
      expect(challenge.clues).toHaveLength(2);
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
    }
  });

  it('does not name the misfiled record in the prompt', () => {
    for (const challenge of misfiledRecordsChallenges) {
      const target = challenge.records.find(record => record.id === challenge.misfiledRecordId)!;
      expect(challenge.prompt.toLowerCase(), challenge.id).not.toContain(target.label.toLowerCase());
    }
  });

  it('ships responsive prototype art within the apparatus budget', () => {
    for (const [source, expected] of [[MISFILED_RECORDS_ART.desktop, {width:1536,height:1024}], [MISFILED_RECORDS_ART.compact, {width:768,height:512}], [REDACTED_RECORDS_ART.desktop, {width:1536,height:1024}], [REDACTED_RECORDS_ART.compact, {width:768,height:512}], [COMMON_DOSSIER_ART.desktop, {width:1536,height:1024}], [COMMON_DOSSIER_ART.compact, {width:768,height:512}], [MISSING_MINUTES_ART.desktop, {width:1536,height:1024}], [MISSING_MINUTES_ART.compact, {width:768,height:512}], [PUBLIC_ENQUIRY_ART.desktop, {width:1536,height:1024}], [PUBLIC_ENQUIRY_ART.compact, {width:768,height:512}], [CHAIN_OF_COMMAND_ART.desktop, {width:1536,height:1024}], [CHAIN_OF_COMMAND_ART.compact, {width:768,height:512}], [COMPLAINTS_DESK_ART.desktop, {width:1536,height:1024}], [COMPLAINTS_DESK_ART.compact, {width:768,height:512}], [SEATING_COMMITTEE_ART.desktop, {width:1536,height:1024}], [SEATING_COMMITTEE_ART.compact, {width:768,height:512}], [DISPATCH_BOX_ART.desktop, {width:1536,height:1024}], [DISPATCH_BOX_ART.compact, {width:768,height:512}]] as const) {
      const path = join(process.cwd(), 'public', source.replace(/^\//, ''));
      expect(existsSync(path), path).toBe(true);
      expect(statSync(path).size, path).toBeLessThan(400_000);
      expect(webpDimensions(path), path).toEqual(expected);
    }
    expect(MISFILED_RECORDS_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(REDACTED_RECORDS_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(COMMON_DOSSIER_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(MISSING_MINUTES_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(PUBLIC_ENQUIRY_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(CHAIN_OF_COMMAND_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(COMPLAINTS_DESK_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(SEATING_COMMITTEE_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
    expect(DISPATCH_BOX_ART.sourceFile?.startsWith('assets/source-art/promoted-apparatus/')).toBe(true);
  });

  it('contains 25 complete Redacted Records files without prompt answer leaks', () => {
    expect(redactedRecordsChallenges).toHaveLength(25);
    expect(new Set(redactedRecordsChallenges.map(challenge=>challenge.id)).size).toBe(25);
    for(const challenge of redactedRecordsChallenges){
      expect(challenge.clues).toHaveLength(4);
      expect(challenge.options).toHaveLength(4);
      expect(challenge.options).toContain(challenge.subjectName);
      expect(challenge.prompt.toLowerCase(),challenge.id).not.toContain(challenge.subjectName.toLowerCase());
      expect(challenge.source.trim(),challenge.id).not.toBe('');
    }
  });

  it('contains 25 complete Common Dossier files without prompt answer leaks', () => {
    expect(commonDossierChallenges).toHaveLength(25);
    expect(new Set(commonDossierChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of commonDossierChallenges) {
      expect(challenge.exhibits).toHaveLength(4);
      expect(challenge.options).toHaveLength(4);
      expect(challenge.options).toContain(challenge.connection);
      expect(challenge.prompt.toLowerCase(), challenge.id).not.toContain(challenge.connection.toLowerCase());
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
    }
  });

  it('contains 25 factual Missing Minutes files with an answer in every option set', () => {
    expect(missingMinutesChallenges).toHaveLength(25);
    expect(new Set(missingMinutesChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of missingMinutesChallenges) {
      expect(challenge.entries).toHaveLength(6);
      expect(challenge.options).toHaveLength(4);
      expect(challenge.missingEntryIndex).toBeGreaterThanOrEqual(0);
      expect(challenge.missingEntryIndex).toBeLessThan(6);
      expect(challenge.options).toContain(challenge.entries[challenge.missingEntryIndex]);
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
      expect(challenge.source, challenge.id).not.toContain('memory-game material');
    }
  });

  it('contains 25 complete Public Enquiry claims with a balanced truth mix', () => {
    expect(publicEnquiryChallenges).toHaveLength(25);
    expect(new Set(publicEnquiryChallenges.map(challenge => challenge.id)).size).toBe(25);
    expect(publicEnquiryChallenges.filter(challenge => challenge.isTrue).length).toBeGreaterThanOrEqual(10);
    expect(publicEnquiryChallenges.filter(challenge => challenge.isTrue).length).toBeLessThanOrEqual(15);
    for (const challenge of publicEnquiryChallenges) {
      expect(challenge.claim.trim(), challenge.id).not.toBe('');
      expect(challenge.witnessBrief.trim(), challenge.id).not.toBe('');
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
    }
  });

  it('contains 25 factual Chain of Command sequences with two decoys each', () => {
    expect(chainOfCommandChallenges).toHaveLength(25);
    expect(new Set(chainOfCommandChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of chainOfCommandChallenges) {
      expect(challenge.chain).toHaveLength(5);
      expect(challenge.tileOptions).toHaveLength(6);
      expect(new Set(challenge.tileOptions).size).toBe(6);
      for (const required of challenge.chain.slice(1)) expect(challenge.tileOptions).toContain(required);
      expect(challenge.tileOptions.filter(word => !challenge.chain.includes(word))).toHaveLength(2);
      expect(challenge.source, challenge.id).not.toContain('word-link material');
    }
  });

  it('contains 25 factual Complaints Desk cases with one inaccurate statement', () => {
    expect(complaintsDeskChallenges).toHaveLength(25);
    expect(new Set(complaintsDeskChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of complaintsDeskChallenges) {
      expect(challenge.certifiedFacts).toHaveLength(3);
      expect(challenge.statements).toHaveLength(5);
      expect(challenge.falseStatementIndex).toBeGreaterThanOrEqual(0);
      expect(challenge.falseStatementIndex).toBeLessThan(challenge.statements.length);
      expect(challenge.statements[challenge.falseStatementIndex].trim(), challenge.id).not.toBe('');
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
      expect(challenge.source, challenge.id).not.toContain('logic material');
    }
  });

  it('contains 25 factual Seating Committee chronologies with one certified order', () => {
    expect(seatingCommitteeChallenges).toHaveLength(25);
    expect(new Set(seatingCommitteeChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of seatingCommitteeChallenges) {
      expect(challenge.officials).toHaveLength(5);
      expect(new Set(challenge.officials).size).toBe(5);
      expect(challenge.clues).toHaveLength(4);
      expect(challenge.correctOrder).toHaveLength(5);
      expect(new Set(challenge.correctOrder)).toEqual(new Set(challenge.officials));
      expect(challenge.explanation.trim(), challenge.id).not.toBe('');
      expect(challenge.source.trim(), challenge.id).not.toBe('');
      expect(challenge.source, challenge.id).not.toContain('spatial-logic material');
    }
  });

  it('contains 25 five-question Dispatch Box quiz files with sourced answers', () => {
    expect(dispatchBoxChallenges).toHaveLength(25);
    expect(new Set(dispatchBoxChallenges.map(challenge => challenge.id)).size).toBe(25);
    for (const challenge of dispatchBoxChallenges) {
      expect(challenge.questions).toHaveLength(5);
      for (const question of challenge.questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(4);
        expect(question.explanation.trim()).not.toBe('');
        expect(question.source.trim()).not.toBe('');
      }
    }
    const questions=dispatchBoxChallenges.flatMap(challenge=>challenge.questions.map(question=>question.question.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()));
    expect(new Set(questions).size).toBe(questions.length);
  });

  it('avoids overusing the narrowest recurring British quiz subjects',()=>{
    const payload=JSON.stringify([misfiledRecordsChallenges,redactedRecordsChallenges,commonDossierChallenges,missingMinutesChallenges,publicEnquiryChallenges,chainOfCommandChallenges,complaintsDeskChallenges,seatingCommitteeChallenges,dispatchBoxChallenges]).toLowerCase();
    for(const term of ['monarch','prime minister','landmark'])expect(payload.split(term).length-1,term).toBeLessThan(30);
  });
});
