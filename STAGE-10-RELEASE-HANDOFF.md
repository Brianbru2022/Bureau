# Stage 10 commercial release handoff

The local release engineering is reproducible, but commercial approval cannot be self-issued by the development build. `STAGE-10-READINESS.json` is the authoritative readiness summary.

## Locally completed

- Six checksum-filed 1600×900 storefront captures produced from genuine production gameplay.
- Final host quick reference, Windows distribution guide, accessibility statement and first-month support plan included in the candidate.
- Automated rules, complete matches, accessibility counterparts, performance budgets, packaging and ASAR inspection.
- Portable and per-user NSIS candidates with reproducible SHA-256 records.
- Strict GO command that refuses unsigned, uncertified or incompletely cleared publication.

## Required from the publisher and independent reviewers

1. Name the legal publisher and support/privacy route consistently in `COMMERCIAL-IDENTITY.json`, `SUPPORT.md`, `EULA.md` and `package.json`.
2. Record professional trade mark and commercial-policy decisions; complete generated-art provenance clearance.
3. Independently approve all 425 editorial records.
4. Complete three consented independent beta groups, four witnessed accessibility sessions and three clean Windows machines.
5. Obtain a trusted Windows code-signing certificate and supply it through `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` without committing either value.
6. Provision the publisher-controlled production HTTPS update feed and supply its URL as `BUREAU_UPDATE_URL`.
7. Resolve or formally close every release-blocking entry in `KNOWN-ISSUES.json` with supporting evidence.

## Final command

Run `pnpm rc:go` in the controlled signing environment. It intentionally fails until the storefront, Stage 9, rights, signing and complete release-candidate gates all pass. If it succeeds, run `pnpm commercial:dist`, inspect the signed artefact hashes and upload the staged update channel atomically.

Never publish an unsigned RC or replace missing human/legal evidence with generated approvals.
