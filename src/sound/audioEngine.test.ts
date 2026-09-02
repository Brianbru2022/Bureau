import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioEngine, DEPARTMENT_SOUND_FAMILIES } from './audioEngine';

afterEach(() => vi.unstubAllGlobals());

describe('department sound families', () => {
  it('provides a distinct mechanical signature for every department', () => {
    const profiles = Object.entries(DEPARTMENT_SOUND_FAMILIES);
    expect(profiles).toHaveLength(17);
    expect(new Set(profiles.map(([, profile]) => `${profile.wave}:${profile.base}:${profile.interval}`)).size).toBe(17);
    expect(new Set(profiles.map(([, profile]) => profile.motif)).size).toBe(8);
    expect(profiles.every(([,profile])=>profile.noiseCentre>=400&&profile.noiseCentre<=3000&&profile.clicks>=1&&profile.clicks<=5)).toBe(true);
  });

  it('keeps every cue optional when browser audio is unavailable', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
      AudioContext: class { constructor() { throw new Error('Audio device unavailable'); } },
    });
    const engine = new AudioEngine();
    expect(() => {
      for (const roundType of Object.keys(DEPARTMENT_SOUND_FAMILIES) as Array<keyof typeof DEPARTMENT_SOUND_FAMILIES>) {
        engine.playDepartmentCue(roundType, 'PROCESSING');
        engine.playDepartmentCue(roundType, 'RESULT');
      }
    }).not.toThrow();
    engine.setMuted(true);
    expect(engine.getSettings().muted).toBe(true);
  });
});
