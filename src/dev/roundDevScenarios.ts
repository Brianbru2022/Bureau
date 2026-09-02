import type {
  RoundDevScenario,
  RoundType,
  RoundVisualState,
} from '../types';

export const ROUND_TYPES: RoundType[] = [
  'WHERE_IN_BRITAIN',
  'TOP_10',
  'PUT_UP_OR_SHUT_UP',
  'THE_LIST',
  'CLOSEST_WINS',
  'RANK_IT',
  'IMAGE_REVEAL',
  'STOP_THE_SCORE',
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

export const ROUND_VISUAL_STATES: RoundVisualState[] = [
  'IDLE',
  'ACTIVE',
  'PROCESSING',
  'ACCEPTED',
  'REJECTED',
  'RESULT',
];

const QUESTIONS: Record<RoundType, { short: string; long: string }> = {
  WHERE_IN_BRITAIN: {
    short: 'Locate Durham',
    long: 'Locate the historic cathedral city whose Norman stronghold stands above a dramatic bend in the River Wear',
  },
  TOP_10: {
    short: 'Largest UK lakes',
    long: 'Name the ten largest natural freshwater lakes in the United Kingdom by surface area, using their commonly accepted names',
  },
  PUT_UP_OR_SHUT_UP: {
    short: 'Name UK national parks',
    long: 'How many UNESCO World Heritage properties located wholly or partly within the United Kingdom can you name without repetition?',
  },
  THE_LIST: {
    short: 'British prime ministers',
    long: 'Name serving British prime ministers from the accession of Queen Elizabeth II to the present day, without repeating a surname',
  },
  CLOSEST_WINS: {
    short: 'Length of the Thames',
    long: 'Estimate the total length in kilometres of the River Thames from its conventional source to the Thames Estuary',
  },
  RANK_IT: {
    short: 'Order these bridges by opening date',
    long: 'Arrange these major British suspension bridges from earliest to latest official opening, using the opening of the complete crossing',
  },
  IMAGE_REVEAL: {
    short: 'Identify the landmark',
    long: 'Identify the British landmark represented in this progressively declassified archival reconnaissance image',
  },
  STOP_THE_SCORE: {
    short: 'Which claim is correct?',
    long: 'Which of these statements about the constitutional and ceremonial offices of the United Kingdom is factually correct?',
  },
  MISFILED_RECORDS: { short:'Find the misfiled record', long:'Identify which British landmark does not share the same verified connection as the other records, then file its correct connection' },
  REDACTED_RECORDS: { short:'Identify the redacted subject', long:'Identify the British person, place or institution from the progressively disclosed factual clues in the controlled record' },
  COMMON_DOSSIER: { short:'Connect the four exhibits', long:'Identify the precise factual connection shared by all four exhibits before requesting another departmental hint' },
  MISSING_MINUTES: { short:'Recall the missing fact', long:'Study the verified British factual register and identify which complete entry was removed after the record was closed' },
  PUBLIC_ENQUIRY: { short:'How likely is this claim?', long:'Consider the British general-knowledge claim, then submit a calibrated probability that accurately reflects your factual confidence' },
  CHAIN_OF_COMMAND: { short:'Complete the chronology', long:'Select the four factual records that continue the historical sequence in the correct chronological order while excluding two decoys' },
  COMPLAINTS_DESK: { short:'Find the false fact', long:'Inspect five statements about a British subject, identify the single factual inaccuracy and calibrate your confidence in the objection' },
  SEATING_COMMITTEE: { short:'Order the records', long:'Arrange five British people, works, institutions or events into the requested factual chronology from earliest to latest' },
  DISPATCH_BOX: { short:'Answer five rapid briefs', long:'Complete five independent British general-knowledge briefs while the continuously calculated value of each response remains available' },
};

export const ROUND_DEV_SCENARIOS: RoundDevScenario[] = ROUND_TYPES.flatMap(roundType =>
  ROUND_VISUAL_STATES.flatMap(visualState =>
    ([1, 2, 4] as const).flatMap(playerCount =>
      (['SHORT', 'LONG'] as const).map(questionLength => ({
        id: `${roundType}-${visualState}-${playerCount}-${questionLength}`,
        roundType,
        visualState,
        playerCount,
        questionLength,
        question: QUESTIONS[roundType][questionLength.toLowerCase() as 'short' | 'long'],
      })),
    ),
  ),
);
