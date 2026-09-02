import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
] as const;

const departments = [
  'WHERE_IN_BRITAIN','TOP_10','PUT_UP_OR_SHUT_UP','THE_LIST','CLOSEST_WINS','RANK_IT','IMAGE_REVEAL','STOP_THE_SCORE',
  'MISFILED_RECORDS','REDACTED_RECORDS','COMMON_DOSSIER','MISSING_MINUTES','PUBLIC_ENQUIRY','CHAIN_OF_COMMAND',
  'COMPLAINTS_DESK','SEATING_COMMITTEE','DISPATCH_BOX',
] as const;

for (const viewport of viewports) {
  test(`gallery baseline ${viewport.name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(viewport);
    await page.goto('/dev/gallery');
    await page.getByLabel('Department', { exact: true }).selectOption('DISPATCH_BOX');
    await page.getByLabel('Candidates', { exact: true }).selectOption('4');
    await page.getByLabel('Question', { exact: true }).selectOption('LONG');
    await page.getByLabel('State', { exact: true }).selectOption('RESULT');
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
    await expect(page).toHaveScreenshot(`gallery-${viewport.name}.png`, { fullPage: true, animations: 'disabled' });
  });
}

for (const department of departments) {
  test(`actual ${department} active apparatus baseline`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/dev/gallery');
    await page.getByLabel('Department', { exact: true }).selectOption(department);
    await page.getByLabel('State', { exact: true }).selectOption('ACTIVE');
    await page.getByLabel('Candidates', { exact: true }).selectOption('4');
    await page.getByLabel('Question', { exact: true }).selectOption('LONG');
    const fixture = page.locator(`[data-gallery-actual-round="${department.toLowerCase()}"]`);
    await expect(fixture).toBeVisible();
    await expect(fixture.locator(`[data-round-type="${department.toLowerCase()}"]`)).toBeVisible();
    await expect(page).toHaveScreenshot(`actual-${department.toLowerCase().replaceAll('_','-')}-active-1600x900.png`, { fullPage: true, animations: 'disabled' });
  });
}

test('confidential handover curtain baseline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/dev/gallery?privacy=ON');
  await page.getByLabel('Department', { exact: true }).selectOption('CLOSEST_WINS');
  const curtain = page.getByRole('dialog', { name: /pass to candidate 1/i });
  await expect(curtain).toBeVisible();
  await expect(curtain.getByRole('button', { name: /i am candidate 1/i })).toBeFocused();
  await expect(page).toHaveScreenshot('privacy-handover-1600x900.png', { fullPage: true, animations: 'disabled' });
});

test('blocked artwork leaves a complete keyboard action', async ({ page }) => {
  await page.route(/\/assets\/generated-v4\/.*\.(?:webp|png|jpe?g)(?:\?.*)?$/i, route => route.abort());
  await page.goto('/dev/gallery');
  const map = page.getByRole('application', { name: /unlabelled map/i });
  await map.focus();
  await expect(map).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /lock coordinates/i })).toBeEnabled();
});

test('Top 10 elimination has a failed-lamp treatment while other candidates continue', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/dev/gallery');
  await page.getByLabel('Department', { exact: true }).selectOption('TOP_10');
  await page.getByLabel('State', { exact: true }).selectOption('ACTIVE');
  await page.getByLabel('Candidates', { exact: true }).selectOption('4');
  for (let attempt = 0; attempt < 9; attempt += 1) {
    await page.getByLabel('Top 10 answer').fill(`invalid filing ${attempt}`);
    await page.getByRole('button', { name: /release shutter/i }).click();
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
  }
  const apparatus = page.locator('[data-round-type="top_10"][data-apparatus-outcome="eliminated"]');
  await expect(apparatus).toBeVisible();
  await expect(apparatus.locator('.bureau-state-glyph[data-treatment="eliminated"][data-mechanism="shutter"]')).toBeVisible();
  await expect(apparatus.locator('.bureau-state-ribbon')).toContainText(/remaining candidates continue/i);
  await expect(page.getByText('Candidate 2', { exact: true }).first()).toBeVisible();
});

test('200 percent text retains the essential action without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/dev/gallery');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const action = page.getByRole('button', { name: /lock coordinates/i });
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('all actionable controls and informative images have accessible names', async ({ page }) => {
  await page.goto('/dev/round-lab');
  const unnamed = await page.locator('button, input, select, textarea, a[href]').evaluateAll(elements => elements.filter(element => {
    const html = element as HTMLElement;
    const label = html.getAttribute('aria-label') || html.getAttribute('title') || html.textContent?.trim();
    return !label;
  }).length);
  expect(unnamed).toBe(0);
  expect(await page.locator('img:not([alt])').count()).toBe(0);
});

test('every department identifies its control and non-active apparatus states in text',async({page})=>{
  await page.goto('/dev/gallery');
  const departments=await page.getByLabel('Department', { exact: true }).locator('option').evaluateAll(options=>options.map(option=>(option as HTMLOptionElement).value));
  for(const department of departments){
    await page.getByLabel('Department', { exact: true }).selectOption(department);
    await page.getByLabel('State', { exact: true }).selectOption('ACTIVE');
    await expect(page.locator(`[data-gallery-actual-round="${department.toLowerCase()}"]`)).toBeVisible();
    await expect(page.locator(`[data-round-type="${department.toLowerCase()}"]`)).toBeVisible();
    await expect(page.getByText(/responsive art fallback ready/i)).toHaveCount(0);
    await expect(page.locator('.bureau-control-legend strong')).not.toHaveText('');
    await expect(page.locator('.bureau-apparatus-art')).toHaveJSProperty('complete',true);
    for(const state of ['IDLE','PROCESSING','ACCEPTED','REJECTED','RESULT']){
      await page.getByLabel('State', { exact: true }).selectOption(state);
      const ribbon=page.locator('.bureau-state-ribbon');
      if(state==='IDLE'){
        await expect(ribbon).toHaveCount(0);
        await expect(page.locator('.bureau-state-glyph')).toHaveCount(0);
        await expect(page.locator(`[data-round-state="idle"]`)).toBeVisible();
        continue;
      }
      await expect(ribbon).toBeVisible();
      await expect(ribbon).toHaveAttribute('data-state',state.toLowerCase());
      await expect(ribbon).not.toHaveText('');
      await expect(ribbon.locator(`.bureau-state-glyph[data-treatment="${state.toLowerCase()}"]`)).toBeVisible();
      await expect(ribbon.locator('.bureau-state-glyph')).toHaveAttribute('data-mechanism', /route|shutter|paper|pressure|capsule|rail|iris|gauge|sorter|ballot/);
      if(state==='RESULT') await page.getByRole('button',{name:/continue/i}).click();
    }
  }
});

test('related quiz departments state visibly different operating doctrines', async ({ page }) => {
  await page.goto('/dev/gallery');
  const groups = [
    ['RANK_IT', 'SEATING_COMMITTEE', 'CHAIN_OF_COMMAND'],
    ['IMAGE_REVEAL', 'REDACTED_RECORDS', 'MISSING_MINUTES'],
    ['TOP_10', 'PUT_UP_OR_SHUT_UP', 'THE_LIST'],
  ];
  for (const group of groups) {
    const doctrines = new Set<string>();
    for (const department of group) {
      await page.getByLabel('Department', { exact: true }).selectOption(department);
      const plate = page.locator('.bureau-mechanic-identity');
      await expect(plate).toBeVisible();
      await expect(plate.locator('dt')).toHaveText(['Action', 'Pressure', 'Finish']);
      doctrines.add(await plate.getAttribute('data-mechanic-doctrine') ?? '');
    }
    expect(doctrines.size).toBe(3);
  }
});
