import type { BureauAssetKey } from '../types';

export const ROOM_ART: Record<string, string> = {
  'Department of Ordnance & Cartography': '/assets/generated/rooms/atlas-room.jpg',
  'Central Archival Repository': '/assets/generated/rooms/hall-of-records.jpg',
  'The High Bidding Chamber': '/assets/generated/rooms/hall-of-records.jpg',
  'The Escalation Vault': '/assets/generated/rooms/archive.jpg',
  'The Statistics Office': '/assets/generated/rooms/statistics-office.jpg',
  'Sequential Registry Division': '/assets/generated/rooms/archive.jpg',
  'Visual Reconnaissance Ward': '/assets/generated/rooms/visual-gallery.jpg',
  'Confidence & Risk Chamber': '/assets/generated/rooms/risk-chamber.jpg',
  'Grand Hall': '/assets/generated/rooms/grand-hall.jpg',
  'Final Chamber': '/assets/generated/rooms/final-chamber.jpg'
};

export const EVENT_ART = {
  RED_BUTTON: '/assets/generated/events/red-button-office.jpg',
  FILE_CABINET: '/assets/generated/events/file-cabinet.jpg',
  THREE_FILES: '/assets/generated/events/three-files.jpg',
  PODIUM: '/assets/generated/events/awards-hall.jpg'
} as const;

export const PORTRAIT_ART = Array.from({ length: 8 }, (_, i) => `/assets/generated/portraits/candidate-${i + 1}.jpg`);

export const ASSET_ART: Record<BureauAssetKey, string> = {
  SECOND_OPINION: '/assets/generated/assets/second-opinion.jpg',
  REFILE: '/assets/generated/assets/refile.jpg',
  DOUBLE_ENTRY: '/assets/generated/assets/double-entry.jpg',
  INTERCEPT: '/assets/generated/assets/intercept.jpg',
  INSURANCE: '/assets/generated/assets/insurance.jpg',
  PRIORITY_ACCESS: '/assets/generated/assets/priority-access.jpg'
};

export const DIRECTIVE_ART: Record<string, string> = {
  'dir-gambler': '/assets/generated/directives/gambler.jpg',
  'dir-cartographer': '/assets/generated/directives/cartographer.jpg',
  'dir-opportunist': '/assets/generated/directives/opportunist.jpg',
  'dir-generalist': '/assets/generated/directives/generalist.jpg',
  'dir-specialist': '/assets/generated/directives/specialist.jpg',
  'dir-survivor': '/assets/generated/directives/survivor.jpg'
};

export const COMMENDATION_ART: Record<string, string> = {
  'comm-human-sat-nav': '/assets/generated/commendations/human-sat-nav.jpg',
  'comm-walking-encyclopaedia': '/assets/generated/commendations/walking-encyclopaedia.jpg',
  'comm-confidently-incorrect': '/assets/generated/commendations/confidently-incorrect.jpg',
  'comm-comeback-king': '/assets/generated/commendations/spectacular-recovery.jpg',
  'comm-absolute-chaos': '/assets/generated/commendations/bureaucratic-survivor.jpg',
  'comm-generalist': '/assets/generated/commendations/unpleasantly-well-rounded.jpg',
  'comm-specialist': '/assets/generated/commendations/disturbingly-specific.jpg'
};
