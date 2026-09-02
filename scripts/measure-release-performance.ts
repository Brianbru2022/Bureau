import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { VISUAL_ASSET_MANIFEST } from '../src/data/visualAssetManifest';

type Budgets = {
  schemaVersion:number;
  startupEncodedBytes:number;
  startupRoundArtworkRequests:number;
  setupInteractionMedianMs:number;
  maximumSingleApparatusDecodedBytes:number;
  maximumActiveImageDecodedBytes:number;
};

const root=process.cwd();
const budgets=JSON.parse(readFileSync(resolve(root,'PERFORMANCE-BUDGETS.json'),'utf8')) as Budgets;
if(!existsSync(resolve(root,'dist/index.html'))) throw new Error('Run the production build before performance certification.');

const webpDimensions=(path:string)=>{
  const bytes=readFileSync(path);
  const chunk=bytes.toString('ascii',12,16);
  if(chunk==='VP8 ') return {width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff};
  if(chunk==='VP8X') return {width:bytes.readUIntLE(24,3)+1,height:bytes.readUIntLE(27,3)+1};
  if(chunk==='VP8L'){
    const bits=bytes.readUInt32LE(21);
    return {width:(bits&0x3fff)+1,height:((bits>>14)&0x3fff)+1};
  }
  throw new Error(`${path} is not a supported WebP file`);
};

const desktopArtwork=new Set(Object.values(VISUAL_ASSET_MANIFEST).flatMap(states=>Object.values(states).flatMap(asset=>asset?.desktop?[asset.desktop]:[])));
const artworkMetrics=[...desktopArtwork].map(url=>{
  const path=resolve(root,'public',url.replace(/^\//,''));
  const dimensions=webpDimensions(path);
  return {url,width:dimensions.width,height:dimensions.height,decodedBytes:dimensions.width*dimensions.height*4};
});
const maximumApparatus=artworkMetrics.sort((a,b)=>b.decodedBytes-a.decodedBytes)[0];

const port=Number(process.env.BUREAU_PERFORMANCE_PORT??4191);
const baseUrl=`http://127.0.0.1:${port}`;
const viteBin=resolve(root,'node_modules/vite/bin/vite.js');
const server=spawn(process.execPath,[viteBin,'preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore'});
const waitForServer=async()=>{
  for(let attempt=0;attempt<80;attempt+=1){
    try{const response=await fetch(baseUrl);if(response.ok)return;}catch{}
    await new Promise(resolveWait=>setTimeout(resolveWait,100));
  }
  throw new Error(`Production preview did not start on ${baseUrl}.`);
};
const median=(values:number[])=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({executablePath:process.env.BUREAU_E2E_CHROME??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  await page.goto(baseUrl,{waitUntil:'networkidle'});
  const startup=await page.evaluate(()=>{
    const resources=performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const entries=[{name:navigation.name,encodedBodySize:navigation.encodedBodySize,initiatorType:'navigation'},...resources.map(resource=>({name:resource.name,encodedBodySize:resource.encodedBodySize,initiatorType:resource.initiatorType}))];
    return {
      encodedBytes:entries.reduce((sum,entry)=>sum+entry.encodedBodySize,0),
      roundArtworkRequests:entries.filter(entry=>/\/(?:generated-v\d|reconnaissance)\//.test(entry.name)).length,
      resources:entries.map(entry=>({url:new URL(entry.name).pathname,encodedBytes:entry.encodedBodySize,type:entry.initiatorType})),
    };
  });

  const interactionSamples:number[]=[];
  for(let sample=0;sample<5;sample+=1){
    const customise=page.getByRole('button',{name:/customise assessment/i});
    const started=performance.now();
    await customise.click();
    await page.getByRole('button',{name:/back to simple setup/i}).waitFor({state:'visible'});
    interactionSamples.push(performance.now()-started);
    await page.getByRole('button',{name:/back to simple setup/i}).click();
  }

  await page.getByRole('button',{name:/start first assessment with 1 candidate/i}).click();
  await page.getByRole('button',{name:/issue cards & begin briefing/i}).click();
  const enter=page.getByRole('button',{name:/enter department/i});
  if(await enter.isDisabled()) for(let step=0;step<3;step+=1) await page.getByRole('button',{name:/show next step|control understood/i}).click();
  await enter.click();
  await page.locator('.bureau-apparatus-art').waitFor({state:'visible'});
  const liveImages=await page.locator('img').evaluateAll(images=>images.filter(image=>(image as HTMLImageElement).complete).map(image=>{
    const item=image as HTMLImageElement;
    return {url:new URL(item.currentSrc||item.src).pathname,width:item.naturalWidth,height:item.naturalHeight,decodedBytes:item.naturalWidth*item.naturalHeight*4};
  }));
  const liveDecodedBytes=liveImages.reduce((sum,image)=>sum+image.decodedBytes,0);
  const metrics={
    schemaVersion:1,
    measuredAt:new Date().toISOString(),
    build:'production-preview',
    viewport:'1366x768',
    startup,
    setupInteraction:{samplesMs:interactionSamples.map(value=>Math.round(value*10)/10),medianMs:Math.round(median(interactionSamples)*10)/10},
    imageMemory:{activeScreenDecodedBytes:liveDecodedBytes,activeImages:liveImages,maximumApparatus},
    budgets,
  };
  const checks={
    startupTransfer:startup.encodedBytes<=budgets.startupEncodedBytes,
    noEagerRoundArtwork:startup.roundArtworkRequests<=budgets.startupRoundArtworkRequests,
    interactionLatency:metrics.setupInteraction.medianMs<=budgets.setupInteractionMedianMs,
    apparatusMemory:maximumApparatus.decodedBytes<=budgets.maximumSingleApparatusDecodedBytes,
    activeImageMemory:liveDecodedBytes<=budgets.maximumActiveImageDecodedBytes,
  };
  const certification={...metrics,checks,status:Object.values(checks).every(Boolean)?'PASS':'FAIL'};
  writeFileSync(resolve(root,'PERFORMANCE-CERTIFICATION.json'),`${JSON.stringify(certification,null,2)}\n`,'utf8');
  console.log(`Performance certification ${certification.status}: ${startup.encodedBytes.toLocaleString('en-GB')} startup bytes, ${metrics.setupInteraction.medianMs} ms median setup response, ${(liveDecodedBytes/1024/1024).toFixed(1)} MiB active decoded images.`);
  if(certification.status!=='PASS') process.exitCode=1;
}finally{
  await browser?.close();
  server.kill();
}
