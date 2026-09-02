# The Bureau of Questionable Knowledge — Closed Beta Guide

## Purpose

This closed beta tests whether first-time groups can install, understand and finish a complete assessment without developer help. It is not a public release and must not be advertised as one.

## Cohort

Recruit at least three independent groups who have not previously watched development sessions or another Bureau test. The evidence set must include the exact solo, two-candidate and four-candidate configurations below. Give each group a neutral code such as `GROUP-01`; never use a participant's name or email address as the code. The in-game recorder requires this eligibility attestation separately from recording consent.

## Consent script

Before arming the recorder, tell every participant:

> This test stores match timings and observer-marked incidents on this PC. It records no names, audio or network activity and sends nothing automatically. A pseudonymous report may be exported manually for the development team. Free-text observer notes are excluded from that report. You can decline without affecting your ability to play, and you can ask for the local record to be deleted before export.

Only tick the consent box if every participant agrees. If anyone declines, play normally without arming the recorder and do not include the session in release evidence.

## Test procedure

1. Use a clean Windows user profile or clean test machine and record it in `WINDOWS-ACCEPTANCE.csv`.
2. Install the release candidate from its signed installer. Do not use a development server.
3. In the Host dossier, select the required cohort slot, confirm independent-group eligibility, obtain consent and arm the structured beta session.
4. Use the configuration locked on the opening screen. Do not explain a control unless progress is otherwise blocked.
5. Mark confusion, mistaken input, measured dead time and host assistance at the moment they occur. These controls remain available during setup, private briefings, transitions, mini-games and live questions.
6. Complete the podium debrief using the candidates' answers.
7. Export `bureau-consented-beta-report.json` and `bureau-consented-beta-sessions.csv`.
8. Run `pnpm playtest:verify playtest-results` and `pnpm balance:beta` after placing exported JSON reports in `playtest-results`.

The verifier accepts current schema-v5 reports and legacy schema-v3/v4 reports, but a legacy report cannot pass without the independent-group and cohort attestations. A passing session must also contain the recorded match start, first-question, completion and every scheduled department result; a completed debrief alone is not evidence of a complete game. It writes `PLAYTEST-CERTIFICATION.json` and `PLAYTEST-FINDINGS.md` on both passing and failing runs so unresolved playability evidence remains explicit. Schema v5 additionally records anonymous seat-ordered department awards and attempt durations; it still contains no candidate names. The balance analyser writes `BETA-BALANCE-REPORT.json` and remains explicitly evidence-pending until the minimum sample is present. Continue into the six-group balance programme described in `BALANCE-PLAYTEST-PROTOCOL.md` after the required three-session matrix.

## Privacy and retention

- Reports are pseudonymous and contain structured match evidence only.
- Candidate names, recovery records, audio, network activity and free-text notes are not exported.
- The application has no telemetry and never uploads a report automatically.
- Keep reports only for the release decision and first post-release review. Delete rejected or withdrawn sessions immediately and delete the evidence set within 90 days of the final decision unless a shorter legal retention period applies.
- Use **Clear all** before handing the same machine to a new unrelated study if retaining local evidence is unnecessary.

## Stop conditions

Stop and file a release-blocking issue if a group cannot progress, loses a recoverable match, encounters an inaccessible required control, sees candidate data from another group or requires repeated developer intervention. Do not coach through a blocker and count the session as passed.

## Severity

- **Critical:** data loss, unsafe installer behaviour, unrecoverable progression block or exposure of another group's data.
- **High:** a complete format cannot be finished, a required control is inaccessible or scoring materially contradicts the rules.
- **Medium:** repeated confusion, avoidable scrolling, broken visual fallback or serious pacing problem.
- **Low:** cosmetic or copy defect with a clear workaround.

Every critical, high or repeated medium finding must be copied into `KNOWN-ISSUES.json` with an owner and retest requirement. Do not edit a failed report into a pass; retain it and file a new `-R2` session after the correction.
