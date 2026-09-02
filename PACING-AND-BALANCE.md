# Pacing and balance contract

The Bureau advertises a duration range after the host chooses an itinerary and before they choose the number of candidates. The range is calculated from the actual departments, candidate count, assessment format and Office Politics setting. It is not a generic label.

The estimate includes registration, private directives where applicable, department transitions, proportional mini-games, the final case and the post-assessment dossier. Solo play automatically excludes Office Politics. First Assessment omits advanced systems and therefore has its own shorter overhead.

## Automated guardrails

`pnpm development:report` runs deterministic laboratories for:

- the 17 continuous department score curves at novice, regular and expert skill levels;
- one-, two- and four-seat starting-position spread;
- cautious, balanced and aggressive risk strategies;
- Office Politics success thresholds and score returned per Influence;
- adjacent mechanical similarity and duplicate departments in 4-, 6- and 8-round schedules;
- the advertised duration contract for First, Quick, Standard and Full formats at one, two and four candidates.

These checks are regression alarms, not fixed score categories. No player is assigned a score band: every live award continues to come from actual accuracy, distance, elapsed time, risk, evidence used or valid answers supplied.

Stage 5 applies a monotonic, department-specific power curve after that raw performance calculation. Every curve preserves zero, preserves a perfect 1,000 and preserves the ordering of nearby results. The seeded regular-player target is a mean of 475–525 points per department, preventing a department from dominating merely because its input mechanic has a different natural distribution.

Assessment schedules are shaped from calmer opening departments towards a stronger closing department without duplicating departments or placing mechanically similar rounds together. The opening round is free of Office Politics; Light Politics is intermittent and Standard Politics may begin after the first result. Existing proportional mini-game boundaries remain between rounds rather than interrupting the opening or finale.

## Measured play-test evidence

The model is only a starting contract. Exported blind play-test reports contain the measured match duration. `pnpm playtest:verify playtest-results` compares each completed session with the range that would have been advertised for its exact configuration and fails when a session falls outside it.

Schema-v5 exports also include pseudonymous per-seat, per-department calibrated awards and attempt durations. `pnpm balance:beta` aggregates only events tied to completed, consented, independently attested and unassisted sessions into `BETA-BALANCE-REPORT.json`. Unattached or disqualified score events are counted as excluded rather than trusted. It reports `AWAITING_EVIDENCE`, `PARTIAL_EVIDENCE`, `CHANGES_REQUIRED` or `READY_FOR_REVIEW` rather than inventing conclusions when the sample is too small.

Once several independent sessions exist, adjust the apparatus timing assumptions to the measured median rather than widening ranges to hide a miss. Record recurring dead time separately using the play-test recorder. Human evidence remains required for the commercial exit gate.

## Current balance policy

- No starting seat may gain a two per cent average advantage in the seeded match laboratory.
- No risk strategy may exceed another by 28 per cent across the three risk departments.
- No Office Politics motion may award more than 150 points, and simulated points per Influence must remain within a 1.6 ratio.
- Every standard rivalry threshold must remain achievable in 25–75 per cent of representative attempts.
- Schedules must contain unique departments and no adjacent pair from the same mechanical similarity group.
- A schedule's closing momentum must exceed its opening momentum by at least 0.15 in the seeded laboratory.
- Human advantage claims require at least eight recorded attempts for the affected department and the complete independent-group beta matrix before the commercial exit gate can pass.
- Final human balance review requires six independent groups, all seventeen departments at eight eligible attempts, representation of one, two and four candidates, less than 5% seat spread, department means of 350–650 and no sufficiently sampled department above a 55% zero-score rate.
