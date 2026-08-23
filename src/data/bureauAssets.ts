import { BureauAsset, BureauAssetKey } from '../types';

export const BUREAU_ASSET_DEFINITIONS: Record<BureauAssetKey, Omit<BureauAsset, 'consumed'>> = {
  SECOND_OPINION: {
    id: 'SECOND_OPINION',
    name: 'Second Opinion',
    tagline: 'Request archival clarification',
    description: 'Receive an additional high-level hint or eliminate 50% of the erroneous choices.',
    iconName: 'HelpCircle'
  },
  REFILE: {
    id: 'REFILE',
    name: 'Bureaucratic Refile',
    tagline: 'Reject and reassign',
    description: 'Discard the current question prompt and draw a freshly stamped alternative dossier.',
    iconName: 'FileSpreadsheet'
  },
  DOUBLE_ENTRY: {
    id: 'DOUBLE_ENTRY',
    name: 'Double Entry Ledger',
    tagline: 'Treasury multiplier',
    description: 'Double the total score acquired from this challenge if answered successfully.',
    iconName: 'TrendingUp'
  },
  INTERCEPT: {
    id: 'INTERCEPT',
    name: 'Admiralty Intercept',
    tagline: 'Pounce on a colleague\'s failure',
    description: 'If the current player fails or passes, you may attempt to seize 50% of the available points.',
    iconName: 'Crosshair'
  },
  INSURANCE: {
    id: 'INSURANCE',
    name: 'Crown Indemnity',
    tagline: 'Loss prevention policy',
    description: 'Protects 50% of your accumulated score or bank in high-risk failure scenarios.',
    iconName: 'ShieldCheck'
  },
  PRIORITY_ACCESS: {
    id: 'PRIORITY_ACCESS',
    name: 'Whitehall Clearance',
    tagline: 'Executive discretion',
    description: 'Grants an immediate +250 point administrative stipend and immunity from mistake penalties.',
    iconName: 'Key'
  }
};
