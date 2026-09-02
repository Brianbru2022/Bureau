import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('../components', import.meta.url));

function componentFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? componentFiles(path) : path.endsWith('.tsx') ? [path] : [];
  });
}

describe('shared-screen typography contract', () => {
  it('does not use 8px or 9px text for component copy', () => {
    const offenders = componentFiles(sourceRoot).flatMap(path => {
      const matches = readFileSync(path, 'utf8').match(/text-\[(?:8|9)px\]/g);
      return matches ? [`${path}: ${matches.join(', ')}`] : [];
    });

    expect(offenders).toEqual([]);
  });

  it('defines a 12px operational floor and a 14px instruction size', () => {
    const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
    expect(css).toContain('--bureau-type-operational-min: 0.75rem');
    expect(css).toContain('--bureau-type-instruction: 0.875rem');
  });
});
