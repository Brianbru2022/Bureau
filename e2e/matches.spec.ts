import { test, expect } from '@playwright/test';
import { completeFirstAssessmentBySkipping, enterGuidedDepartment, expectNoDesktopOverflow, phase, startFirstAssessment, waitForDispatch } from './helpers';

for (const playerCount of [1, 2, 4] as const) {
  test(`complete ${playerCount}-candidate browser assessment`, async ({ page }) => {
    await completeFirstAssessmentBySkipping(page, playerCount);
  });
}

test('refresh recovery and restart remain connected', async ({ page }) => {
  await startFirstAssessment(page, 2);
  await waitForDispatch(page);
  const challengeId = await phase(page, 'PLAYING_ROUND').getAttribute('data-challenge-id');
  await expectNoDesktopOverflow(page);

  await page.getByRole('button', { name: /open rules and host controls/i }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /restart attempt/i }).click();
  await expect(phase(page, 'PLAYING_ROUND')).toHaveAttribute('data-challenge-id', challengeId ?? '');

  await page.reload();
  await expect(page.getByText(/unfinished assessment located/i)).toBeVisible();
  await page.getByRole('button', { name: /resume game/i }).click();
  await enterGuidedDepartment(page);
  await expect(phase(page, 'PLAYING_ROUND')).toHaveAttribute('data-challenge-id', challengeId ?? '');
});

test('completed match can replay with the same candidates', async ({ page }) => {
  await completeFirstAssessmentBySkipping(page, 1);
  await page.getByRole('button', { name: /repeat solo assessment/i }).click();
  await expect(phase(page, 'PLAYING_ROUND')).toBeVisible();
  await expect(page.locator('[role="listitem"]')).toHaveCount(1);
});
