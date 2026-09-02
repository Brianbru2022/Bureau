const certificate = process.env.WIN_CSC_LINK || process.env.CSC_LINK;
const password = process.env.WIN_CSC_KEY_PASSWORD || process.env.CSC_KEY_PASSWORD;
const updateUrl = process.env.BUREAU_UPDATE_URL;

const missing = [];
if (!certificate) missing.push('WIN_CSC_LINK (or CSC_LINK)');
if (!password) missing.push('WIN_CSC_KEY_PASSWORD (or CSC_KEY_PASSWORD)');
if (!updateUrl || !/^https:\/\//i.test(updateUrl) || /\.invalid(?:\/|$)/i.test(updateUrl)) missing.push('BUREAU_UPDATE_URL (a production HTTPS update feed)');

if (missing.length) {
  console.error('Commercial signing credentials are not configured.');
  console.error(`Missing: ${missing.join(', ')}`);
  console.error('Supply them through the release environment; never commit the certificate or password.');
  process.exit(1);
}

console.log('Windows signing environment is configured (credential values withheld).');
