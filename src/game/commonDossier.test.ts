import { describe, expect, it } from 'vitest';
import { potentialCommonDossierScore, scoreCommonDossier } from './commonDossier';

describe('Common Dossier scoring', () => {
  it('reduces the available award as exhibits are disclosed', () => {
    expect([1, 2, 3, 4].map(potentialCommonDossierScore)).toEqual([1000, 800, 600, 400]);
  });

  it('awards the current value only for the certified connection', () => {
    expect(scoreCommonDossier(2, true)).toBe(800);
    expect(scoreCommonDossier(2, false)).toBe(0);
  });
});
