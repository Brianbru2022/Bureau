import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { chromium, type Page } from '@playwright/test';

const root=process.cwd();
const output=resolve(root,'storefront/captures');
const version=(JSON.parse(readFileSync(resolve(root,'package.json'),'utf8')) as {version:string}).version;
const seed='617';
const port=Number(process.env.BUREAU_STOREFRONT_PORT??4192);
const baseUrl=`http://127.0.0.1:${port}`;
if(!existsSync(resolve(root,'dist/index.html'))) throw new Error('Run the production build before capturing storefront images.');
mkdirSync(output,{recursive:true});

const server=spawn(process.execPath,[resolve(root,'node_modules/vite/bin/vite.js'),'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore'});
const waitForServer=async()=>{
  for(let attempt=0;attempt<80;attempt+=1){
    try{const response=await fetch(baseUrl);if(response.ok)return;}catch{}
    await new Promise(resolveWait=>setTimeout(resolveWait,100));
  }
  throw new Error(`Production preview did not start on ${baseUrl}.`);
};
const sha256=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
const pngDimensions=(path:string)=>{
  const bytes=readFileSync(path);
  if(bytes.toString('hex',0,8)!=='89504e470d0a1a0a') throw new Error(`${path} is not a PNG.`);
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
};
const records:Array<Record<string,unknown>>=[];
const capture=async(page:Page,id:string,state:string)=>{
  const path=resolve(output,`${id}.png`);
  await page.screenshot({path,animations:'disabled'});
  const dimensions=pngDimensions(path);
  if(dimensions.width!==1600||dimensions.height!==900) throw new Error(`${id} is ${dimensions.width}x${dimensions.height}, expected 1600x900.`);
  records.push({id,file:`storefront/captures/${basename(path)}`,buildVersion:version,seed,viewport:'1600x900',state,source:'ACTUAL_GAMEPLAY',anonymised:true,sha256:sha256(path)});
};
const openClean=async(page:Page)=>{
  await page.goto(`${baseUrl}/?seed=${seed}`);
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.getByRole('heading',{name:/questionable knowledge/i}).waitFor();
};
const enterDepartment=async(page:Page)=>{
  const enter=page.getByRole('button',{name:/enter department/i});
  if(await enter.isDisabled()) for(let step=0;step<3;step+=1) await page.getByRole('button',{name:/show next step|control understood/i}).click();
  await enter.click();
};
const fileMapAttempt=async(page:Page,captureRoute=false)=>{
  await page.waitForFunction(()=>{
    const image=document.querySelector('img[alt="Unlabelled map of the United Kingdom"]') as HTMLImageElement|null;
    return Boolean(image?.complete&&image.naturalWidth>0);
  });
  const map=page.getByRole('application',{name:/unlabelled map/i});
  const mapBox=await map.boundingBox();
  if(!mapBox) throw new Error('The live map has no measurable plotting area.');
  await map.click({position:{x:Math.max(20,Math.round(mapBox.width*.56)),y:Math.max(20,Math.round(mapBox.height*.52))}});
  const lock=page.getByRole('button',{name:/lock coordinates/i});
  await lock.waitFor({state:'visible'});
  await lock.click();
  if(captureRoute){
    await page.locator('.bureau-map-trace').waitFor({state:'visible'});
    await page.waitForTimeout(650);
    await capture(page,'03-cartography-route','Live cartography route between guessed and certified points');
  }
  await page.getByRole('dialog',{name:/bureau finding/i}).waitFor({state:'visible'});
};
const skipAttempt=async(page:Page)=>{
  const notice=page.getByTestId('dispatch-notice');
  if(await notice.count()) await notice.waitFor({state:'hidden'});
  await page.getByRole('button',{name:/open rules and host controls/i}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:/skip for zero/i}).click();
};

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({executablePath:process.env.BUREAU_E2E_CHROME??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1600,height:900},locale:'en-GB'});

  await openClean(page);
  await capture(page,'01-opening-screen','Opening screen and assessment choices');

  await page.getByRole('button',{name:/customise assessment/i}).click();
  await page.getByRole('button',{name:/custom choose 4.?8/i}).click();
  await page.getByRole('button',{name:/host options/i}).click();
  await page.getByRole('button',{name:/host guidance: guided/i}).click();
  await page.getByRole('button',{name:'Off',exact:true}).click();
  await page.getByRole('button',{name:/4 players, approximately/i}).click();
  await page.getByRole('button',{name:/issue cards & (?:begin briefing|receive directives)/i}).click();
  for(let candidate=2;candidate<=4;candidate+=1) await page.getByRole('button',{name:new RegExp(`hand device to candidate ${candidate}`,'i')}).click();
  await page.getByRole('button',{name:/commence round 1/i}).click();
  await enterDepartment(page);
  await page.getByRole('application',{name:/unlabelled map/i}).waitFor();
  await capture(page,'02-four-candidate-apparatus','Four-candidate live cartography apparatus');

  for(let candidate=0;candidate<4;candidate+=1){
    await fileMapAttempt(page,candidate===0);
    if(candidate===0) await capture(page,'05-result-dossier','Live result dossier with answer and proportional score');
    await page.getByRole('button',{name:/continue/i}).click();
  }
  await enterDepartment(page);
  await page.getByLabel('Top 10 answer').waitFor();
  for(let rejection=0;rejection<9;rejection+=1){
    await page.getByLabel('Top 10 answer').fill(`unfiled answer ${rejection}`);
    await page.getByRole('button',{name:/release shutter/i}).click();
    await page.getByRole('button',{name:'Reject',exact:true}).click();
  }
  await page.getByText('Eliminated',{exact:true}).waitFor();
  await capture(page,'04-top-ten-elimination','Top Ten cabinet with persistent eliminated-candidate plate');

  const finalPage=await browser.newPage({viewport:{width:1600,height:900},locale:'en-GB'});
  await openClean(finalPage);
  await finalPage.getByRole('button',{name:/start first assessment with 4 candidates/i}).click();
  await finalPage.getByRole('button',{name:/issue cards & begin briefing/i}).click();
  await enterDepartment(finalPage);
  for(let attempt=0;attempt<30;attempt+=1){
    if(await finalPage.locator('main[data-game-phase="PODIUM"]').count()) break;
    await skipAttempt(finalPage);
    await finalPage.waitForFunction(()=>document.querySelector('main[data-game-phase="PODIUM"],main[data-game-phase="ROOM_TRANSITION"],main[data-game-phase="PLAYING_ROUND"]'));
    if(await finalPage.locator('main[data-game-phase="ROOM_TRANSITION"]').count()) await enterDepartment(finalPage);
  }
  await finalPage.locator('main[data-game-phase="PODIUM"]').waitFor();
  const finalDispatch=finalPage.getByTestId('dispatch-notice');
  if(await finalDispatch.count()) await finalDispatch.waitFor({state:'hidden'});
  await capture(finalPage,'06-post-assessment-dossiers','Completed four-candidate assessment and post-assessment dossiers');
  await finalPage.close();

  const manifest={schemaVersion:1,product:'The Bureau of Questionable Knowledge',buildVersion:version,capturedAt:new Date().toISOString(),capturePolicy:'Genuine production gameplay only; no development gallery, composited controls or invented testimonials.',captures:records.sort((left,right)=>String(left.id).localeCompare(String(right.id),'en-GB'))};
  writeFileSync(resolve(root,'STOREFRONT-CAPTURES.json'),`${JSON.stringify(manifest,null,2)}\n`,'utf8');
  console.log(`Captured ${records.length} genuine storefront images at 1600x900.`);
}finally{
  await browser?.close();
  server.kill();
}
