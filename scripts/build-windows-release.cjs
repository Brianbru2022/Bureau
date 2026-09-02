const { spawnSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const builderCli = require.resolve('electron-builder/out/cli/cli.js');
const retryPatch = path.join(__dirname, 'windows-fs-retry.cjs');
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const nodeOptions = [`--require=${retryPatch}`, existingNodeOptions].filter(Boolean).join(' ');
const buildInstaller = process.argv.includes('--installer');
const commercial = process.argv.includes('--commercial');
const updateUrl = process.env.BUREAU_UPDATE_URL ?? 'https://updates.invalid/bureau/windows';
if (commercial && (!/^https:\/\//i.test(updateUrl) || /\.invalid(?:\/|$)/i.test(updateUrl))) {
  throw new Error('Commercial installer builds require BUREAU_UPDATE_URL to be a production HTTPS feed.');
}
const channelPath = path.join(projectRoot, 'UPDATE-CHANNEL.json');
const originalChannel = readFileSync(channelPath, 'utf8');
const channel = JSON.parse(originalChannel);
channel.enabled = buildInstaller && !/\.invalid(?:\/|$)/i.test(updateUrl);
channel.feedUrl = channel.enabled ? updateUrl : null;
writeFileSync(channelPath, `${JSON.stringify(channel, null, 2)}\n`, 'utf8');

let result;
try {
  result = spawnSync(
    process.execPath,
    [builderCli, '--win', ...(buildInstaller ? ['portable', 'nsis'] : ['portable']), '--x64', '--publish', 'never'],
    {
      cwd: projectRoot,
      env: { ...process.env, BUREAU_UPDATE_URL:updateUrl, NODE_OPTIONS: nodeOptions },
      stdio: 'inherit',
    },
  );
} finally {
  writeFileSync(channelPath, originalChannel, 'utf8');
}

if (result.error) throw result.error;
process.exit(result.status ?? 1);
