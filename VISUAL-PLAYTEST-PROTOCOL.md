# Visual milestone play-test protocol

## State and viewport certification

Open `http://localhost:3000/dev/gallery` in a development build. For each department select all six apparatus states, then check one-, two- and four-candidate fixtures with both question lengths.

Capture the gallery at 1920×1080, 1600×900, 1366×768, 1024×768 and 390×844. Desktop captures fail certification if the document itself scrolls or an instruction, active control or status panel is outside the viewport. Mobile may scroll normally.

Repeat at 200% text zoom and with reduced motion enabled. Complete one pass without a pointer, checking visible focus, logical focus order, focus containment in result dossiers and restoration after dismissal.

## Full assessments

Run these sessions without developer explanation:

1. Solo assessment.
2. Two candidates, Light Office Politics.
3. Four candidates, Standard Office Politics.
4. Three further groups using their preferred valid format.

Log every page scroll, unclear control, host intervention, mistaken input, progression block and wait lasting more than five seconds in `playtest-log.csv`. A progression blocker or repeated confusion must be fixed and the affected journey repeated before release.

## Artwork acceptance

- Live labels and controls must remain readable if an apparatus image fails.
- No generated image may contain wording, scores, buttons or required state.
- Controls must sit above imagery and retain at least a 44×44 CSS-pixel hit area.
- Idle, processing, accepted, rejected and result states must be distinguishable without relying on colour alone.
