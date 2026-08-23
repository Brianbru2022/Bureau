import { BureauAsset, BureauAssetKey } from '../types';

export const BUREAU_ASSET_DEFINITIONS: Record<BureauAssetKey, Omit<BureauAsset, 'consumed'>> = {
  SECOND_OPINION: {
    id: 'SECOND_OPINION',
    name: 'Second Opinion',
    tagline: 'A suspiciously favourable review',
    description: 'Arm this before an individual challenge. A successful score receives a 15% review uplift, capped at +120 points.',
    iconName: 'HelpCircle'
  },
  REFILE: {
    id: 'REFILE',
    name: 'Bureaucratic Refile',
    tagline: 'Reject and reassign',
    description: 'Immediately discard the current challenge and draw a fresh challenge of the same round type. The rejected answer is never revealed.',
    iconName: 'FileSpreadsheet'
  },
  DOUBLE_ENTRY: {
    id: 'DOUBLE_ENTRY',
    name: 'Double Entry Ledger',
    tagline: 'Confidence with accounting consequences',
    description: 'Arm this before an individual challenge. A successful result receives a 75% bonus, capped at +750 points. Failure still earns nothing.',
    iconName: 'TrendingUp'
  },
  INTERCEPT: {
    id: 'INTERCEPT',
    name: 'Admiralty Intercept',
    tagline: 'Administrative theft with paperwork',
    description: 'Arm this asset. The next eligible opponent score is intercepted: 20% is transferred to you before their result is filed.',
    iconName: 'Crosshair'
  },
  INSURANCE: {
    id: 'INSURANCE',
    name: 'Crown Indemnity',
    tagline: 'Failure, but with a claims department',
    description: 'Arm this before an individual challenge. If the attempt scores zero, the Bureau pays 35% of the recorded risk value, or 150 points when no risk value exists.',
    iconName: 'ShieldCheck'
  },
  PRIORITY_ACCESS: {
    id: 'PRIORITY_ACCESS',
    name: 'Priority Access',
    tagline: 'Jump the administrative queue',
    description: 'Use this during your turn to become the starting player in the next round. Petty, procedural and occasionally useful.',
    iconName: 'Key'
  }
};
