# Storefront Asset Brief

Use genuine release-candidate gameplay at 1600×900. Do not use the development gallery, debug controls, mock player reviews or generated screens that cannot occur in play.

Required captures:

1. Opening screen with the final title and assessment choices.
2. Four-candidate department apparatus with every candidate visible.
3. Cartography result with clearly distinct guessed and certified pins and route.
4. Top Ten cabinet showing lives and one persistent eliminated plate.
5. A result dossier showing answer, proportional score change and current total.
6. Final post-assessment dossiers without participant names that identify real testers.

Artwork rules:

- Retain the teal, cream, brass and red bureaucratic identity.
- Keep required UI wording readable at storefront thumbnail size.
- Do not composite controls into generated artwork.
- Do not imply online multiplayer, voice control or mobile controllers.
- Record the exact build version, seed, viewport and file SHA-256 beside each selected image.

Final image dimensions, crops and age-rating marks must follow the selected storefront's current specification at submission time. Those specifications are external and must be checked before export.

## Filed release-candidate set

The six required 1600×900 production-gameplay captures are filed in `storefront/captures`. `STOREFRONT-CAPTURES.json` records their build version, deterministic seed, viewport, anonymisation state and SHA-256 digest. Run `pnpm storefront:verify` after any replacement or crop; recapture from the candidate rather than editing live controls into an image.
