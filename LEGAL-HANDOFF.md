# Commercial identity and rights handoff

This is an evidence checklist, not legal advice. The application is intentionally blocked from commercial distribution until the real rights holder and qualified advisers complete it.

## 1. Publisher identity

- Confirm the legal publisher name, correspondence address, jurisdiction and any company number.
- Confirm monitored support and privacy contacts.
- Enter those details consistently in `COMMERCIAL-IDENTITY.json`, `SUPPORT.md`, `EULA.md` and `package.json`.
- Retain written authority showing that the publisher may distribute the code, writing, title and original assets.

## 2. Title and visual identity

- Give the professional adviser `TRADEMARK-CLEARANCE.md`, the full product title, current insignia, Windows icon and intended storefront artwork.
- Record intended territories, relevant software/game/entertainment classes, searches, adviser, decision and date.
- Store the approved decision in `COMMERCIAL-IDENTITY.json`; use `CLEARED` only when written advice supports it.
- Retain the in-product fictional-institution disclaimer and avoid government, Crown, police, military or real-agency endorsements.

## 3. Generated artwork

- Review every shipped file listed in the generated-art group of `ASSET-RIGHTS.json`.
- Complete the rights-holder declaration in `ARTWORK-PROVENANCE.md` and its structured counterpart in `GENERATED-ART-PROVENANCE.json`.
- For legacy files, either recover sufficient provider/account/reference evidence, replace the asset with fully documented work, or commission a written rights review.
- Record every replacement's brief or prompt, provider/model, account owner, reference rights, commercial terms, edits, reviewer and date.

## 4. Commercial policies

- Obtain territory-appropriate review of the EULA, privacy statement, support commitments, consumer remedies, refunds, liability, governing law and storefront disclosures.
- Record the adviser and approval date in `COMMERCIAL-IDENTITY.json` and keep the advice with the release dossier.

## 5. Verification

Run:

```powershell
pnpm release:records
pnpm commercial:check
pnpm rc:audit
```

`commercial:check` must pass without editing or bypassing the gate. `rc:audit` may still report other content, signing, accessibility or acceptance blockers.
