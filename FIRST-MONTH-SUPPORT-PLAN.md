# First-Month Support Plan

This plan becomes operational only after a legal publisher and monitored support address are entered in `SUPPORT.md`.

Accountable owner: **TO BE COMPLETED**  
Deputy or absence cover: **TO BE COMPLETED**

The release gate treats these assignments as external clearance: they must name people or an accountable team that has accepted the rota. They must not be replaced with an invented identity merely to pass automation.

## Coverage

- **Day 0:** verify download hashes, signing, update metadata, known issues and recovery instructions immediately before publication.
- **Days 1–3:** review the support inbox twice daily; triage installation, lost-progress, accessibility and progression reports first.
- **Day 7:** publish a known-issues refresh and decide whether a hotfix is required.
- **Day 14:** review crash/support exports, factual challenges and question adjudications; prepare a tested patch if evidence warrants it.
- **Day 30:** publish the first-month report, retire superseded installers and set the next maintenance window.

## Response targets

- Critical safety, data exposure or universal progression failure: acknowledge within 4 support hours; suspend distribution or updates while investigated.
- High installation, recovery, accessibility or format blocker: acknowledge within 1 business day; target a verified fix or workaround within 3 business days.
- Medium gameplay, content or presentation defect: acknowledge within 3 business days; schedule into the next suitable patch.
- Low cosmetic or suggestion: review during the weekly triage.

These are internal service targets, not contractual promises, until the publisher's consumer policy has legal approval.

## Patch discipline

Every patch must pass `pnpm rc:verify`, carry updated release notes and known issues, retain save compatibility, be signed by the same trusted publisher identity and be staged only through the production HTTPS update channel. Roll back immediately if recovery, launch or full-match smoke evidence fails.

## Information to request

Ask for version, Windows version, installed or portable edition, last completed action and the privacy-safe support bundle. Do not request a recovery file unless necessary because it can contain candidate names and match history. Never ask for passwords, account data or unrelated system logs.
