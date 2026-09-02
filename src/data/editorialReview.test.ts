import { describe, expect, it } from 'vitest';
import { QUESTION_PACK_MANIFEST } from './questionPackManifest';
import { parseEditorialReviewCsv, renderEditorialApprovalsModule, validateEditorialReviewRows } from './editorialReview';

const entry=QUESTION_PACK_MANIFEST.entries[0];
const approvedRow=(overrides:Record<string,string>={})=>({
  challengeId:entry.challengeId,
  editorialStatus:'APPROVED',
  reviewerId:'REVIEWER-17',
  reviewedOn:'2026-09-01',
  reviewerFingerprint:entry.contentFingerprint,
  reviewerIndependent:'TRUE',
  sourceVerified:'TRUE',
  wordingChecked:'TRUE',
  answersAndAliasesChecked:'TRUE',
  difficultyChecked:'TRUE',
  playtested:'TRUE',
  reviewerNotes:'Checked against the cited record and played once.',
  ...overrides,
});

describe('independent editorial review import',()=>{
  it('parses quoted CSV cells and escaped quotation marks',()=>{
    const rows=parseEditorialReviewCsv('challengeId,reviewerNotes\r\n"one","Clear, with ""quoted"" wording"\r\n');
    expect(rows).toEqual([{challengeId:'one',reviewerNotes:'Clear, with "quoted" wording'}]);
  });

  it('accepts a fingerprint-bound approval only after every human attestation',()=>{
    const result=validateEditorialReviewRows([approvedRow()],QUESTION_PACK_MANIFEST.entries,'2026-09-02');
    expect(result.errors).toEqual([]);
    expect(result.decisions[entry.challengeId].attestation.playtested).toBe(true);
    expect(renderEditorialApprovalsModule(result.decisions)).toContain(entry.contentFingerprint);
  });

  it('rejects stale fingerprints, automated identities and incomplete approval checks',()=>{
    const result=validateEditorialReviewRows([approvedRow({reviewerId:'Codex',reviewerFingerprint:'fnv1a32-deadbeef',sourceVerified:'FALSE'})],QUESTION_PACK_MANIFEST.entries,'2026-09-02');
    expect(result.errors.join(' ')).toMatch(/stale or missing/i);
    expect(result.errors.join(' ')).toMatch(/independent reviewer ID/i);
    expect(result.errors.join(' ')).toMatch(/sourceVerified must be TRUE/i);
  });

  it('requires actionable notes when an editor returns a question for changes',()=>{
    const result=validateEditorialReviewRows([approvedRow({editorialStatus:'CHANGES_REQUIRED',reviewerNotes:'vague',sourceVerified:'FALSE',wordingChecked:'FALSE',answersAndAliasesChecked:'FALSE',difficultyChecked:'FALSE',playtested:'FALSE'})],QUESTION_PACK_MANIFEST.entries,'2026-09-02');
    expect(result.errors).toContain(`Row 2 (${entry.challengeId}): changes-required decisions need actionable reviewer notes.`);
  });
});
