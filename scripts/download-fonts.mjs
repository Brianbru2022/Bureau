import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = join(process.cwd(), 'public', 'assets', 'fonts');
const cssUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap';
const licences = {
  cinzel: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/OFL.txt',
  courierprime: 'https://raw.githubusercontent.com/google/fonts/main/ofl/courierprime/OFL.txt',
  fraunces: 'https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/OFL.txt',
  plusjakartasans: 'https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/OFL.txt',
  spacemono: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt'
};

const download = async (url, headers = {}) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  return response;
};

await mkdir(outputDirectory, { recursive: true });
const cssResponse = await download(cssUrl, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36' });
let css = await cssResponse.text();
const fontUrls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) ?? [])];
for (const [index, url] of fontUrls.entries()) {
  const fileName = `bureau-font-${String(index + 1).padStart(2, '0')}.woff2`;
  const response = await download(url);
  await writeFile(join(outputDirectory, fileName), Buffer.from(await response.arrayBuffer()));
  css = css.replaceAll(url, `./${fileName}`);
}
await writeFile(join(outputDirectory, 'bureau-fonts.css'), `/* Bundled from Google Fonts for offline use. See OFL-*.txt. */\n${css}`);
for (const [family, url] of Object.entries(licences)) {
  const response = await download(url);
  await writeFile(join(outputDirectory, `OFL-${family}.txt`), await response.text());
}
console.log(`Bundled ${fontUrls.length} WOFF2 files and ${Object.keys(licences).length} OFL licence files.`);
