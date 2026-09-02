import { expect, test, type Page } from '@playwright/test';

const desktopViewports = [
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
] as const;

const expectInsideViewport = async (page: Page, selector: string) => {
  const bounds = await page.locator(selector).boundingBox();
  expect(bounds, `${selector} should be rendered`).not.toBeNull();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual((await page.evaluate(() => innerHeight)) + 1);
};

const expectNoDocumentScroll = async (page: Page) => {
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - innerWidth,
    y: document.documentElement.scrollHeight - innerHeight,
  }));
  expect(overflow.x, 'horizontal document overflow').toBeLessThanOrEqual(1);
  expect(overflow.y, 'vertical document overflow').toBeLessThanOrEqual(1);
};

for (const viewport of desktopViewports) {
  test(`opening and four-candidate registration fit ${viewport.name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(viewport);
    await page.goto('/');

    await expect(page.getByRole('button', { name: /start first assessment with 4 candidates/i })).toBeVisible();
    const titleOverflow = await page.locator('.bureau-title-screen').evaluate(element => element.scrollHeight - element.clientHeight);
    expect(titleOverflow, 'title screen internal overflow').toBeLessThanOrEqual(1);
    await expectNoDocumentScroll(page);
    await expect(page).toHaveScreenshot(`viewport-opening-${viewport.name}.png`, { animations: 'disabled' });

    await page.getByRole('button', { name: /start first assessment with 4 candidates/i }).click();
    await expect(page.getByRole('button', { name: /issue cards/i })).toBeVisible();
    await expectInsideViewport(page, '.bureau-registration-card:last-child');
    await expectInsideViewport(page, '.bureau-registration-proceed');
    await expectNoDocumentScroll(page);
    await expect(page).toHaveScreenshot(`viewport-registration-4-${viewport.name}.png`, { animations: 'disabled' });
  });

  test(`Top Ten and final ceremony fit ${viewport.name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(viewport);
    await page.goto('/dev/gallery');
    await page.getByLabel('Department', { exact: true }).selectOption('TOP_10');
    await page.getByLabel('Candidates', { exact: true }).selectOption('4');
    await page.getByLabel('Question', { exact: true }).selectOption('LONG');
    await expectInsideViewport(page, '[data-round-type="top_10"]');
    await expectInsideViewport(page, '.bureau-top10-candidates > div:last-child');
    await expectNoDocumentScroll(page);
    await expect(page).toHaveScreenshot(`viewport-top10-${viewport.name}.png`, { animations: 'disabled' });

    await page.goto('/dev/post-assessment');
    await page.getByRole('button', { name: /reveal hidden commendations/i }).click();
    await page.getByRole('button', { name: /final standings/i }).click();
    await page.waitForTimeout(1_000);
    await expect(page.locator('.bureau-post-dossier')).toHaveCount(4);
    await expectInsideViewport(page, '.bureau-podium-actions');
    await expectInsideViewport(page, '.bureau-post-dossier:last-child');
    await expectNoDocumentScroll(page);
    await expect(page).toHaveScreenshot(`viewport-ceremony-4-${viewport.name}.png`, { animations: 'disabled' });
  });
}
