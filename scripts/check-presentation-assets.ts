import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allChallenges } from '../src/data/questions';
import { VISUAL_ASSET_MANIFEST } from '../src/data/visualAssetManifest';
import { DEPARTMENT_SOUND_FAMILIES } from '../src/sound/audioEngine';

const root = process.cwd();
const publicRoot = join(root, 'public');
const budget = 400_000;
const errors: string[] = [];
const assert = (condition: boolean, message: string) => { if (!condition) errors.push(message); };
const publicPath = (url: string) => join(publicRoot, url.replace(/^\//, ''));

const apparatus = new Set<string>();
for (const [roundType, states] of Object.entries(VISUAL_ASSET_MANIFEST)) {
  for (const [state, asset] of Object.entries(states)) {
    if (!asset) continue;
    for (const url of [asset.desktop, asset.compact]) {
      apparatus.add(url);
      const path = publicPath(url);
      assert(existsSync(path), `${roundType} ${state} is missing ${url}`);
      if (existsSync(path)) assert(statSync(path).size < budget, `${url} exceeds ${budget} bytes`);
      assert(url.endsWith('.webp'), `${url} must be a WebP release asset`);
    }
  }
}

const revealFiles = new Set(allChallenges
  .filter(challenge => challenge.roundType === 'IMAGE_REVEAL')
  .map(challenge => challenge.imageUrl.replace('/assets/reconnaissance/', '')));
for (const file of revealFiles) {
  const path = join(publicRoot, 'assets', 'reconnaissance', file);
  assert(file.endsWith('.webp'), `${file} must be a WebP reveal derivative`);
  assert(existsSync(path), `Missing reveal image ${file}`);
  if (existsSync(path)) assert(statSync(path).size < budget, `${file} exceeds ${budget} bytes`);
}

for (const registerName of ['CORE-LICENCES.json', 'EXPANSION-LICENCES.json']) {
  const register = JSON.parse(readFileSync(join(publicRoot, 'assets', 'reconnaissance', registerName), 'utf8')) as Array<{file:string;bytes:number;sha256:string}>;
  for (const record of register) {
    const path = join(publicRoot, 'assets', 'reconnaissance', record.file);
    assert(revealFiles.has(record.file), `${registerName} lists unused ${record.file}`);
    assert(existsSync(path), `${registerName} lists missing ${record.file}`);
    if (existsSync(path)) assert(record.bytes === statSync(path).size, `${record.file} licence byte count is stale`);
    assert(Boolean(record.sha256), `${record.file} requires a checksum`);
  }
}

const generatedV2 = readdirSync(join(publicRoot, 'assets', 'generated-v2')).sort();
assert(JSON.stringify(generatedV2) === JSON.stringify(['dispatch-board.webp','final-adjudication-engine.webp','finding-press.webp','podium-machine.webp']), 'generated-v2 contains an obsolete or missing release asset');
assert(readdirSync(join(publicRoot, 'assets', 'generated-v3')).length === 0, 'generated-v3 must not ship obsolete concepts');

const review = JSON.parse(readFileSync(join(root, 'ARTWORK-QUALITY-REVIEW.json'), 'utf8')) as {approved:string[];checks:Record<string,boolean>};
const roundTypes = Object.keys(VISUAL_ASSET_MANIFEST).sort();
assert(JSON.stringify([...review.approved].sort()) === JSON.stringify(roundTypes), 'Artwork quality review must cover every department exactly once');
assert(Object.values(review.checks).every(Boolean), 'Artwork quality review contains an unresolved visual check');
const audioReview = JSON.parse(readFileSync(join(root, 'AUDIO-QUALITY-REVIEW.json'), 'utf8')) as {approved:string[];motifs:string[];rightsBasis:string;checks:Record<string,boolean>};
const soundRoundTypes=Object.keys(DEPARTMENT_SOUND_FAMILIES).sort();
const soundMotifs=[...new Set(Object.values(DEPARTMENT_SOUND_FAMILIES).map(profile=>profile.motif))].sort();
assert(JSON.stringify([...audioReview.approved].sort())===JSON.stringify(soundRoundTypes),'Audio quality review must cover every department exactly once');
assert(JSON.stringify([...audioReview.motifs].sort())===JSON.stringify(soundMotifs),'Audio quality review must list the implemented mechanical motifs');
assert(audioReview.rightsBasis==='original-procedural','Audio review must retain the original procedural rights basis');
assert(Object.values(audioReview.checks).every(Boolean),'Audio quality review contains an unresolved technical check');
assert(soundMotifs.length<=8,'Department audio must use a restrained shared mechanical palette');

if (errors.length) {
  console.error(`Presentation asset audit failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const revealBytes = [...revealFiles].reduce((sum, file) => sum + statSync(join(publicRoot, 'assets', 'reconnaissance', file)).size, 0);
  console.log(`Presentation assets passed: ${apparatus.size} apparatus variants, ${revealFiles.size} reveal images (${revealBytes.toLocaleString('en-GB')} bytes), 17 reviewed departments.`);
}
