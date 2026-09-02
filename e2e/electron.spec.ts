import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { completeFirstAssessmentBySkipping } from './helpers';

const bureauE2ePort = process.env.BUREAU_E2E_PORT ?? '4187';

for (const playerCount of [1, 2, 4] as const) {
  test(`Electron completes a ${playerCount}-candidate assessment`, async () => {
    const userData = await mkdtemp(join(tmpdir(), 'bureau-e2e-'));
    const app = await electron.launch({
      args: ['.'],
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test', BUREAU_DEV_URL: `http://127.0.0.1:${bureauE2ePort}/?seed=617`, BUREAU_E2E_USER_DATA_DIR: userData },
    });
    try {
      const window = await app.firstWindow();
      await expect(window.getByRole('heading', { name: /questionable knowledge/i })).toBeVisible();
      await expect(window.getByRole('button', { name: /export support bundle/i })).toBeVisible();
      const distributionState=await window.evaluate(() => (globalThis as unknown as {bureauDesktop?:{getDistributionStatus:()=>Promise<{state:string}>}}).bureauDesktop?.getDistributionStatus());
      expect(distributionState?.state).toBe('UNAVAILABLE');
      await completeFirstAssessmentBySkipping(window, playerCount);
      await expect(window.getByRole('button', { name: /toggle fullscreen/i })).toBeVisible();
    } finally {
      await app.close();
      await rm(userData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
  });
}
