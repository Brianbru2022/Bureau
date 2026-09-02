import { readFileSync } from 'node:fs';

type AssetRights = { groups: Array<{ id:string; status:string }> };
type CommercialIdentity = {
  productTitle:string;
  status:string;
  publisher:{legalName:string|null;address:string|null;jurisdiction:string|null};
  contacts:{support:string|null;privacy:string|null};
  trademark:{status:string;intendedTerritories:string[];classes:string[];adviser:string|null;decision:string|null;decidedOn:string|null};
  legalReview:{status:string;adviser:string|null;reviewedOn:string|null;eulaApproved:boolean;privacyApproved:boolean;supportApproved:boolean};
};
type GeneratedProvenance = { status:string;declaration:Record<string, unknown>;legacyAssets:{status:string};records:Array<{status:string}> };

const read = (file: string) => readFileSync(file, 'utf8');
const failures: string[] = [];
const assetRights = JSON.parse(read('ASSET-RIGHTS.json')) as AssetRights;
const identity = JSON.parse(read('COMMERCIAL-IDENTITY.json')) as CommercialIdentity;
const generatedProvenance = JSON.parse(read('GENERATED-ART-PROVENANCE.json')) as GeneratedProvenance;
const unclearedGroups = assetRights.groups.filter(group => group.status !== 'CLEARED');
if (unclearedGroups.length) failures.push(`Uncleared asset groups: ${unclearedGroups.map(group=>`${group.id} (${group.status})`).join(', ')}`);
if (identity.status !== 'APPROVED') failures.push(`COMMERCIAL-IDENTITY.json status is ${identity.status}, not APPROVED.`);
if (!identity.publisher.legalName || !identity.publisher.address || !identity.publisher.jurisdiction) failures.push('Commercial identity does not contain a complete legal publisher.');
if (!identity.contacts.support || !identity.contacts.privacy) failures.push('Commercial identity does not contain support and privacy contacts.');
if (identity.trademark.status !== 'CLEARED' || !identity.trademark.intendedTerritories.length || !identity.trademark.classes.length || !identity.trademark.adviser || !identity.trademark.decision || !identity.trademark.decidedOn) failures.push('Professional trade mark clearance is incomplete.');
if (identity.legalReview.status !== 'APPROVED' || !identity.legalReview.adviser || !identity.legalReview.reviewedOn || !identity.legalReview.eulaApproved || !identity.legalReview.privacyApproved || !identity.legalReview.supportApproved) failures.push('Professional commercial-policy review is incomplete.');
if (generatedProvenance.status !== 'CLEARED' || generatedProvenance.legacyAssets.status !== 'CLEARED' || generatedProvenance.records.some(record => record.status !== 'CLEARED')) failures.push('Generated-art provenance register is not fully cleared.');

for (const file of ['ARTWORK-PROVENANCE.md', 'TRADEMARK-CLEARANCE.md', 'EULA.md', 'SUPPORT.md']) {
  const content = read(file);
  if (/TO BE COMPLETED|\[LEGAL PUBLISHER|\[SUPPORT CONTACT|\[DATE\]/.test(content)) failures.push(`${file} contains incomplete commercial fields.`);
}

const pkg = JSON.parse(read('package.json')) as { author?:string;build?:{productName?:string} };
if (!pkg.author || /must be named|private project/i.test(pkg.author)) failures.push('package.json does not name the legal publisher.');
if (identity.publisher.legalName && pkg.author !== identity.publisher.legalName) failures.push('package.json author does not match the approved legal publisher.');
if (pkg.build?.productName !== identity.productTitle) failures.push('Commercial identity title does not match package metadata.');

if (failures.length) {
  console.error('Commercial release is correctly blocked:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Commercial rights gate passed.');
