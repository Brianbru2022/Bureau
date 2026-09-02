import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('first-assessment onboarding', () => {
  it('is the title-screen default and describes the systems it removes', () => {
    const title = source('src/components/screens/TitleScreen.tsx');
    expect(title).toContain("useState<GameLengthPreset>('FIRST')");
    expect(title).toContain('Simple assessment setup');
    expect(title).toContain('Recommended Multiplayer');
    expect(title).toContain("onStartGame(playerCount, 'QUICK', schedule, 0, 'LIGHT', true, 'MIXED', 'STANDARD')");
  });

  it('opens a guided apparatus demonstration after registration', () => {
    const app = source('src/App.tsx');
    expect(app).toContain("if (matchConfig.preset === 'FIRST')");
    expect(app).toContain("setPhase('ROOM_TRANSITION')");
    expect(app).toContain("matchConfig.guidedMode || matchConfig.preset==='FIRST'");
    expect(app).toContain("type:'FIRST_QUESTION_READY'");
  });

  it('uses a simplified registration and result ceremony', () => {
    const app = source('src/App.tsx');
    expect(app).toContain("firstAssessment={matchConfig.preset==='FIRST'}");
    expect(app).toContain("simplified={matchConfig.preset==='FIRST'}");
  });

  it('distinguishes match length from question familiarity', () => {
    const title = source('src/components/screens/TitleScreen.tsx');
    expect(title).toContain('Match length · number of departments');
    expect(title).toContain('Question familiarity · not match length');
    expect(title).toContain('It never adds departments');
  });
});
