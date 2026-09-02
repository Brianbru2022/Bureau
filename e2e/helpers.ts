import { expect, type Page } from '@playwright/test';

export const phase = (page: Page, name: string) => page.locator(`main[data-game-phase="${name}"]`);

export async function openClean(page: Page, path = '/?seed=617') {
  const currentUrl = page.url();
  const target = path.startsWith('/') && /^https?:/.test(currentUrl) ? new URL(path, currentUrl).toString() : path;
  await page.goto(target);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: /questionable knowledge/i })).toBeVisible();
}

export async function startFirstAssessment(page: Page, playerCount: 1 | 2 | 4) {
  await openClean(page);
  await page.getByRole('button', { name: new RegExp(`start first assessment with ${playerCount} candidate`, 'i') }).click();
  await expect(phase(page, 'SETUP')).toBeVisible();
  await page.getByRole('button', { name: /issue cards & begin briefing/i }).click();
  await enterGuidedDepartment(page);
  await expect(phase(page, 'PLAYING_ROUND')).toBeVisible();
}

export async function enterGuidedDepartment(page: Page) {
  await expect(phase(page, 'ROOM_TRANSITION')).toBeVisible();
  const enter = page.getByRole('button', { name: /enter department/i });
  if (await enter.isDisabled()) {
    for (let step = 0; step < 3; step += 1) {
      await page.getByRole('button', { name: /show next step|control understood/i }).click();
    }
  }
  await expect(enter).toBeEnabled();
  await enter.click();
}

export async function waitForDispatch(page: Page) {
  const notice = page.getByTestId('dispatch-notice');
  if (await notice.count()) await notice.waitFor({ state: 'hidden' });
}

export async function skipAttempt(page: Page) {
  await expect(phase(page, 'PLAYING_ROUND')).toBeVisible();
  await waitForDispatch(page);
  const privacyCurtain = page.getByTestId('privacy-curtain');
  await expect(privacyCurtain.or(page.locator('[data-round-type]')).first()).toBeVisible();
  if (await privacyCurtain.isVisible()) {
    await privacyCurtain.getByRole('button').click();
    await expect(privacyCurtain).toHaveCount(0);
  }
  await expectNoDesktopOverflow(page);
  await page.getByRole('button', { name: /open rules and host controls/i }).click();
  await expect(page.getByRole('dialog', { name: /how to run the bureau/i })).toBeVisible();
  if (await privacyCurtain.isVisible()) {
    await privacyCurtain.getByRole('button').click();
    await expect(privacyCurtain).toHaveCount(0);
  }
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /skip for zero/i }).click();
}

export async function completeFirstAssessmentBySkipping(page: Page, playerCount: 1 | 2 | 4) {
  await startFirstAssessment(page, playerCount);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await phase(page, 'PODIUM').count()) break;
    await skipAttempt(page);
    await page.waitForFunction(() => document.querySelector('main[data-game-phase="PODIUM"]') || document.querySelector('main[data-game-phase="ROOM_TRANSITION"]') || document.querySelector('main[data-game-phase="PLAYING_ROUND"]'));
    if (await phase(page, 'ROOM_TRANSITION').count()) await enterGuidedDepartment(page);
  }
  await expect(phase(page, 'PODIUM')).toBeVisible();
  await expect(page.getByRole('heading', { name: playerCount===1?/annual bureau appraisal/i:/grand bureau ceremony/i })).toBeVisible();
  await expect(page.getByRole('button', { name: playerCount===1?/repeat solo assessment/i:/same candidates, new random assessment/i })).toBeVisible();
  await expect(page.locator('[role="listitem"]')).toHaveCount(playerCount);
}

export async function expectNoDesktopOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  if (metrics.innerWidth >= 1366) expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);
}
