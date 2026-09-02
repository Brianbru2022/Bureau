import { test, expect } from '@playwright/test';
import { enterGuidedDepartment, openClean, phase } from './helpers';

test('simple setup keeps advanced choices hidden and offers a recommended multiplayer path', async ({ page }) => {
  await openClean(page);
  await expect(page.getByLabel(/simple assessment setup/i)).toBeVisible();
  await expect(page.getByText(/match length · number of departments/i)).toHaveCount(0);
  await page.getByRole('button', { name: /customise assessment/i }).click();
  await expect(page.getByText(/match length · number of departments/i)).toBeVisible();
  await expect(page.getByText(/question familiarity · not match length/i)).toBeVisible();
  await page.getByRole('button', { name: /back to simple setup/i }).click();
  await page.getByRole('button', { name: /start recommended multiplayer with 3 players/i }).click();
  await expect(phase(page, 'SETUP')).toBeVisible();
  await expect(page.getByLabel(/candidate name/i)).toHaveCount(3);
});

test('a first-use department requires its short control demonstration once', async ({ page }) => {
  await openClean(page);
  await page.getByRole('button', { name: /start first assessment with 1 candidate/i }).click();
  await page.getByRole('button', { name: /issue cards & begin briefing/i }).click();
  const enter = page.getByRole('button', { name: /enter department/i });
  await expect(enter).toBeDisabled();
  await expect(page.getByText(/first-use control demonstration/i)).toBeVisible();
  await enterGuidedDepartment(page);
  await expect(phase(page, 'PLAYING_ROUND')).toBeVisible();
});
