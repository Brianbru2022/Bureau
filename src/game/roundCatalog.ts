import type { RoundConfig, RoundType } from '../types';

export type RoundDefinition = Omit<RoundConfig, 'roundNumber' | 'challenge'>;

export const PROMOTED_ROUND_TYPES: RoundType[] = [
  'MISFILED_RECORDS',
  'REDACTED_RECORDS',
  'COMMON_DOSSIER',
  'MISSING_MINUTES',
  'PUBLIC_ENQUIRY',
  'CHAIN_OF_COMMAND',
  'COMPLAINTS_DESK',
  'SEATING_COMMITTEE',
  'DISPATCH_BOX',
];

export const ROUND_DEFINITIONS: RoundDefinition[] = [
  { type: 'WHERE_IN_BRITAIN', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Where in the UK?', roomName: 'Department of Ordnance & Cartography', roomTheme: 'Real geography. No labels. No excuses.' },
  { type: 'TOP_10', participationMode: 'SHARED_ROTATION', name: 'Hall of Records: Top 10', roomName: 'Central Archival Repository', roomTheme: 'Name entries from the official records. Obscurity is financially rewarded.' },
  { type: 'PUT_UP_OR_SHUT_UP', participationMode: 'SHARED_ROTATION', name: 'Put Up or Shut Up', roomName: 'The High Bidding Chamber', roomTheme: 'Make a claim, then discover whether confidence was justified.' },
  { type: 'THE_LIST', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'The List', roomName: 'The Escalation Vault', roomTheme: 'Bank safely or continue until knowledge runs out before nerve does.' },
  { type: 'CLOSEST_WINS', participationMode: 'HIDDEN_SEQUENTIAL', name: 'Closest Wins', roomName: 'The Statistics Office', roomTheme: 'Confidential estimates. Reality will eventually be consulted.' },
  { type: 'RANK_IT', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Rank It', roomName: 'Sequential Registry Division', roomTheme: 'Put things in the correct order, which is apparently harder than it sounds.' },
  { type: 'IMAGE_REVEAL', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Image Reveal', roomName: 'Visual Reconnaissance Ward', roomTheme: 'Identify the subject before the machine has to make it embarrassingly obvious.' },
  { type: 'STOP_THE_SCORE', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Stop The Score', roomName: 'Confidence & Risk Chamber', roomTheme: 'Choose exactly how expensive your confidence is about to become.' },
  { type: 'MISFILED_RECORDS', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Misfiled Records', roomName: 'Department of Archival Corrections', roomTheme: 'Find the record that does not belong, then identify the correct connection.' },
  { type: 'REDACTED_RECORDS', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Redacted Records', roomName: 'Controlled Disclosure Office', roomTheme: 'Identify the subject before the clues become administratively obvious.' },
  { type: 'COMMON_DOSSIER', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Common Dossier', roomName: 'Office of Commonalities', roomTheme: 'Connect four exhibits before the paperwork connects them for you.' },
  { type: 'MISSING_MINUTES', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Missing Minutes', roomName: 'Committee Secretariat', roomTheme: 'Study the factual record, then identify what the Bureau removed.' },
  { type: 'PUBLIC_ENQUIRY', participationMode: 'SHARED_ROTATION', name: 'Public Enquiry', roomName: 'Office of Public Confidence', roomTheme: 'A factual claim, a witness and a jury with calibrated certainty.' },
  { type: 'CHAIN_OF_COMMAND', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Chain of Command', roomName: 'Directorate of Ordered Knowledge', roomTheme: 'Route factual records through the correct chronology.' },
  { type: 'COMPLAINTS_DESK', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'The Complaints Desk', roomName: 'Office of Public Objections', roomTheme: 'Find the inaccurate statement and state exactly how sure you are.' },
  { type: 'SEATING_COMMITTEE', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'The Seating Committee', roomName: 'Directorate of Historical Precedence', roomTheme: 'Put real people, works and events into their proper order.' },
  { type: 'DISPATCH_BOX', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'The Dispatch Box', roomName: 'Parliamentary Correspondence Office', roomTheme: 'Five rapid general-knowledge briefs, each losing value by the second.' },
];

export const ROUND_LABELS = Object.fromEntries(
  ROUND_DEFINITIONS.map(definition => [definition.type, definition.name]),
) as Record<RoundType, string>;

export const roundDefinitionFor = (type: RoundType): RoundDefinition =>
  ROUND_DEFINITIONS.find(definition => definition.type === type) ?? ROUND_DEFINITIONS[0];

