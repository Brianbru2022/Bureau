# Accessibility statement

The Bureau of Questionable Knowledge aims to support keyboard, pointer and touch play on a shared screen.

Current provisions include visible keyboard focus, native or keyboard-operable essential controls, 44-pixel minimum interaction targets, focus-managed dialogs, reduced-motion behaviour, concise live status announcements, local media fallbacks and normal document scrolling on narrow or enlarged layouts.

The Atlas Room supports arrow-key plotting, Shift-modified larger movement, Space to place a pin and Enter to lock coordinates. Ordering rounds provide visible movement controls in addition to drag interaction.

## Release-candidate evidence

Automated browser coverage exercises keyboard setup, focus order and restoration, reduced-motion CSS, doubled text, screen-reader-facing roles and live states, blocked artwork and active desktop overflow. These tests establish the technical baseline only. Human acceptance for keyboard-only, reduced-motion, 200% text and screen-reader scenarios is recorded separately in `ACCESSIBILITY-ACCEPTANCE.csv`; all four witnessed rows are required by the release-candidate gate. The exact procedure is in `STAGE-9-CERTIFICATION.md`.

## Known limitations

- Independent accessibility acceptance has not yet been recorded in the release-candidate register.
- Some decorative generated artwork has not completed its commercial provenance review; blocking the artwork does not remove gameplay information.
- A single shared screen and private candidate handovers may not suit every player group.

Accessibility problems should be reported through the contact that must be completed in `SUPPORT.md` before release.
