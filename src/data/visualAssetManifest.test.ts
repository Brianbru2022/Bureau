import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROUND_DEV_SCENARIOS, ROUND_TYPES, ROUND_VISUAL_STATES } from '../dev/roundDevScenarios';
import { VISUAL_ASSET_MANIFEST } from './visualAssetManifest';
import { INSTRUMENT_ROUND } from './visualAssetManifest';
import { APPARATUS_CONTROL_LABELS } from '../components/common/ApparatusFrame';

const PROMOTED_ROUNDS = [
  'MISFILED_RECORDS', 'REDACTED_RECORDS', 'COMMON_DOSSIER', 'MISSING_MINUTES',
  'PUBLIC_ENQUIRY', 'CHAIN_OF_COMMAND', 'COMPLAINTS_DESK', 'SEATING_COMMITTEE', 'DISPATCH_BOX',
] as const;

const webpDimensions = (path: string) => {
  const bytes = readFileSync(path);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8X') return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`${path} is not a supported WebP file`);
};

const webpHasAlpha = (path: string) => {
  const bytes = readFileSync(path);
  const chunk = bytes.toString('ascii', 12, 16);
  return chunk === 'VP8L' || (chunk === 'VP8X' && (bytes[20] & 0x10) !== 0) || bytes.includes(Buffer.from('ALPH'));
};

describe('visual asset manifest', () => {
  it('provides responsive artwork for every department and visual state', () => {
    for (const roundType of ROUND_TYPES) {
      for (const state of ROUND_VISUAL_STATES) {
        const asset = VISUAL_ASSET_MANIFEST[roundType][state];
        expect(asset, `${roundType} ${state}`).toBeDefined();
        for (const [source, expected] of [[asset!.desktop, {width:1536,height:1024}], [asset!.compact, {width:768,height:512}]] as const) {
          const path = join(process.cwd(), 'public', source.replace(/^\//, ''));
          expect(existsSync(path), path).toBe(true);
          expect(statSync(path).size, `${path} exceeds the 400 KB artwork budget`).toBeLessThan(400_000);
          expect(webpDimensions(path), path).toEqual(expected);
        }
        if (asset!.overlay) for (const source of [asset!.overlay.desktop, asset!.overlay.compact]) {
          const path = join(process.cwd(), 'public', source.replace(/^\//, ''));
          expect(webpHasAlpha(path), `${path} must contain real alpha transparency`).toBe(true);
        }
      }
    }
  });

  it('assigns an explicit functional treatment to every apparatus state', () => {
    for (const roundType of ROUND_TYPES) {
      for (const state of ROUND_VISUAL_STATES) {
        expect(VISUAL_ASSET_MANIFEST[roundType][state]?.stateTreatment, `${roundType} ${state}`).toBe(state);
      }
    }
  });

  it('gives every promoted department a functional machinery console', () => {
    expect(PROMOTED_ROUNDS).toHaveLength(9);
    for (const roundType of PROMOTED_ROUNDS) {
      const attachments = VISUAL_ASSET_MANIFEST[roundType].ACTIVE?.attachments ?? [];
      expect(attachments.length, roundType).toBeGreaterThanOrEqual(3);
      expect(new Set(attachments.map(attachment => attachment.id)).size, roundType).toBe(attachments.length);
      expect(attachments.some(attachment => attachment.kind !== 'CONTROL_APERTURE'), roundType).toBe(true);
    }
  });

  it('defines bounded control apertures for every department', () => {
    for (const roundType of ROUND_TYPES) {
      const apertures = (VISUAL_ASSET_MANIFEST[roundType].ACTIVE?.attachments ?? [])
        .filter(attachment => attachment.kind === 'CONTROL_APERTURE');
      expect(apertures.length, roundType).toBeGreaterThan(0);
      for (const aperture of apertures) {
        expect(aperture.widthPercent, `${roundType} ${aperture.id} width`).toBeGreaterThanOrEqual(12);
        expect(aperture.heightPercent, `${roundType} ${aperture.id} height`).toBeGreaterThanOrEqual(18);
        expect(aperture.xPercent - aperture.widthPercent! / 2, `${roundType} ${aperture.id} left`).toBeGreaterThanOrEqual(0);
        expect(aperture.xPercent + aperture.widthPercent! / 2, `${roundType} ${aperture.id} right`).toBeLessThanOrEqual(100);
        expect(aperture.yPercent - aperture.heightPercent! / 2, `${roundType} ${aperture.id} top`).toBeGreaterThanOrEqual(0);
        expect(aperture.yPercent + aperture.heightPercent! / 2, `${roundType} ${aperture.id} bottom`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('retires Crown-like artwork from the production asset directory', () => {
    const publicAssets = join(process.cwd(), 'public', 'assets', 'generated-v4');
    for (const obsolete of [
      'map-plotting-console-v4.webp',
      'redacted-records-desk-v1.webp',
      'complaints-desk-analyser-v1.webp',
    ]) expect(existsSync(join(publicAssets, obsolete)), obsolete).toBe(false);
    expect(VISUAL_ASSET_MANIFEST.WHERE_IN_BRITAIN.ACTIVE?.desktop).toContain('map-plotting-console-v6');
    expect(VISUAL_ASSET_MANIFEST.REDACTED_RECORDS.ACTIVE?.desktop).toContain('redacted-records-desk-v2');
    expect(VISUAL_ASSET_MANIFEST.COMPLAINTS_DESK.ACTIVE?.desktop).toContain('complaints-desk-analyser-v2');
  });

  it('keeps every source PNG outside public and references all v4 masters', () => {
    const sourceDir = join(process.cwd(), 'assets', 'source-art', 'apparatus-v4');
    const referenced = new Set(Object.values(VISUAL_ASSET_MANIFEST).flatMap(states => Object.values(states).map(asset => asset?.sourceFile).filter(Boolean)));
    const sourceFiles = readdirSync(sourceDir).filter(file => file.endsWith('.png'));
    expect(sourceFiles).toHaveLength(8);
    for (const file of sourceFiles) expect(referenced.has(`assets/source-art/apparatus-v4/${file}`), file).toBe(true);
    expect(readdirSync(join(process.cwd(), 'public', 'assets', 'generated-v4')).some(file => file.endsWith('.png'))).toBe(false);
  });

  it('references every final promoted-apparatus master without obsolete source concepts', () => {
    const sourceDir = join(process.cwd(), 'assets', 'source-art', 'promoted-apparatus');
    const referenced = new Set(Object.values(VISUAL_ASSET_MANIFEST).flatMap(states => Object.values(states).map(asset => asset?.sourceFile).filter(Boolean)));
    const sourceFiles = readdirSync(sourceDir).filter(file => file.endsWith('.png'));
    expect(sourceFiles).toHaveLength(9);
    for (const file of sourceFiles) expect(referenced.has(`assets/source-art/promoted-apparatus/${file}`), file).toBe(true);
    expect(existsSync(join(process.cwd(), 'assets', 'source-art', 'prototypes'))).toBe(false);
  });

  it('offers every player-count and question-length combination directly', () => {
    expect(ROUND_DEV_SCENARIOS).toHaveLength(17 * 6 * 3 * 2);
    expect(new Set(ROUND_DEV_SCENARIOS.map(scenario => scenario.id)).size).toBe(ROUND_DEV_SCENARIOS.length);
  });

  it('names the active control for every gameplay apparatus',()=>{
    for(const instrument of Object.keys(INSTRUMENT_ROUND))expect(APPARATUS_CONTROL_LABELS[instrument],instrument).toBeTruthy();
  });
});
