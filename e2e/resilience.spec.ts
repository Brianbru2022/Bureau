import { test, expect } from '@playwright/test';
import { openClean, phase, startFirstAssessment } from './helpers';

test('free-text adjudication supports edit, acceptance and reversal', async ({ page }) => {
  await page.goto('/dev/round-lab');
  await page.getByLabel('Department').selectOption('TOP_10');
  await page.getByLabel('Candidates').selectOption('1');
  await page.getByLabel('Top 10 answer').fill('administratively plausible nonsense');
  await page.getByRole('button', { name: /release shutter/i }).click();
  const ruling = page.getByRole('group', { name: /host answer adjudication/i });
  await expect(ruling).toBeVisible();
  const edit = ruling.getByLabel(/edit or select the intended answer/i);
  await edit.fill('Tower of London');
  await ruling.getByRole('button', { name: /edit & accept/i }).click();
  await expect(page.getByText(/host edited/i)).toBeVisible();
  await page.getByRole('button', { name: /undo latest ruling/i }).click();
  await expect(ruling).toBeVisible();
  await ruling.getByRole('button', { name: /^reject$/i }).click();
  await expect(page.getByText(/registry rejected/i)).toBeVisible();
});

test('timer is keyboard-operable', async ({ page }) => {
  await page.goto('/dev/round-lab');
  await page.getByLabel('Timer').selectOption('60');
  const timerButton = page.getByRole('timer').getByRole('button');
  await expect(timerButton).toBeVisible();
  await timerButton.focus();
  await expect(timerButton).toBeFocused();
  await timerButton.press('Enter');
  await expect(timerButton).toHaveAccessibleName(/resume turn timer/i);
  await expect(timerButton).toBeFocused();
  await timerButton.press('Enter');
  await expect(timerButton).toHaveAccessibleName(/pause turn timer/i);
  await expect(timerButton).toBeFocused();
});

test('malformed recovery data fails safely with a clear notice', async ({ page }) => {
  await openClean(page);
  await page.evaluate(() => localStorage.setItem('the-bureau.active-game.v3', '{not valid json'));
  await page.reload();
  await expect(page.getByText(/damaged Bureau save was discarded/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /questionable knowledge/i })).toBeVisible();
});

test('a valid v2 browser save migrates and resumes', async ({ page }) => {
  await startFirstAssessment(page, 1);
  await page.evaluate(() => {
    const current = JSON.parse(localStorage.getItem('the-bureau.active-game.v4') ?? 'null');
    if (!current?.state) throw new Error('Expected the running assessment to create a v4 save.');
    const state=current.state;
    const legacy = { ...state, version:2, preset:state.config.preset, roundLimit:state.config.roundTypes.length, matchConfig:undefined };
    localStorage.setItem('the-bureau.active-game.v2', JSON.stringify(legacy));
    localStorage.removeItem('the-bureau.active-game.v4');
  });
  await page.reload();
  await expect(page.getByText(/unfinished assessment located/i)).toBeVisible();
  await page.getByRole('button', { name: /resume game/i }).click();
  await expect(phase(page, 'ROOM_TRANSITION')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('the-bureau.active-game.v4') ?? '{}').version)).toBe(4);
});

test('independent beta cohort locks its required setup and records setup incidents', async ({ page }) => {
  await openClean(page);
  await page.getByRole('button', { name: /open rules and host controls/i }).click();
  await page.getByLabel(/independent group code/i).fill('GROUP-02');
  await page.getByLabel(/required cohort session/i).selectOption('TWO_QUICK_LIGHT');
  await page.getByText(/independent-group eligibility confirmed/i).click();
  await page.getByText(/candidates consent to local beta diagnostics/i).click();
  await page.getByRole('button', { name: /arm required assessment/i }).click();
  await page.getByRole('button', { name: /close host help/i }).click();
  await expect(page.getByText(/independent beta session armed: group-02/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /first assessment/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^quick/i })).toBeEnabled();
  await expect(page.getByRole('button', { name: /^solo, approximately/i })).toBeDisabled();
  await page.getByRole('button', { name: /^2 players, approximately/i }).click();
  await expect(phase(page, 'SETUP')).toBeVisible();
  await page.getByRole('button', { name: /open rules and host controls/i }).click();
  await page.getByLabel(/dead-time duration/i).selectOption('10');
  await page.getByRole('button', { name: /file 10 seconds of dead time/i }).click();
  const recorded = await page.evaluate(() => {
    const sessions=JSON.parse(localStorage.getItem('the-bureau.playtest-sessions-v2')??'[]');
    const events=JSON.parse(localStorage.getItem('the-bureau.playtest-events-v1')??'[]');
    return {session:sessions.at(-1),event:events.filter((item:{type:string})=>item.type==='DEAD_TIME').at(-1)};
  });
  expect(recorded.session).toMatchObject({version:4,cohortSlot:'TWO_QUICK_LIGHT',playerCount:2,preset:'QUICK',politicsMode:'LIGHT'});
  expect(recorded.event).toMatchObject({type:'DEAD_TIME',phase:'SETUP',durationMs:10_000});
});

test('human balance cohort locks a four-candidate Full Bureau assessment',async({page})=>{
  await openClean(page);
  await page.getByRole('button',{name:/open rules and host controls/i}).click();
  await page.getByLabel(/independent group code/i).fill('BALANCE-01');
  await page.getByLabel(/required cohort session/i).selectOption('FOUR_FULL_BALANCE');
  await page.getByText(/independent-group eligibility confirmed/i).click();
  await page.getByText(/candidates consent to local beta diagnostics/i).click();
  await page.getByRole('button',{name:/arm required assessment/i}).click();
  await page.getByRole('button',{name:/close host help/i}).click();
  await expect(page.getByText(/full bureau.*balance coverage/i)).toBeVisible();
  await expect(page.getByRole('button',{name:/^full bureau/i})).toBeEnabled();
  await expect(page.getByRole('button',{name:/^quick/i})).toBeDisabled();
  await expect(page.getByRole('button',{name:/^4 players, approximately/i})).toBeEnabled();
  await expect(page.getByRole('button',{name:/^2 players, approximately/i})).toBeDisabled();
});
