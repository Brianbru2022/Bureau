import type {
  RoundType,
  RoundVisualState,
  VisualAssetManifest,
  VisualAssetVariant,
} from '../types';
import { CHAIN_OF_COMMAND_ART, COMMON_DOSSIER_ART, COMPLAINTS_DESK_ART, DISPATCH_BOX_ART, MISFILED_RECORDS_ART, MISSING_MINUTES_ART, PUBLIC_ENQUIRY_ART, REDACTED_RECORDS_ART, SEATING_COMMITTEE_ART } from './promotedVisualAssets';

const apparatus = (name: string, attachments: VisualAssetVariant['attachments'], version = 'v4'): VisualAssetVariant => ({
  desktop: `/assets/generated-v4/${name}-${version}.webp`,
  compact: `/assets/generated-v4/${name}-${version}-small.webp`,
  sourceFile: `assets/source-art/apparatus-v4/${name}-${version}.png`,
  alt: '',
  attachments,
});

const everyState = (
  active: VisualAssetVariant,
  result = active,
): Partial<Record<RoundVisualState, VisualAssetVariant>> => ({
  IDLE: {...active, stateTreatment: 'IDLE'},
  ACTIVE: {...active, stateTreatment: 'ACTIVE'},
  PROCESSING: {...active, stateTreatment: 'PROCESSING'},
  ACCEPTED: {...result, stateTreatment: 'ACCEPTED'},
  REJECTED: {...result, stateTreatment: 'REJECTED'},
  RESULT: {...result, stateTreatment: 'RESULT'},
});

export const VISUAL_ASSET_MANIFEST: VisualAssetManifest = {
  WHERE_IN_BRITAIN: everyState(apparatus('map-plotting-console', [
    {id:'survey-lamp',xPercent:10,yPercent:12,kind:'LAMP'},
    {id:'route-lamp',xPercent:88,yPercent:12,kind:'LAMP'},
    {id:'plotting-needle',xPercent:88,yPercent:48,kind:'NEEDLE'},
    {id:'map-platen',xPercent:46,yPercent:52,widthPercent:68,heightPercent:72,kind:'CONTROL_APERTURE'},
    {id:'navigation-console',xPercent:88,yPercent:55,widthPercent:18,heightPercent:62,kind:'CONTROL_APERTURE'},
  ], 'v6')),
  TOP_10: everyState(apparatus('top10-shutter-cabinet', [
    {id:'archive-lamp',xPercent:50,yPercent:9,kind:'LAMP'},
    {id:'shutter-bank',xPercent:47,yPercent:52,kind:'SHUTTER'},
    {id:'shutter-platen',xPercent:43,yPercent:54,widthPercent:66,heightPercent:72,kind:'CONTROL_APERTURE'},
    {id:'life-console',xPercent:87,yPercent:50,widthPercent:20,heightPercent:58,kind:'CONTROL_APERTURE'},
  ])),
  PUT_UP_OR_SHUT_UP: everyState(apparatus('bidding-claim-console', [
    {id:'claim-lamp',xPercent:19,yPercent:13,kind:'LAMP'},
    {id:'holder-lamp',xPercent:78,yPercent:13,kind:'LAMP'},
    {id:'contract-needle',xPercent:76,yPercent:48,kind:'NEEDLE'},
    {id:'contract-feed',xPercent:76,yPercent:69,kind:'PAPER_FEED'},
    {id:'claim-ladder',xPercent:36,yPercent:53,widthPercent:58,heightPercent:68,kind:'CONTROL_APERTURE'},
    {id:'contract-controls',xPercent:82,yPercent:54,widthPercent:24,heightPercent:64,kind:'CONTROL_APERTURE'},
  ], 'v5')),
  THE_LIST: everyState(apparatus('list-pressure-vessel', [
    {id:'pressure-lamp',xPercent:11,yPercent:14,kind:'LAMP'},
    {id:'pressure-needle',xPercent:50,yPercent:52,kind:'NEEDLE'},
    {id:'answer-feed',xPercent:79,yPercent:64,kind:'PAPER_FEED'},
    {id:'pressure-chamber',xPercent:37,yPercent:53,widthPercent:60,heightPercent:70,kind:'CONTROL_APERTURE'},
    {id:'filing-controls',xPercent:82,yPercent:55,widthPercent:23,heightPercent:62,kind:'CONTROL_APERTURE'},
  ])),
  CLOSEST_WINS: everyState(apparatus('closest-capsule-engine', [
    {id:'metric-left',xPercent:30,yPercent:14,kind:'LAMP'},
    {id:'metric-right',xPercent:70,yPercent:14,kind:'LAMP'},
    {id:'comparison-needle',xPercent:50,yPercent:55,kind:'NEEDLE'},
    {id:'capsule-bank',xPercent:37,yPercent:52,widthPercent:61,heightPercent:66,kind:'CONTROL_APERTURE'},
    {id:'estimate-intake',xPercent:82,yPercent:54,widthPercent:23,heightPercent:60,kind:'CONTROL_APERTURE'},
  ])),
  RANK_IT: everyState(apparatus('rank-sorting-rail', [
    {id:'rail-left',xPercent:19,yPercent:18,kind:'LAMP'},
    {id:'rail-right',xPercent:81,yPercent:18,kind:'LAMP'},
    {id:'dispatch-feed',xPercent:50,yPercent:84,kind:'PAPER_FEED'},
    {id:'sorting-rail',xPercent:38,yPercent:53,widthPercent:64,heightPercent:70,kind:'CONTROL_APERTURE'},
    {id:'rail-controls',xPercent:83,yPercent:55,widthPercent:22,heightPercent:62,kind:'CONTROL_APERTURE'},
  ])),
  IMAGE_REVEAL: everyState(apparatus('image-optical-iris', [
    {id:'optic-left',xPercent:24,yPercent:11,kind:'LAMP'},
    {id:'optic-right',xPercent:76,yPercent:11,kind:'LAMP'},
    {id:'focus-needle',xPercent:50,yPercent:58,kind:'NEEDLE'},
    {id:'optical-platen',xPercent:37,yPercent:52,widthPercent:61,heightPercent:72,kind:'CONTROL_APERTURE'},
    {id:'iris-controls',xPercent:82,yPercent:55,widthPercent:23,heightPercent:62,kind:'CONTROL_APERTURE'},
  ])),
  STOP_THE_SCORE: everyState(apparatus('stop-volatility-engine', [
    {id:'risk-left',xPercent:28,yPercent:13,kind:'LAMP'},
    {id:'risk-right',xPercent:72,yPercent:13,kind:'LAMP'},
    {id:'risk-needle',xPercent:50,yPercent:59,kind:'NEEDLE'},
    {id:'result-feed',xPercent:80,yPercent:72,kind:'PAPER_FEED'},
    {id:'volatility-gauge',xPercent:37,yPercent:52,widthPercent:60,heightPercent:70,kind:'CONTROL_APERTURE'},
    {id:'stake-console',xPercent:82,yPercent:55,widthPercent:23,heightPercent:62,kind:'CONTROL_APERTURE'},
  ])),
  MISFILED_RECORDS: everyState(MISFILED_RECORDS_ART),
  REDACTED_RECORDS: everyState(REDACTED_RECORDS_ART),
  COMMON_DOSSIER: everyState(COMMON_DOSSIER_ART),
  MISSING_MINUTES: everyState(MISSING_MINUTES_ART),
  PUBLIC_ENQUIRY: everyState(PUBLIC_ENQUIRY_ART),
  CHAIN_OF_COMMAND: everyState(CHAIN_OF_COMMAND_ART),
  COMPLAINTS_DESK: everyState(COMPLAINTS_DESK_ART),
  SEATING_COMMITTEE: everyState(SEATING_COMMITTEE_ART),
  DISPATCH_BOX: everyState(DISPATCH_BOX_ART),
};

export const INSTRUMENT_ROUND: Record<string, RoundType> = {
  'MAP TABLE': 'WHERE_IN_BRITAIN',
  'FLIP REGISTER': 'TOP_10',
  'ARCHIVE OPEN': 'TOP_10',
  'BID CONSOLE': 'PUT_UP_OR_SHUT_UP',
  'CONTRACT RESULT': 'PUT_UP_OR_SHUT_UP',
  'PRESSURE DRUM': 'THE_LIST',
  CALIBRATOR: 'CLOSEST_WINS',
  'METRIC ENGINE': 'CLOSEST_WINS',
  'ORDER RAIL': 'RANK_IT',
  'SORTER LOCKED': 'RANK_IT',
  'OPTICAL IRIS': 'IMAGE_REVEAL',
  'VOLATILITY GAUGE': 'STOP_THE_SCORE',
  'ARCHIVE SORTER': 'MISFILED_RECORDS',
  'REDACTION DESK': 'REDACTED_RECORDS',
  'CORRELATION ENGINE': 'COMMON_DOSSIER',
  'FACT RECORDER': 'MISSING_MINUTES',
  'ENQUIRY LECTERN': 'PUBLIC_ENQUIRY',
  'KNOWLEDGE RELAY': 'CHAIN_OF_COMMAND',
  'COMPLAINTS DESK': 'COMPLAINTS_DESK',
  'ORDERING COMMITTEE': 'SEATING_COMMITTEE',
  'DISPATCH BOX': 'DISPATCH_BOX',
};

export const getApparatusArt = (
  instrumentLabel: string | undefined,
  state: RoundVisualState,
): VisualAssetVariant | undefined => {
  if (!instrumentLabel) return undefined;
  const roundType = INSTRUMENT_ROUND[instrumentLabel];
  return roundType ? VISUAL_ASSET_MANIFEST[roundType][state] : undefined;
};

export const getApparatusRound = (instrumentLabel: string | undefined): RoundType | undefined =>
  instrumentLabel ? INSTRUMENT_ROUND[instrumentLabel] : undefined;
