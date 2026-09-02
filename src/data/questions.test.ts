import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RoundType } from '../types';
import { allChallenges } from './questions';

const roundTypes: RoundType[] = [
  'TOP_10', 'PUT_UP_OR_SHUT_UP', 'THE_LIST', 'WHERE_IN_BRITAIN',
  'CLOSEST_WINS', 'RANK_IT', 'IMAGE_REVEAL', 'STOP_THE_SCORE',
  'MISFILED_RECORDS', 'REDACTED_RECORDS', 'COMMON_DOSSIER', 'MISSING_MINUTES',
  'PUBLIC_ENQUIRY', 'CHAIN_OF_COMMAND', 'COMPLAINTS_DESK', 'SEATING_COMMITTEE', 'DISPATCH_BOX'
];

describe('question bank integrity', () => {
  it('contains the complete established and promoted department packs', () => {
    for (const roundType of roundTypes) {
      const expected = 25;
      expect(allChallenges.filter(challenge => challenge.roundType === roundType), roundType).toHaveLength(expected);
    }
    expect(allChallenges).toHaveLength(425);
  });

  it('uses unique stable IDs and supplies editorial metadata', () => {
    expect(new Set(allChallenges.map(challenge => challenge.id)).size).toBe(allChallenges.length);
    for (const challenge of allChallenges) {
      expect(challenge.category.trim(), challenge.id).not.toBe('');
      expect(challenge.prompt.trim(), challenge.id).not.toBe('');
      if (challenge.roundType === 'DISPATCH_BOX') {
        expect(challenge.questions.every(question => question.explanation.trim().length > 0), challenge.id).toBe(true);
        expect(challenge.questions.every(question => question.source.trim().length > 0), challenge.id).toBe(true);
      } else {
        expect(challenge.explanation.trim(), challenge.id).not.toBe('');
        expect(challenge.source.trim(), challenge.id).not.toBe('');
      }
    }
  });

  it('keeps each challenge payload valid for its game mode', () => {
    for (const challenge of allChallenges) {
      switch (challenge.roundType) {
        case 'TOP_10':
          expect(challenge.items, challenge.id).toHaveLength(10);
          expect(challenge.items.map(item => item.rank), challenge.id).toEqual([1,2,3,4,5,6,7,8,9,10]);
          break;
        case 'PUT_UP_OR_SHUT_UP':
        case 'THE_LIST':
          expect(challenge.validAnswers.length, challenge.id).toBeGreaterThanOrEqual(6);
          expect(new Set(challenge.validAnswers.map(item => item.name.toLowerCase())).size, challenge.id).toBe(challenge.validAnswers.length);
          break;
        case 'WHERE_IN_BRITAIN':
          expect(challenge.lat, challenge.id).toBeGreaterThanOrEqual(49);
          expect(challenge.lat, challenge.id).toBeLessThanOrEqual(61);
          expect(challenge.lng, challenge.id).toBeGreaterThanOrEqual(-9);
          expect(challenge.lng, challenge.id).toBeLessThanOrEqual(3);
          break;
        case 'CLOSEST_WINS':
          expect(Number.isFinite(challenge.correctValue), challenge.id).toBe(true);
          expect(challenge.toleranceScale, challenge.id).toBeGreaterThan(0);
          break;
        case 'RANK_IT':
          expect(challenge.items.length, challenge.id).toBeGreaterThanOrEqual(4);
          expect(challenge.items.map(item => item.correctRank).sort((a,b) => a-b), challenge.id)
            .toEqual(challenge.items.map((_, index) => index + 1));
          break;
        case 'IMAGE_REVEAL': {
          expect(challenge.options, challenge.id).toHaveLength(4);
          expect(challenge.options, challenge.id).toContain(challenge.subjectName);
          const assetPath = join(process.cwd(), 'public', challenge.imageUrl.replace(/^\//, ''));
          expect(existsSync(assetPath), challenge.id).toBe(true);
          break;
        }
        case 'STOP_THE_SCORE':
          expect(challenge.options, challenge.id).toHaveLength(4);
          expect(challenge.correctIndex, challenge.id).toBeGreaterThanOrEqual(0);
          expect(challenge.correctIndex, challenge.id).toBeLessThan(challenge.options.length);
          break;
      }
    }
  });
});
