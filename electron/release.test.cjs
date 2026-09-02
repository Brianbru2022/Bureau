const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { readStorageSnapshot, sanitiseStorageSnapshot, writeStorageSnapshot } = require('./storage.cjs');

const projectRoot = path.resolve(__dirname, '..');
const readProjectFile = relativePath => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

test('storage snapshots accept only versioned Bureau keys and string values', () => {
  assert.equal(sanitiseStorageSnapshot(null), null);
  assert.equal(sanitiseStorageSnapshot({ version: 2, values: {} }), null);
  const snapshot = sanitiseStorageSnapshot({
    version: 1,
    exportedAt: 123,
    values: {
      'the-bureau.active-game.v4': '{"safe":true}',
      'unknown-injected-key': 'no',
      'the-bureau.audio-muted': true,
    },
  });
  assert.deepEqual(snapshot, {
    version: 1,
    exportedAt: 123,
    values: { 'the-bureau.active-game.v4': '{"safe":true}' },
  });
});

test('storage snapshots round-trip through an atomic recovery file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bureau-release-'));
  try {
    const filePath = path.join(directory, 'recovery.json');
    const snapshot = { version: 1, exportedAt: 456, values: { 'the-bureau.audio-muted': 'true' } };
    assert.equal(writeStorageSnapshot(filePath, snapshot), true);
    assert.deepEqual(readStorageSnapshot(filePath), snapshot);
    assert.equal(fs.existsSync(`${filePath}.tmp`), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('desktop recovery retains completed control demonstrations', () => {
  const snapshot = sanitiseStorageSnapshot({
    version: 1,
    exportedAt: 789,
    values: { 'bureau.control-demonstrations.v1': '["COMPLAINTS_DESK"]' },
  });
  assert.deepEqual(snapshot?.values, { 'bureau.control-demonstrations.v1': '["COMPLAINTS_DESK"]' });
});

test('desktop shell retains the required Windows security and recovery controls', () => {
  const main = readProjectFile('electron/main.cjs');
  for (const required of [
    'contextIsolation:true',
    'nodeIntegration:false',
    'sandbox:true',
    "setWindowOpenHandler(() => ({ action:'deny' }))",
    'setPermissionRequestHandler((_webContents, _permission, callback) => callback(false))',
    'requestSingleInstanceLock()',
    "'render-process-gone'",
    'requestQuitConfirmation',
    'PORTABLE_EXECUTABLE_DIR',
  ]) assert.match(main, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('release metadata and offline assets are complete', () => {
  const pkg = JSON.parse(readProjectFile('package.json'));
  assert.equal(pkg.version, '1.0.0-rc.1');
  assert.equal(pkg.build.productName, 'The Bureau of Questionable Knowledge');
  assert.equal(pkg.build.appId, 'uk.co.questionableknowledge.bureau');
  assert.equal(pkg.build.win.target.includes('portable'), true);
  assert.equal(pkg.build.win.target.includes('nsis'), true);
  for (const relativePath of [
    'build/icon.ico',
    'LICENSES.md',
    'THIRD-PARTY-NOTICES.md',
    'QUESTION-SOURCES.json',
    'ASSET-RIGHTS.json',
    'COMMERCIAL-IDENTITY.json',
    'GENERATED-ART-PROVENANCE.json',
    'AUDIO-QUALITY-REVIEW.json',
    'PERFORMANCE-BUDGETS.json',
    'PERFORMANCE-CERTIFICATION.json',
    'STAGE-9-CERTIFICATION.json',
    'STAGE-9-CERTIFICATION.md',
    'STOREFRONT-CAPTURES.json',
    'STAGE-10-READINESS.json',
    'STAGE-10-RELEASE-HANDOFF.md',
    'ARTWORK-PROVENANCE.md',
    'LEGAL-HANDOFF.md',
    'TRADEMARK-CLEARANCE.md',
    'EULA.md',
    'PRIVACY.md',
    'ACCESSIBILITY.md',
    'SUPPORT.md',
    'UPDATE-CHANNEL.json',
    'WINDOWS-DISTRIBUTION.md',
    'WINDOWS-ACCEPTANCE.csv',
    'PLAYTEST-CERTIFICATION.json',
    'PLAYTEST-FINDINGS.md',
    'BETA-BALANCE-REPORT.json',
    'public/assets/fonts/bureau-fonts.css',
  ]) assert.equal(fs.existsSync(path.join(projectRoot, relativePath)), true, `${relativePath} must exist`);
  const html = readProjectFile('index.html');
  assert.match(html, /\/assets\/fonts\/bureau-fonts\.css/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
});

test('commercial identity and generated-art clearance remain evidence based', () => {
  const identity = JSON.parse(readProjectFile('COMMERCIAL-IDENTITY.json'));
  const provenance = JSON.parse(readProjectFile('GENERATED-ART-PROVENANCE.json'));
  assert.equal(identity.productTitle, 'The Bureau of Questionable Knowledge');
  assert.equal(identity.status, 'INCOMPLETE');
  assert.equal(identity.trademark.status, 'PROFESSIONAL_REVIEW_REQUIRED');
  assert.equal(identity.legalReview.status, 'PROFESSIONAL_REVIEW_REQUIRED');
  assert.equal(provenance.status, 'INCOMPLETE');
  assert.equal(provenance.legacyAssets.status, 'INCOMPLETE');
  const replacement = provenance.records.find(record => record.assetId === 'bidding-claim-console-v5');
  assert.ok(replacement);
  assert.equal(replacement.status, 'CONDITIONAL');
  for (const file of replacement.shippedFiles) assert.equal(fs.existsSync(path.join(projectRoot, file)), true, `${file} must exist`);
});

test('fictional product branding does not present Crown or government affiliation', () => {
  for (const relativePath of [
    'src/components/screens/TitleScreen.tsx',
    'src/components/screens/SetupScreen.tsx',
    'src/components/rounds/FinalCaseRound.tsx',
    'src/components/screens/AwardsPodium.tsx',
    'src/data/bureauAssets.ts',
  ]) {
    const content = readProjectFile(relativePath);
    assert.doesNotMatch(content, /Crown Bureau|Crown Archive|to the Crown|Crown Indemnity/);
  }
  assert.match(readProjectFile('src/components/screens/TitleScreen.tsx'), /fictional institution/i);
  assert.match(readProjectFile('src/data/visualAssetManifest.ts'), /bidding-claim-console'[\s\S]*'v5'/);
});

test('closed-beta evidence requires attested independent cohorts and exact formats', () => {
  const certification = JSON.parse(readProjectFile('PLAYTEST-CERTIFICATION.json'));
  assert.equal(certification.status, 'AWAITING_EVIDENCE');
  assert.equal(certification.independentPassingGroups, 0);
  const protocol = readProjectFile('BLIND-PLAYTEST-PROTOCOL.md');
  assert.match(protocol, /independent-group eligibility/i);
  assert.match(protocol, /solo First Assessment, two-candidate Quick\/Light and four-candidate Standard\/Standard/i);
  const verifier = readProjectFile('scripts/verify-playtest-evidence.ts');
  assert.match(verifier, /PLAYTEST-CERTIFICATION\.json/);
  assert.match(verifier, /PLAYTEST-FINDINGS\.md/);
});

test('release pipeline is pinned, minimal and non-interactive', () => {
  const pkg = JSON.parse(readProjectFile('package.json'));
  assert.equal(pkg.packageManager, 'pnpm@11.19.0');
  assert.equal(pkg.engines.node, '>=22.12 <25');
  assert.deepEqual(pkg.dependencies, { 'electron-updater':'6.8.9' });
  assert.equal(pkg.scripts['release:windows'], 'pnpm run check && pnpm run desktop:package && pnpm run release:verify');
  assert.match(pkg.scripts['commercial:dist'], /--require-signed/);
  assert.match(pkg.scripts['commercial:dist'], /update:channel/);
  assert.match(pkg.scripts['commercial:dist'], /windows:acceptance/);

  const workspace = readProjectFile('pnpm-workspace.yaml');
  assert.match(workspace, /electron: true/);
  assert.match(workspace, /esbuild: true/);
  assert.match(workspace, /electron-winstaller: false/);

  for (const relativePath of [
    'scripts/build-windows-release.cjs',
    'scripts/verify-windows-release.cjs',
    'scripts/check-signing-environment.cjs',
    'scripts/inspect-windows-release.ps1',
    'scripts/stage-update-channel.cjs',
    'scripts/verify-windows-acceptance.cjs',
    'scripts/measure-release-performance.ts',
    'scripts/check-stage9-certification.ts',
    'scripts/capture-storefront.ts',
    'scripts/verify-storefront-assets.ts',
    'scripts/check-stage10-readiness.ts',
  ]) assert.equal(fs.existsSync(path.join(projectRoot, relativePath)), true, `${relativePath} must exist`);

  const retryPatch = readProjectFile('scripts/windows-fs-retry.cjs');
  assert.match(retryPatch, /sourcePath\.endsWith\('\.tmp'\)/);
  assert.match(retryPatch, /destinationPath === sourcePath\.slice\(0, -4\)/);
  assert.match(retryPatch, /path\.dirname\(sourcePath\) === path\.dirname\(destinationPath\)/);
  assert.match(retryPatch, /fsPromises\.cp\(sourcePath, destinationPath/);

  const stage9 = readProjectFile('scripts/check-stage9-certification.ts');
  assert.match(stage9, /AWAITING_HUMAN_EVIDENCE/);
  assert.match(stage9, /--require-human/);
  const windowsAcceptance = readProjectFile('scripts/verify-windows-acceptance.cjs');
  assert.match(windowsAcceptance, /cells\.length>=17/);
  assert.match(windowsAcceptance, /new Set\(valid\.map/);
  assert.match(pkg.scripts['rc:go'], /storefront:verify/);
  assert.match(pkg.scripts['rc:go'], /stage9:certify/);
  assert.match(pkg.scripts['rc:go'], /signing:check/);
});

test('question source record covers all unique filed challenges', () => {
  const manifest = JSON.parse(readProjectFile('QUESTION-SOURCES.json'));
  assert.equal(manifest.challengeCount, 425);
  const ids = manifest.entries.map(entry => entry.challengeId);
  assert.equal(ids.length, 425);
  assert.equal(new Set(ids).size, ids.length);
});
