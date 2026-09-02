const fs = require('node:fs');

const MAX_LOG_BYTES = 256 * 1024;
const MAX_SUPPORT_LOG_BYTES = 128 * 1024;

const safeText = value => {
  if (value instanceof Error) return `${value.name}: ${value.message}\n${value.stack ?? ''}`.slice(0, 16_000);
  if (typeof value === 'string') return value.slice(0, 16_000);
  try { return JSON.stringify(value).slice(0, 16_000); } catch { return 'Unserialisable diagnostic value'; }
};

const appendDiagnostic = (filePath, type, details) => {
  try {
    fs.mkdirSync(require('node:path').dirname(filePath), { recursive:true });
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > MAX_LOG_BYTES) {
      const existing = fs.readFileSync(filePath);
      fs.writeFileSync(filePath, existing.subarray(Math.max(0, existing.length - MAX_LOG_BYTES / 2)));
    }
    fs.appendFileSync(filePath, `${JSON.stringify({ occurredAt:new Date().toISOString(), type, details:safeText(details) })}\n`, 'utf8');
  } catch { /* diagnostics must never interrupt play */ }
};

const readLogTail = filePath => {
  try {
    const bytes = fs.readFileSync(filePath);
    return bytes.subarray(Math.max(0, bytes.length - MAX_SUPPORT_LOG_BYTES)).toString('utf8');
  } catch { return ''; }
};

const buildSupportBundle = ({ appVersion, electronVersion, platform, arch, packaged, distribution, updateStatus, crashLogPath }) => ({
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  product:'The Bureau of Questionable Knowledge',
  appVersion,
  electronVersion,
  platform,
  arch,
  packaged:Boolean(packaged),
  distribution,
  updateStatus,
  privacy:{candidateNamesIncluded:false,recoveryDataIncluded:false},
  crashLogTail:readLogTail(crashLogPath),
});

module.exports = { appendDiagnostic, buildSupportBundle, readLogTail, safeText };
