# Editorial Certification Policy

The Bureau of Questionable Knowledge ships 425 challenges across seventeen departments. Each challenge has a stable ID and an editorial record containing its prompt, canonical accepted answer or answer sequence, aliases, answer rationale, difficulty assessment, source citation, authority locator where recognised, time-sensitivity status and review deadline where required.

## What the automated audit certifies

`pnpm editorial:audit` confirms that every challenge has complete structural metadata. It does **not** certify that the underlying fact is correct. `sourceRecordPreparedOn` records when the source record was assembled; it is deliberately separate from `verificationDate`.

`pnpm editorial:certify` is the commercial release gate. It passes only when every challenge has an explicit independent approval in `src/data/editorialApprovals.ts`, with a reviewer identity, review date and the exact `contentFingerprint` shown in the generated queue. The fingerprint covers the prompt, accepted answers, aliases, rationale, sources, difficulty and time-sensitive deadline. Any editorial change therefore invalidates the old approval and forces a fresh review. An approval date becomes that challenge's verification date. The approval registry is intentionally empty until real reviews are completed.

## Independent review procedure

The reviewer must be someone other than the question's author. For each row in `EDITORIAL-REVIEW-QUEUE.csv`, they must:

1. Open the cited authority URL where one is supplied, or locate the cited bibliographic source.
2. Confirm that the wording does not reveal the answer and remains unambiguous in its stated context.
3. Verify every canonical answer, ordered answer and relevant explanation against the source.
4. Check aliases for genuine variants, spelling and abbreviations without allowing unsafe partial matches.
5. Confirm or amend the proposed Accessible, Mixed or Expert difficulty profile.
6. For time-sensitive material, confirm that the review deadline remains appropriate.
7. Replace `READY_FOR_INDEPENDENT_REVIEW` with `APPROVED` or `CHANGES_REQUIRED`, enter a durable reviewer ID and ISO review date, copy `contentFingerprint` into `reviewerFingerprint`, and complete the six review-attestation columns. `CHANGES_REQUIRED` rows need actionable notes.
8. Dry-run the completed worksheet with `pnpm editorial:import -- <completed-review.csv>`. When it passes, run the same command with `--write`, followed by `pnpm release:records` and `pnpm editorial:certify`.

The six approval attestations confirm that the reviewer is independent, checked the cited source, checked wording and answer leakage, checked canonical answers and aliases, checked difficulty, and play-tested the challenge. The importer rejects missing attestations, generic or automated reviewer identities, future dates, reviews predating the source record, stale fingerprints, duplicate decisions and unknown challenge IDs. It accepts partial batches, leaving untouched rows pending, but commercial certification remains closed until all 425 current fingerprints are approved.

The source pass provides 599 authority URL references across the bank. All 425 challenges have at least one authority URL except the Earl of Sandwich tradition, which carries a full edition-level bibliographic citation to *The Oxford Companion to Food*. Organisation homepages are locators for the reviewer, not proof that a particular claim is correct: the reviewer must still navigate to the supporting page and confirm the claim.

A `CHANGES_REQUIRED` record remains release-blocking. After an author corrects it, a reviewer must repeat the check and replace it with a fresh `APPROVED` decision. Automated scripts must never generate approvals. The importer only converts decisions supplied in a completed human worksheet into the typed registry; without explicit reviewed rows it has nothing to import.

## Time-sensitive questions

Questions involving changing rankings, records, office-holders, population, attendance or similar live facts have a mandatory `reviewBy` date. They must be rechecked on or before that date even if previously approved. Expired records block commercial certification until refreshed.

## Generated release records

`pnpm release:records` writes:

- `QUESTION-SOURCES.json`, the complete machine-readable question manifest;
- `EDITORIAL-REVIEW-QUEUE.csv`, the human review worksheet;
- `EDITORIAL-CERTIFICATION.json`, the current approval totals.

These files are included in the Windows package so the released question pack is traceable.
