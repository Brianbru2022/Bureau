import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APPARATUS_TREATMENT_PROFILES } from '../components/common/ApparatusStateTreatment';
import { ROUND_TYPES } from '../dev/roundDevScenarios';

describe('apparatus outcome treatments', () => {
  it('assigns a mechanical outcome profile to every department', () => {
    expect(Object.keys(APPARATUS_TREATMENT_PROFILES).sort()).toEqual([...ROUND_TYPES].sort());
    expect(new Set(Object.values(APPARATUS_TREATMENT_PROFILES).map(profile => profile.mechanism)).size).toBeGreaterThanOrEqual(8);
    for (const [roundType, profile] of Object.entries(APPARATUS_TREATMENT_PROFILES)) {
      expect(profile.anchorX, `${roundType} x`).toBeGreaterThan(0);
      expect(profile.anchorX, `${roundType} x`).toBeLessThan(1536);
      expect(profile.anchorY, `${roundType} y`).toBeGreaterThan(0);
      expect(profile.anchorY, `${roundType} y`).toBeLessThan(1024);
      expect(profile.accent, `${roundType} accent`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('keeps each visible outcome mechanically distinct and text-backed', () => {
    const treatment = readFileSync(join(process.cwd(), 'src/components/common/ApparatusStateTreatment.tsx'), 'utf8');
    const frame = readFileSync(join(process.cwd(), 'src/components/common/ApparatusFrame.tsx'), 'utf8');
    const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
    for (const state of ['processing', 'accepted', 'rejected', 'result', 'eliminated']) {
      expect(css, `${state} visual treatment`).toContain(`data-treatment="${state}"`);
    }
    expect(treatment).toContain('data-mechanism={profile.mechanism.toLowerCase()}');
    expect(frame).toContain('Candidate eliminated; remaining candidates continue');
    expect(frame).toContain('role="status" aria-live="polite"');
  });
});
