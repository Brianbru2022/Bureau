# Independent Question Review Protocol

## Release gate

The commercial pack contains 425 challenges across seventeen departments. Every current content fingerprint must be approved by a person who did not author that challenge. Automated checks, simulated players and AI review may identify defects, but cannot supply this approval.

## Recommended batches

Review one department-sized batch of 25 challenges at a time. Start from a fresh copy of `EDITORIAL-REVIEW-QUEUE.csv` after running `pnpm release:records`; never continue from an older worksheet after question data changes.

For every challenge:

1. Follow the cited locator to the exact supporting material. A homepage alone is not evidence; mark the row `CHANGES_REQUIRED` when the filed source cannot substantiate the answer.
2. Read the prompt without viewing the answer and check that it is grammatical, unambiguous and does not reveal the response.
3. Verify every canonical answer, ordered item, numerical value and explanation. For list rounds, verify the complete accepted set rather than a sample.
4. Test aliases as exact variants. Reject ambiguous abbreviations, partial names that could identify two entries, and variants that materially broaden the answer.
5. Confirm the Accessible, Mixed or Expert classification with first-time players from the intended audience.
6. Play the challenge through its real department interface at least once. Check that the wording, input method, reveal and adjudication all agree with the filed answer.
7. Enter a durable pseudonymous reviewer ID and ISO date, copy `contentFingerprint` to `reviewerFingerprint`, set all six attestation columns to `TRUE`, and change the status to `APPROVED`. If anything fails, use `CHANGES_REQUIRED` and give actionable notes.

## Import and correction loop

Dry-run each completed batch:

```powershell
pnpm editorial:import -- .\review-batch.csv
```

When validation succeeds, import it explicitly:

```powershell
pnpm editorial:import -- .\review-batch.csv --write
pnpm release:records
pnpm editorial:audit
```

The importer merges reviewed batches and rejects unknown or duplicate IDs, stale fingerprints, incomplete attestations, invalid dates and automated reviewer labels. A correction changes the content fingerprint, so the reviewer must repeat the affected check. Do not copy an approval from the superseded version.

## Completion

Run `pnpm editorial:certify`. It must report 425 approved, zero pending, zero changes required, no expired time-sensitive record and no automated preflight issue. Keep the completed worksheets with the release evidence; they contain pseudonymous reviewer IDs only and must not contain participant names or contact details.
