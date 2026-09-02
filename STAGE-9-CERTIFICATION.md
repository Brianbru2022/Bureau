# Stage 9 certification protocol

Stage 9 separates automated engineering evidence from evidence that must be observed by people on genuinely independent equipment. Automation must never mark a human session or clean-machine installation as passed.

## Automated performance evidence

Run `pnpm performance:certify` after a production build. It writes `PERFORMANCE-CERTIFICATION.json` and measures these independently:

- encoded opening-screen transfer, including the document, required scripts, styles and fonts;
- whether department or reconnaissance artwork was requested before play;
- median response time for opening the setup controls across five interactions;
- estimated decoded memory for the active screen's images;
- maximum decoded memory for one desktop apparatus master.

Budgets live in `PERFORMANCE-BUDGETS.json`. Do not increase a budget simply to make a regression pass.

## Human accessibility evidence

Use the packaged candidate, not the development server. File one independently witnessed row in `ACCESSIBILITY-ACCEPTANCE.csv` for each scenario:

1. `KEYBOARD_ONLY`: configure, play representative answer and ordering controls, open and close help, and finish an assessment without a pointer.
2. `REDUCED_MOTION`: enable Windows reduced motion before launch; confirm no travel/scale animation delays information or completion.
3. `TEXT_200_PERCENT`: use 200% text/display scaling and confirm every instruction, status and active control remains reachable and legible.
4. `SCREEN_READER`: use the named assistive technology and confirm headings, candidate handovers, live results, dialogs and control names are announced in a workable order.

`tester` must identify the witness and `date` must be ISO `YYYY-MM-DD`. Automated tests are supporting evidence, not substitutes for these rows.

## Clean Windows evidence

Use three distinct Windows machines or clean virtual machines that have not run the development checkout. Each row in `WINDOWS-ACCEPTANCE.csv` must record:

- a clean profile and a `Valid` Authenticode signature;
- install, launch, complete assessment, update check and interrupted recovery;
- privacy-safe support export, upgrade and signed rollback;
- uninstall and preservation of player data unless reset was explicitly chosen.

Use lowercase `true` for every boolean field. A machine ID must be pseudonymous but unique. Never put candidate names, account names or secrets in either register.

Run `pnpm stage9:audit` for the honest technical status. Run `pnpm stage9:certify` only when the human registers are complete; it fails until all four accessibility scenarios and three clean machines pass.
