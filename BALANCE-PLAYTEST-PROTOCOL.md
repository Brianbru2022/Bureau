# Human Balance Play-test Protocol

## Purpose

This programme measures the released scoring curves with real candidates. Seeded simulations remain regression guards; they cannot establish that a department is enjoyable, understandable or fairly rewarded in human play.

## Evidence target

- Complete the three first-time sessions in `BLIND-PLAYTEST-PROTOCOL.md`.
- Continue with independent four-candidate **Full Bureau** balance sessions using the `FOUR_FULL_BALANCE` recorder slot.
- Use at least six independently coded groups across the combined evidence set.
- Continue until every department has at least eight eligible scored attempts and solo, two-candidate and four-candidate evidence is represented.
- A session is eligible only when it is completed, consented, independently attested, configured for its selected cohort and completed without control confusion, host assistance or a progression failure.

Because schedules are randomised, inspect `BETA-BALANCE-REPORT.json` after each batch and continue testing departments whose sample count remains below eight. Do not edit exported events or count automated journeys as human evidence.

## Review thresholds

`pnpm balance:beta` reports, but never automatically applies, potential adjustments. A release review is required when:

- starting-seat mean spread reaches 5%;
- a sufficiently sampled department mean falls outside 350–650 points;
- a sufficiently sampled department produces zero in more than 55% of attempts; or
- any department has fewer than eight eligible human attempts.

Suggested multipliers are diagnostic only. Inspect the underlying answer, duration, risk and player feedback before changing a curve. Any adjustment must remain continuous and monotonic, preserve zero and a perfect 1,000, and be followed by a fresh human retest.

## Procedure

1. Follow the consent and clean-machine procedure in `CLOSED-BETA-GUIDE.md`.
2. Arm **Four candidates · Full Bureau · Standard Politics · balance coverage** from the Host dossier.
3. Let the group play without coaching. File every confusion, mistaken input, dead-time interval, assistance and progression failure when it occurs.
4. Complete the podium debrief and export the JSON report.
5. Place reports in `playtest-results`, then run `pnpm playtest:verify playtest-results` and `pnpm balance:beta`.
6. Record any threshold breach in `KNOWN-ISSUES.json`, correct the underlying rule or presentation, and retest under a new group code.

The balance report reaches `READY_FOR_REVIEW` only when evidence coverage and thresholds pass. This means the evidence is ready for a release decision; it is not an automatic instruction to ship.
