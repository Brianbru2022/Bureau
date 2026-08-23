import type { BureauAssetKey } from '../types';

const G = '/assets/generated';

export const ROOM_ART: Record<string, string> = {
  'Department of Ordnance & Cartography': `${G}/atlas-room.jpg`,
  'Central Archival Repository': `${G}/hall-of-records.jpg`,
  'The High Bidding Chamber': `${G}/hall-of-records.jpg`,
  'The Escalation Vault': `${G}/archive.jpg`,
  'The Statistics Office': `${G}/statistics-office.jpg`,
  'Sequential Registry Division': `${G}/archive.jpg`,
  'Visual Reconnaissance Ward': `${G}/visual-gallery.jpg`,
  'Confidence & Risk Chamber': `${G}/risk-chamber.jpg`,
  'Grand Hall': `${G}/grand-hall.jpg`,
  'Final Chamber': `${G}/final-chamber.jpg`
};

export const EVENT_ART = {
  RED_BUTTON: `${G}/red-button-office.jpg`,
  FILE_CABINET: `${G}/file-cabinet.jpg`,
  THREE_FILES: `${G}/three-files.jpg`,
  PODIUM: `${G}/awards-hall.jpg`
} as const;

export const PORTRAIT_ART = Array.from({ length: 8 }, (_, i) => `${G}/candidate-${i + 1}.jpg`);

export const ASSET_ART: Record<BureauAssetKey, string> = {
  SECOND_OPINION: `${G}/second-opinion.jpg`,
  REFILE: `${G}/refile.jpg`,
  DOUBLE_ENTRY: `${G}/double-entry.jpg`,
  INTERCEPT: `${G}/intercept.jpg`,
  INSURANCE: `${G}/insurance.jpg`,
  PRIORITY_ACCESS: `${G}/priority-access.jpg`
};

export const DIRECTIVE_ART: Record<string, string> = {
  'dir-gambler': `${G}/gambler.jpg`,
  'dir-cartographer': `${G}/cartographer.jpg`,
  'dir-opportunist': `${G}/opportunist.jpg`,
  'dir-generalist': `${G}/generalist.jpg`,
  'dir-specialist': `${G}/specialist.jpg`,
  'dir-survivor': `${G}/survivor.jpg`
};

export const COMMENDATION_ART: Record<string, string> = {
  'comm-human-sat-nav': `${G}/human-sat-nav.jpg`,
  'comm-walking-encyclopaedia': `${G}/walking-encyclopaedia.jpg`,
  'comm-confidently-incorrect': `${G}/confidently-incorrect.jpg`,
  'comm-comeback-king': `${G}/spectacular-recovery.jpg`,
  'comm-absolute-chaos': `${G}/bureaucratic-survivor.jpg`,
  'comm-generalist': `${G}/unpleasantly-well-rounded.jpg`,
  'comm-specialist': `${G}/disturbingly-specific.jpg`
};
