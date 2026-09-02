# The Bureau of Questionable Knowledge — artwork provenance

## Generated apparatus and scenery

The artwork under `public/assets/generated`, `generated-v2`, `generated-v3` and `generated-v4`, with editable masters under `assets/source-art`, was produced specifically for this project through AI-assisted image-generation sessions and subsequent project editing. It is decorative: gameplay wording, controls, values and state remain in accessible DOM/SVG content.

The legacy sessions did not retain a complete per-image record of the exact model version, generation account, prompt, date and edit history. `GENERATED-ART-PROVENANCE.json` is the machine-readable declaration and per-asset register; `ASSET-RIGHTS.json` derives its generated-art status from that file. The group therefore remains **CONDITIONAL**, not commercially cleared. File hashes provide a stable inventory but do not repair missing provenance.

On 31 August 2026, the bidding console's crown, supporters and coat-of-arms motif were replaced with a neutral filing-drawer emblem. The versioned v5 source, delivery files, exact edit prompt and disclosed reference basis are recorded in `GENERATED-ART-PROVENANCE.json`. The retired v4 source and delivery copies are preserved under `assets/source-art/retired-identity-art`, outside the shipped `public` tree. Because the edited v4 reference has incomplete legacy provenance, the v5 derivative remains conditional rather than being represented as newly cleared artwork.

On 2 September 2026, the cartography table, redaction desk and complaints analyser were similarly rebuilt around explicit blank control apertures and their Crown-like or heraldic insignia were replaced with fictional non-heraldic filing, compass and balance motifs. Versioned sources, delivery files and exact edit prompts are recorded in `GENERATED-ART-PROVENANCE.json`; the retired masters and WebP files are preserved under `assets/archive/step4-pre-insignia`, outside the shipped `public` tree. These derivatives remain conditional for the same legacy-provenance reason.

Before commercial distribution, the legal rights holder must complete and sign the following declaration or replace affected artwork with newly generated or commissioned assets carrying complete records.

## Rights-holder declaration

Legal rights holder: **TO BE COMPLETED**  
Generation provider and account owner: **TO BE COMPLETED**  
Applicable provider terms and effective date: **TO BE COMPLETED**  
Confirmation that the account was authorised for commercial generation: **TO BE COMPLETED**  
Confirmation that no third-party reference image was supplied without permission: **TO BE COMPLETED**  
Human editor and material edits: **TO BE COMPLETED**  
Signed and dated: **TO BE COMPLETED**

The same values must be entered in `GENERATED-ART-PROVENANCE.json`, its status changed only after documentary review, and `pnpm release:records` rerun. Editing this prose alone cannot clear the commercial gate.

## New-art rule

Every new generated or commissioned asset must record:

- Stable local asset ID and shipped filename
- Creator, commissioner or generation-account owner
- Provider, tool and model version
- Prompt or written art brief
- Generation and edit dates
- Any supplied reference images and their rights basis
- Applicable commercial terms or written assignment
- Material edits and final SHA-256 hash

Generated imagery must also receive a human review for accidental logos, recognisable protected characters, misleading text and obvious generation artefacts.
