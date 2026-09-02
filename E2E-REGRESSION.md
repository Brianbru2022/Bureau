# End-to-End Regression Suite

Stage 6 adds Playwright coverage for the real browser game and Electron shell. The suite uses the installed Chrome executable and does not download a separate browser.

## Commands

```powershell
pnpm e2e
pnpm e2e:update
```

`pnpm e2e` is part of `pnpm check`. `pnpm e2e:update` deliberately rewrites the five visual baselines and should only be used after reviewing an intentional presentation change.

## Covered journeys

- Complete one-, two- and four-candidate First Assessments in Chrome.
- Complete one-, two- and four-candidate First Assessments through the Electron shell, using a disposable test profile.
- Arm an attested independent beta cohort, verify that its required format and candidate count are locked, and file measured dead time during setup.
- Restart the current attempt, refresh an active match and resume the same challenge.
- Migrate a valid v2 browser save to the complete v4 reducer state and reject malformed recovery data safely.
- Exercise host edit-and-accept, rejection and reversal for an unmatched free-text answer.
- Operate timer pause and resume from the keyboard.
- Replay with the same candidate after the final dossier.
- Verify blocked artwork, reduced motion, doubled text and accessible control/image names.
- Compare stored baselines at 1920×1080, 1600×900, 1366×768, 1024×768 and 390×844.

Full-match automation uses the real host **Skip for zero** action. This preserves authentic match orchestration, player rotation, persistence and podium behaviour without hard-coding quiz answers into the journey.

## Failure evidence

Playwright writes traces, failure screenshots and its HTML report below `test-results/`. Electron tests set `BUREAU_E2E_USER_DATA_DIR` only under `NODE_ENV=test`, keeping the live Bureau profile and saved assessments untouched.
