export interface EditorialApproval {
  reviewerId: string;
  reviewedOn: string;
  /** Copy the exact fingerprint from the generated review queue. Any later
   * change to the prompt, answers, rationale or sources invalidates sign-off. */
  contentFingerprint: string;
  status: 'APPROVED' | 'CHANGES_REQUIRED';
  notes?: string;
  attestation: {
    reviewerIndependent: boolean;
    sourceVerified: boolean;
    wordingChecked: boolean;
    answersAndAliasesChecked: boolean;
    difficultyChecked: boolean;
    playtested: boolean;
  };
}

/** Independent reviewers add signed-off challenge IDs here. Keeping this
 * separate from generated metadata prevents an export from manufacturing an
 * approval that no reviewer supplied. */
export const EDITORIAL_APPROVALS: Readonly<Record<string, EditorialApproval>> = {};
