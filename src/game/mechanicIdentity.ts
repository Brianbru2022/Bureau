import type { RoundType } from '../types';

export type MechanicFamily = 'ORDERING' | 'REVEAL' | 'OPEN_REGISTER';

export interface MechanicIdentity {
  family: MechanicFamily;
  doctrine: string;
  action: string;
  pressure: string;
  finish: string;
  diagram: 'FREE_SORT' | 'ADJACENT_SWAP' | 'BRANCH_ROUTE' | 'OPTICAL' | 'DISCLOSURE' | 'MEMORY' | 'LIVES' | 'AUCTION' | 'BANK';
}

export const MECHANIC_IDENTITIES: Partial<Record<RoundType, MechanicIdentity>> = {
  RANK_IT: { family: 'ORDERING', doctrine: 'Free sorting', action: 'Move any plaque', pressure: 'Position accuracy', finish: 'Lock one final order', diagram: 'FREE_SORT' },
  SEATING_COMMITTEE: { family: 'ORDERING', doctrine: 'Evidence chronology', action: 'Swap neighbours', pressure: 'Clues and elapsed time', finish: 'Certify all five seats', diagram: 'ADJACENT_SWAP' },
  CHAIN_OF_COMMAND: { family: 'ORDERING', doctrine: 'Route construction', action: 'Choose four of six', pressure: 'Two decoys; clock continues', finish: 'Retry until certified', diagram: 'BRANCH_ROUTE' },
  IMAGE_REVEAL: { family: 'REVEAL', doctrine: 'Visual recognition', action: 'Open iris or identify', pressure: 'Each aperture costs value', finish: 'Select the pictured subject', diagram: 'OPTICAL' },
  REDACTED_RECORDS: { family: 'REVEAL', doctrine: 'Written disclosure', action: 'Release a clue or identify', pressure: 'Each line costs value', finish: 'Identification seals the file', diagram: 'DISCLOSURE' },
  MISSING_MINUTES: { family: 'REVEAL', doctrine: 'Memory examination', action: 'Study then close record', pressure: 'Viewing time changes value', finish: 'Recall the removed fact', diagram: 'MEMORY' },
  TOP_10: { family: 'OPEN_REGISTER', doctrine: 'Shared survival', action: 'Alternate one entry', pressure: 'Three lives per candidate', finish: 'Cabinet clears or lives expire', diagram: 'LIVES' },
  PUT_UP_OR_SHUT_UP: { family: 'OPEN_REGISTER', doctrine: 'Competitive contract', action: 'Raise the claim or pass', pressure: 'One error breaks the contract', finish: 'Winner fulfils exact claim', diagram: 'AUCTION' },
  THE_LIST: { family: 'OPEN_REGISTER', doctrine: 'Solo pressure run', action: 'Name, then bank or push', pressure: 'One rejection loses the run', finish: 'Bank before the rupture', diagram: 'BANK' },
};
