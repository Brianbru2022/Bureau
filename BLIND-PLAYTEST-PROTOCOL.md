# Structured blind play-test protocol

Closed-beta recording requires the explicit consent procedure in `CLOSED-BETA-GUIDE.md`. A session played without that consent may inform informal design discussion but cannot be stored or counted as release-candidate evidence.

## Purpose

This milestone tests whether people can complete The Bureau without developer explanation. The observer may record evidence but must not coach the candidates, reinterpret instructions or operate controls unless assistance is being logged.

All records stay on the local machine until the host explicitly exports them. Use anonymous group codes rather than participant names and obtain consent before recording notes.

## Required session matrix

Run at least these three sessions with three independent groups:

1. `GROUP-01`: one candidate, First Assessment.
2. `GROUP-02`: two candidates, Quick assessment with Light Office Politics.
3. `GROUP-03`: four candidates, Standard assessment with Standard Office Politics.

Additional retests should use a new group code suffix, such as `GROUP-02-R2`, so failed and corrected evidence remain distinguishable.

## Starting a recorded session

1. Open the question-mark Host dossier on the opening screen.
2. Under **Structured blind play-test**, enter the anonymous group code, select the cohort slot, confirm independent-group eligibility and recording consent, then choose **Arm required assessment**.
3. Close the dossier. The required format, Office Politics setting and candidate count are locked on the opening screen.
4. Allow the candidates to register themselves and proceed without explanation.

The recorder automatically files the match format, player count, departments, first-question time, round completions, desktop scrolling, adjudications, total duration and final completion.

## Observer incident rules

During an active round, open the Host dossier and file the corresponding incident:

- **Control unclear** when candidates cannot explain an instruction or determine what to do.
- **Mistaken input** for an unintended click, key or submitted choice.
- **Dead time** for avoidable waiting longer than five seconds; select the closest measured duration before filing it.
- **Host assisted** whenever the observer must explain or operate the game.

Do not use an incident as a substitute for notes. At the podium, record the candidates' own enjoyment, clarity and pacing ratings, whether they would play again, whether they completed without help, their favourite department, least-clear department and least-clear moment.

## Export and certification

After filing the podium debrief, export both **Full JSON** and **Session CSV**. Place the JSON reports in a `playtest-results` folder outside the packaged application, then run:

```powershell
pnpm playtest:verify playtest-results
```

The gate passes only when three separately coded, eligibility-attested groups have passing completed records and the evidence includes the exact solo First Assessment, two-candidate Quick/Light and four-candidate Standard/Standard slots. Every scheduled department must have a recorded result between the match-start and match-complete events. A record cannot pass as unassisted if it contains control confusion, host assistance or a progression failure. Missing pacing or independence evidence also prevents certification. Across passing sessions, mean enjoyment and clarity must each reach 3.5/5, mean pacing must reach 3/5 and at least two thirds of groups must say they would play again.

## Exit gate

- Three independent groups complete the required matrix.
- Each required session reaches the podium and files its debrief.
- No representative session contains a progression failure or host assistance.
- No repeated control misunderstanding remains after a corrected retest.
- Match duration, first-question time, scrolling, mistaken input, dead time, clarity and enjoyment are present in the exported evidence.
- The complete event trail covers every department in each filed schedule.
- Enjoyment, clarity, pacing and replay-intent thresholds pass.
