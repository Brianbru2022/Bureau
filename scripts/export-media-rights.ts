import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

type CoreRecord = {
  file: string;
  subject: string;
  commonsTitle: string;
  author: string;
  licence: string;
  licenceUrl: string;
  sourceImage: string;
  downloadUrl: string;
  changes: string;
};

type GeneratedProvenance = {
  status: string;
  legacyAssets: { status: string; reason: string };
  records: Array<{ assetId: string; status: string; shippedFiles: string[] }>;
};

const root = process.cwd();
const source = JSON.parse(readFileSync(join(root, 'assets', 'rights', 'core-reconnaissance-sources.json'), 'utf8')) as {
  schemaVersion: number;
  reviewedAt: string;
  records: CoreRecord[];
};
const reconnaissanceDirectory = join(root, 'public', 'assets', 'reconnaissance');
const coreSourceDirectory = join(root, 'assets', 'source-art', 'reconnaissance-core');
const sha256 = (filePath: string) => createHash('sha256').update(readFileSync(filePath)).digest('hex');
const filesWithin = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const absolute = join(directory, entry.name);
  return entry.isDirectory() ? filesWithin(absolute) : [absolute];
});

const coreLicences = source.records.map(record => {
  const releaseFile = record.file.replace(/\.jpe?g$/i, '.webp');
  const filePath = join(reconnaissanceDirectory, releaseFile);
  const sourcePath = join(coreSourceDirectory, record.file);
  if (!existsSync(filePath)) throw new Error(`Missing licensed core reconnaissance image: ${releaseFile}`);
  if (!existsSync(sourcePath)) throw new Error(`Missing attributable source copy for core reconnaissance image: ${record.file}`);
  if (!record.author.trim() || !record.licenceUrl.startsWith('https://') || !record.sourceImage.startsWith('https://commons.wikimedia.org/')) {
    throw new Error(`Incomplete core reconnaissance rights record: ${record.file}`);
  }
  return {
    ...record,
    file: releaseFile,
    changes: `${record.changes} Converted to a maximum 1440 by 1080 WebP derivative for local display.`,
    acquiredAt: source.reviewedAt,
    bytes: statSync(filePath).size,
    sha256: sha256(filePath),
  };
});

writeFileSync(join(reconnaissanceDirectory, 'CORE-LICENCES.json'), `${JSON.stringify(coreLicences, null, 2)}\n`, 'utf8');

const generatedDirectories = ['generated', 'generated-v2', 'generated-v3', 'generated-v4'];
const generatedFiles = generatedDirectories.flatMap(name => {
  const directory = join(root, 'public', 'assets', name);
  return existsSync(directory) ? filesWithin(directory) : [];
}).filter(filePath => !filePath.endsWith('README.md'));
const expansionPath = join(reconnaissanceDirectory, 'EXPANSION-LICENCES.json');
const expansionRecords = JSON.parse(readFileSync(expansionPath, 'utf8')) as Array<Record<string, string>>;
const generatedProvenance = JSON.parse(readFileSync(join(root, 'GENERATED-ART-PROVENANCE.json'), 'utf8')) as GeneratedProvenance;
const generatedArtCleared = generatedProvenance.status === 'CLEARED'
  && generatedProvenance.legacyAssets.status === 'CLEARED'
  && generatedProvenance.records.every(record => record.status === 'CLEARED');
const provenanceByFile = new Map(generatedProvenance.records.flatMap(record => record.shippedFiles.map(file => [file, record.assetId] as const)));

const assetRights = {
  schemaVersion: 1,
  productTitle: 'The Bureau of Questionable Knowledge',
  reviewedAt: source.reviewedAt,
  releaseRule: 'No asset marked CONDITIONAL or BLOCKED may ship in a commercial build without a completed rights-holder review.',
  groups: [
    {
      id: 'core-reconnaissance', status: 'CLEARED', basis: 'Individual Wikimedia Commons records',
      records: coreLicences.map(({ file, subject, author, licence, licenceUrl, sourceImage, changes, bytes, sha256 }) => ({ file:`public/assets/reconnaissance/${file}`, subject, author, licence, licenceUrl, sourceImage, changes, bytes, sha256 })),
    },
    {
      id: 'expansion-reconnaissance', status: 'CLEARED', basis: 'Individual Wikimedia Commons records',
      records: expansionRecords.map(record => {
        const filePath = join(reconnaissanceDirectory, record.file);
        return { ...record, file:`public/assets/reconnaissance/${record.file}`, bytes:statSync(filePath).size, sha256:sha256(filePath) };
      }),
    },
    {
      id: 'generated-artwork', status: generatedArtCleared ? 'CLEARED' : 'CONDITIONAL', basis: generatedArtCleared ? 'Approved generated-art provenance register' : generatedProvenance.legacyAssets.reason,
      requiredAction: generatedArtCleared ? undefined : 'Complete and approve GENERATED-ART-PROVENANCE.json and the signed declaration in ARTWORK-PROVENANCE.md, or replace conditional assets.',
      records: generatedFiles.map(filePath => {
        const file = relative(root, filePath).replaceAll('\\','/');
        return { file, provenanceAssetId: provenanceByFile.get(file) ?? null, bytes:statSync(filePath).size, sha256:sha256(filePath) };
      }),
    },
    {
      id: 'bundled-map', status: 'CLEARED', basis: 'OpenStreetMap ODbL data and CARTO-rendered style with in-game attribution',
      notice: 'See THIRD-PARTY-NOTICES.md and the attribution rendered in the Atlas Room.',
    },
    {
      id: 'bundled-fonts', status: 'CLEARED', basis: 'SIL Open Font Licence 1.1',
      notice: 'Complete OFL texts are shipped under public/assets/fonts.',
    }
  ]
};

writeFileSync(join(root, 'ASSET-RIGHTS.json'), `${JSON.stringify(assetRights, null, 2)}\n`, 'utf8');
console.log(`Exported ${coreLicences.length} core image licences and ${generatedFiles.length} generated-art hashes.`);
