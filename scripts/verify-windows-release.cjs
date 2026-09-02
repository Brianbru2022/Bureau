const { createHash } = require('node:crypto');
const { existsSync, readFileSync, statSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const asar = require('@electron/asar');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const releaseDirectory = process.env.BUREAU_RELEASE_DIRECTORY
  ? path.resolve(projectRoot, process.env.BUREAU_RELEASE_DIRECTORY)
  : path.join(projectRoot, packageJson.build.directories.output);
const artifactName = `Bureau-of-Questionable-Knowledge-${packageJson.version}-portable-x64.exe`;
const artifactPath = path.join(releaseDirectory, artifactName);
const installerName = `Bureau-of-Questionable-Knowledge-${packageJson.version}-setup-x64.exe`;
const installerPath = path.join(releaseDirectory, installerName);
const asarPath = path.join(releaseDirectory, 'win-unpacked', 'resources', 'app.asar');
const requireSigned = process.argv.includes('--require-signed');
const requireInstaller = process.argv.includes('--require-installer');

const failures = [];
for (const file of [artifactPath, asarPath]) {
  if (!existsSync(file)) failures.push(`Missing release output: ${path.relative(projectRoot, file)}`);
}
if (requireInstaller) for (const file of [installerPath,path.join(releaseDirectory,'stable.yml'),`${installerPath}.blockmap`]) {
  if (!existsSync(file)) failures.push(`Missing installer output: ${path.relative(projectRoot,file)}`);
}

if (failures.length === 0) {
  const entries = new Set(asar.listPackage(asarPath).map(entry => entry.replaceAll('\\', '/')));
  const requiredEntries = [
    '/dist/index.html',
    '/electron/main.cjs',
    '/package.json',
    '/README.md',
    '/LICENSES.md',
    '/THIRD-PARTY-NOTICES.md',
    '/QUESTION-SOURCES.json',
    '/ASSET-RIGHTS.json',
    '/COMMERCIAL-IDENTITY.json',
    '/GENERATED-ART-PROVENANCE.json',
    '/AUDIO-QUALITY-REVIEW.json',
    '/PERFORMANCE-BUDGETS.json',
    '/PERFORMANCE-CERTIFICATION.json',
    '/STAGE-9-CERTIFICATION.json',
    '/STAGE-9-CERTIFICATION.md',
    '/STOREFRONT-CAPTURES.json',
    '/STAGE-10-READINESS.json',
    '/STAGE-10-RELEASE-HANDOFF.md',
    '/LEGAL-HANDOFF.md',
    '/EULA.md',
    '/PRIVACY.md',
    '/ACCESSIBILITY.md',
    '/SUPPORT.md',
    '/UPDATE-CHANNEL.json',
    '/WINDOWS-DISTRIBUTION.md',
    '/WINDOWS-ACCEPTANCE.csv',
    '/RELEASE-CANDIDATE-STATUS.json',
    '/CLOSED-BETA-GUIDE.md',
    '/PLAYTEST-CERTIFICATION.json',
    '/PLAYTEST-FINDINGS.md',
    '/BETA-BALANCE-REPORT.json',
    '/STOREFRONT-COPY.md',
    '/STOREFRONT-ASSET-BRIEF.md',
    '/KNOWN-ISSUES.json',
    '/KNOWN-ISSUES.md',
    '/FIRST-MONTH-SUPPORT-PLAN.md',
    '/ACCESSIBILITY-ACCEPTANCE.csv',
  ];
  for (const entry of requiredEntries) {
    if (!entries.has(entry)) failures.push(`Packaged app is missing ${entry.slice(1)}.`);
  }

  const forbiddenPrefixes = ['/assets/source/', '/src/'];
  for (const prefix of forbiddenPrefixes) {
    if ([...entries].some(entry => entry.startsWith(prefix))) {
      failures.push(`Packaged app unexpectedly contains ${prefix.slice(1)}.`);
    }
  }

  const packagedMetadata = JSON.parse(asar.extractFile(asarPath, 'package.json').toString('utf8'));
  if (packagedMetadata.name !== packageJson.name) failures.push('Packaged application name does not match package.json.');
  if (packagedMetadata.version !== packageJson.version) failures.push('Packaged application version does not match package.json.');
  if (JSON.stringify(Object.keys(packagedMetadata.dependencies ?? {}).sort()) !== JSON.stringify(['electron-updater'])) failures.push('Packaged application runtime dependencies are not the approved updater-only set.');
  const channel=JSON.parse(asar.extractFile(asarPath,'UPDATE-CHANNEL.json').toString('utf8'));
  if (requireSigned && (!channel.enabled||!/^https:\/\//i.test(channel.feedUrl)||/\.invalid(?:\/|$)/i.test(channel.feedUrl))) failures.push('Commercial package does not contain an enabled production HTTPS update channel.');

  const packagedHtml = asar.extractFile(asarPath, 'dist/index.html').toString('utf8');
  if (!packagedHtml.toLocaleLowerCase('en-GB').includes(packageJson.build.productName.toLocaleLowerCase('en-GB'))) {
    failures.push('Packaged opening document has the wrong product title.');
  }

  const questionSources = JSON.parse(asar.extractFile(asarPath, 'QUESTION-SOURCES.json').toString('utf8'));
  const assetRights = JSON.parse(asar.extractFile(asarPath, 'ASSET-RIGHTS.json').toString('utf8'));
  if (!Number.isInteger(questionSources.challengeCount) || questionSources.challengeCount < 1) failures.push('Packaged question-source record is empty or invalid.');
  if (!Array.isArray(assetRights.groups) || assetRights.groups.length < 1) failures.push('Packaged asset-rights record is empty or invalid.');
}

const inspectWindowsArtifact = filePath => {
  const inspectionScript = path.join(__dirname, 'inspect-windows-release.ps1');
  const result = spawnSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', inspectionScript], {
    encoding: 'utf8',
    env: { ...process.env, BUREAU_RELEASE_EXE: filePath },
  });
  if (result.status !== 0) {
    failures.push(`Could not inspect Windows metadata: ${result.stderr.trim()}`);
    return null;
  }
  const metadata=JSON.parse(result.stdout.trim());
  if (metadata.ProductName !== packageJson.build.productName) failures.push(`${path.basename(filePath)} has the wrong Windows product name.`);
  if (requireSigned && metadata.SignatureStatus !== 'Valid') failures.push(`${path.basename(filePath)} is not validly signed (${metadata.SignatureStatus}).`);
  return metadata;
};
const windowsMetadata=existsSync(artifactPath)?inspectWindowsArtifact(artifactPath):null;
const installerMetadata=requireInstaller&&existsSync(installerPath)?inspectWindowsArtifact(installerPath):null;

if (failures.length) {
  console.error('Release verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const artefacts=[artifactPath,...(requireInstaller?[installerPath]:[])];
const hashes=artefacts.map(file=>({file,hash:createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase()}));
writeFileSync(path.join(releaseDirectory, 'SHA256SUMS.txt'), `${hashes.map(item=>`${item.hash}  ${path.basename(item.file)}`).join('\n')}\n`);
const sizeMiB = (statSync(artifactPath).size / 1024 / 1024).toFixed(1);

console.log('Windows release verified.');
console.log(`Artefact: ${path.relative(projectRoot,artifactPath).replaceAll('\\','/')}`);
console.log(`Size: ${sizeMiB} MiB`);
console.log(`SHA-256: ${hashes[0].hash}`);
console.log(`Authenticode: ${windowsMetadata.SignatureStatus}${windowsMetadata.Signer ? ` (${windowsMetadata.Signer})` : ''}`);
if(installerMetadata) console.log(`Installer: ${path.relative(projectRoot,installerPath).replaceAll('\\','/')} (${(statSync(installerPath).size/1024/1024).toFixed(1)} MiB, ${installerMetadata.SignatureStatus})`);
