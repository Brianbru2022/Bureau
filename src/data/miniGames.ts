import type { BureauAssetKey } from '../types';

export type MiniGameType = 'RED_BUTTON' | 'FILE_CABINET' | 'HIGHER_LOWER' | 'THREE_FILES';

export interface HigherLowerPrompt {
  id: string;
  prompt: string;
  referenceLabel: string;
  referenceValue: number;
  targetLabel: string;
  targetValue: number;
  unit: string;
  reward: number;
  explanation: string;
}

export const MINI_GAME_TYPES: MiniGameType[] = [
  'RED_BUTTON',
  'FILE_CABINET',
  'HIGHER_LOWER',
  'THREE_FILES'
];

export const MINI_GAME_ASSET_POOL: BureauAssetKey[] = [
  'SECOND_OPINION',
  'REFILE',
  'DOUBLE_ENTRY',
  'INTERCEPT',
  'INSURANCE',
  'PRIORITY_ACCESS'
];

export const HIGHER_LOWER_PROMPTS: HigherLowerPrompt[] = [
  {
    id: 'hl-ben-nevis-v-snowdon',
    prompt: 'Which is higher?',
    referenceLabel: 'Yr Wyddfa / Snowdon',
    referenceValue: 1085,
    targetLabel: 'Ben Nevis',
    targetValue: 1345,
    unit: 'metres',
    reward: 214,
    explanation: 'Ben Nevis reaches 1,345 m; Yr Wyddfa reaches 1,085 m.'
  },
  {
    id: 'hl-thames-v-severn',
    prompt: 'Is the River Severn longer or shorter than the Thames?',
    referenceLabel: 'River Thames',
    referenceValue: 346,
    targetLabel: 'River Severn',
    targetValue: 354,
    unit: 'km',
    reward: 287,
    explanation: 'The Severn is roughly 354 km long, narrowly exceeding the Thames at about 346 km.'
  },
  {
    id: 'hl-shard-blackpool',
    prompt: 'Is The Shard taller or shorter than Blackpool Tower?',
    referenceLabel: 'Blackpool Tower',
    referenceValue: 158,
    targetLabel: 'The Shard',
    targetValue: 310,
    unit: 'metres',
    reward: 198,
    explanation: 'The Shard is about 310 m tall; Blackpool Tower is about 158 m.'
  },
  {
    id: 'hl-loch-ness-windermere',
    prompt: 'Is Loch Ness deeper or shallower than Windermere?',
    referenceLabel: 'Windermere',
    referenceValue: 67,
    targetLabel: 'Loch Ness',
    targetValue: 230,
    unit: 'metres deep',
    reward: 236,
    explanation: 'Loch Ness reaches about 230 m deep; Windermere is about 67 m at its deepest.'
  },
  {
    id: 'hl-edinburgh-glasgow-lat',
    prompt: 'Is Edinburgh further north or further south than Glasgow?',
    referenceLabel: 'Glasgow latitude',
    referenceValue: 55.8642,
    targetLabel: 'Edinburgh latitude',
    targetValue: 55.9533,
    unit: 'degrees north',
    reward: 331,
    explanation: 'Edinburgh sits slightly further north than Glasgow, despite what many mental maps insist.'
  },
  {
    id: 'hl-balmoral-windsor',
    prompt: 'Is Balmoral Castle further north or further south than Windsor Castle?',
    referenceLabel: 'Windsor Castle latitude',
    referenceValue: 51.4839,
    targetLabel: 'Balmoral Castle latitude',
    targetValue: 57.0404,
    unit: 'degrees north',
    reward: 176,
    explanation: 'Balmoral is in Aberdeenshire and is considerably further north than Windsor.'
  }
];

export const randomAsset = (): BureauAssetKey =>
  MINI_GAME_ASSET_POOL[Math.floor(Math.random() * MINI_GAME_ASSET_POOL.length)];
