import type { RoundType } from '../types';

export interface ControlDemonstration {
  action: string;
  steps: readonly [string, string, string];
}

export const CONTROL_DEMONSTRATIONS: Record<RoundType, ControlDemonstration> = {
  WHERE_IN_BRITAIN: { action: 'Plot a location', steps: ['Move the plotting pin', 'Check the chosen point', 'Lock the coordinates'] },
  TOP_10: { action: 'Release a shutter', steps: ['Say and enter one answer', 'Release the shutter', 'Lose a life only if rejected'] },
  PUT_UP_OR_SHUT_UP: { action: 'Make a claim', steps: ['Raise the claim or pass', 'Highest bidder takes the contract', 'Prove every claimed answer'] },
  THE_LIST: { action: 'Build a safe list', steps: ['Enter another valid item', 'Choose bank or push', 'A rejected push loses the unbanked run'] },
  CLOSEST_WINS: { action: 'Seal an estimate', steps: ['Enter a private estimate', 'Seal the capsule', 'Compare after everyone has filed'] },
  RANK_IT: { action: 'Order the register', steps: ['Select or drag a card', 'Place it in the requested order', 'Certify the complete sequence'] },
  IMAGE_REVEAL: { action: 'Control the iris', steps: ['Inspect the visible image', 'Answer now or open the iris', 'Earlier correct answers retain more'] },
  STOP_THE_SCORE: { action: 'Set the stake', steps: ['Stop the moving gauge', 'Confirm the selected stake', 'Answer to bank that exact value'] },
  MISFILED_RECORDS: { action: 'Correct a filing', steps: ['Select the odd record', 'Choose where it belongs', 'Certify both decisions together'] },
  REDACTED_RECORDS: { action: 'Open a clue', steps: ['Read the current clue', 'Answer or reveal another', 'Extra clues reduce the available score'] },
  COMMON_DOSSIER: { action: 'Find the connection', steps: ['Inspect the revealed exhibits', 'Request a hint or answer', 'State the precise common connection'] },
  MISSING_MINUTES: { action: 'Recall the register', steps: ['Study the complete register', 'Close it when ready', 'Identify the missing record'] },
  PUBLIC_ENQUIRY: { action: 'File confidence', steps: ['Judge the factual claim', 'Set a private confidence level', 'Reveal after every juror has filed'] },
  CHAIN_OF_COMMAND: { action: 'Complete the chronology', steps: ['Inspect the established sequence', 'Choose the records that continue it', 'Order them and reject the decoys'] },
  COMPLAINTS_DESK: { action: 'Raise an objection', steps: ['Find the inaccurate statement', 'Set how certain you are', 'File one final complaint'] },
  SEATING_COMMITTEE: { action: 'Seat the records', steps: ['Read the required direction', 'Move records into position', 'Certify the complete order'] },
  DISPATCH_BOX: { action: 'Clear the briefs', steps: ['Read one rapid brief', 'Choose its answer', 'File it before the value falls'] }
};

