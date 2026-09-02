import { expect, test } from '@playwright/test';
import { openClean, phase } from './helpers';

test('keyboard-only setup reaches the candidate form with visible focus',async({page})=>{
  await openClean(page);
  const start=page.getByRole('button',{name:/start first assessment with 1 candidate/i});
  await start.focus();
  await expect(start).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(phase(page,'SETUP')).toBeVisible();
  const name=page.getByLabel(/candidate name/i).first();
  await name.focus();
  await expect(name).toBeFocused();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Keyboard Candidate');
  await expect(name).toHaveValue('Keyboard Candidate');
});

test('host can choose a continuous scoring pace independently of the turn timer',async({page})=>{
  await openClean(page);
  await page.getByRole('button',{name:/customise assessment/i}).click();
  await page.getByRole('button',{name:/^quick 4 rounds/i}).click();
  await page.getByRole('button',{name:/host options/i}).click();
  const standard=page.getByRole('button',{name:'Standard',exact:true}).first();
  await expect(standard).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Rapid',exact:true}).click();
  await expect(page.getByRole('button',{name:'Rapid',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByText(/original full continuous time decay/i)).toBeVisible();
  await expect(page.getByRole('button',{name:'OFF',exact:true})).toHaveAttribute('aria-pressed','true');

  await page.goto('/dev/gallery?scorePace=RAPID');
  await page.getByLabel('Department',{exact:true}).selectOption('COMPLAINTS_DESK');
  await expect(page.getByLabel('Scoring pace: Rapid').first()).toBeVisible();
  await expect(page.getByText(/rapid scoring: every additional moment changes the award continuously/i)).toBeVisible();
});

test('sealed-answer rounds use an explicit full-screen recipient handover',async({page})=>{
  await page.goto('/dev/gallery?privacy=ON');
  await page.getByLabel('Department',{exact:true}).selectOption('CLOSEST_WINS');
  const firstCurtain=page.getByRole('dialog',{name:/pass to candidate 1/i});
  await expect(firstCurtain).toBeVisible();
  const firstConfirm=firstCurtain.getByRole('button',{name:/i am candidate 1.*enter estimate/i});
  await expect(firstConfirm).toBeFocused();
  await firstConfirm.click();
  await page.getByPlaceholder(/estimate in/i).fill('100');
  await page.getByRole('button',{name:/seal estimate/i}).click();
  const secondCurtain=page.getByRole('dialog',{name:/pass to candidate 2/i});
  await expect(secondCurtain).toBeVisible();
  await expect(secondCurtain).toContainText(/earlier|previous|remain sealed/i);

  await page.goto('/dev/gallery?privacy=ON');
  await page.getByLabel('Department',{exact:true}).selectOption('PUBLIC_ENQUIRY');
  const witnessCurtain=page.getByRole('dialog',{name:/pass to candidate 1/i});
  await witnessCurtain.getByRole('button',{name:/receive witness brief/i}).click();
  await expect(page.getByRole('button',{name:/reveal private brief/i})).toBeVisible();
});

test('secret directives conceal the screen before each named recipient',async({page})=>{
  await openClean(page);
  await page.getByRole('button',{name:/customise assessment/i}).click();
  await page.getByRole('button',{name:/^quick 4 rounds/i}).click();
  await page.getByRole('button',{name:/2 players, approximately/i}).click();
  await page.getByRole('button',{name:/issue cards & receive directives/i}).click();
  const first=page.getByRole('dialog',{name:/pass to candidate 1/i});
  await expect(first).toBeVisible();
  await first.getByRole('button',{name:/receive directive/i}).click();
  await page.getByRole('button',{name:/prepare handover to candidate 2/i}).click();
  await expect(page.getByRole('dialog',{name:/pass to candidate 2/i})).toBeVisible();
});

test('reduced motion removes apparatus travel without delaying status',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/dev/gallery');
  await page.getByLabel('State', { exact: true }).selectOption('PROCESSING');
  const spinner=page.locator('.bureau-state-ribbon-mark');
  await expect(spinner).toBeVisible();
  const animation=await spinner.evaluate(element=>getComputedStyle(element).animationName);
  expect(animation).toBe('none');
  await expect(page.locator('.bureau-state-ribbon')).toContainText(/apparatus consulting the register/i);
});

test('screen-reader structure exposes the active control and state once',async({page})=>{
  await page.goto('/dev/gallery');
  await page.getByLabel('State', { exact: true }).selectOption('ACCEPTED');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading',{level:2})).toBeVisible();
  await expect(page.getByText(/active control/i)).toBeVisible();
  const ribbon=page.locator('.bureau-state-ribbon');
  await expect(ribbon).toHaveCount(1);
  await expect(ribbon).toContainText(/accepted and certified/i);
  await expect(page.getByRole('button',{name:/lock coordinates/i})).toBeVisible();
});

test('200 percent text keeps state and control adjacent and reachable',async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await page.goto('/dev/gallery');
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  const control=page.getByRole('button',{name:/lock coordinates/i});
  const legend=page.getByText(/active control/i);
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeVisible();
  await expect(legend).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
