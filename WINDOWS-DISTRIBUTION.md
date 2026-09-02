# Windows distribution

The commercial path is direct, per-user Windows distribution. The portable edition remains available for controlled testing; public customers receive the NSIS installer.

## Release commands

- `pnpm release:windows` builds and verifies the unsigned local portable RC.
- `pnpm release:installer` builds an unsigned installer for local acceptance testing.
- `pnpm commercial:dist` requires completed rights/editorial gates, a trusted code-signing certificate and `BUREAU_UPDATE_URL`, then builds and verifies signed portable and installer artefacts and stages the update channel.

Signing credentials are supplied only through `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` (or Electron Builder’s equivalent variables). `BUREAU_UPDATE_URL` must be a production HTTPS generic feed. No credential belongs in the repository.

## Updates and rollback

The installed edition checks the configured stable feed only when a player requests it. Downloads are never automatic during play. Installation requires explicit confirmation and preserves the local recovery record.

`pnpm update:channel` copies `stable.yml`, the installer and its blockmap into `release/channel/stable`, retaining versioned copies and checksums in `history.json`. It refuses unsigned or invalid installers. Upload that directory atomically to the configured HTTPS feed. To restore a retained release locally before upload, run `node scripts/stage-update-channel.cjs --rollback=<version>` and publish the resulting stable directory. Rollback artefacts must retain valid Authenticode signatures.

## Diagnostics and privacy

The title screen can export a JSON support bundle containing product/runtime versions, distribution type, update state and the bounded tail of the desktop crash log. It deliberately excludes recovery data and candidate names. Recovery exports remain a separate, player-controlled operation.

## Clean-machine acceptance

Record three separate Windows machines in `WINDOWS-ACCEPTANCE.csv`. For each machine verify install, launch identity, a complete assessment, update check, recovery after interruption, support export, upgrade, rollback and uninstall without deleting player data. The commercial exit gate remains closed until all rows are independently completed and the installer signature is valid.
