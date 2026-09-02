const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { EventEmitter } = require('node:events');
const { appendDiagnostic, buildSupportBundle } = require('./diagnostics.cjs');
const { createUpdaterController, loadUpdateChannel } = require('./updater.cjs');

test('update channels reject disabled and non-HTTPS feeds', () => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'bureau-channel-'));
  try {
    const file=path.join(directory,'channel.json');
    fs.writeFileSync(file,JSON.stringify({enabled:true,feedUrl:'http://unsafe.invalid',channel:'beta'}));
    assert.deepEqual(loadUpdateChannel(file),{channel:'beta',enabled:false,feedUrl:null,allowSignedRollback:false});
  } finally { fs.rmSync(directory,{recursive:true,force:true}); }
});

test('updater reports availability, download progress and install readiness', async () => {
  class FakeUpdater extends EventEmitter {
    setFeedURL(value){this.feed=value;}
    async checkForUpdates(){this.emit('update-available',{version:'1.1.0'});}
    async downloadUpdate(){this.emit('download-progress',{percent:42});this.emit('update-downloaded',{version:'1.1.0'});}
    quitAndInstall(){this.installed=true;}
  }
  const autoUpdater=new FakeUpdater();
  const statuses=[];
  const controller=createUpdaterController({autoUpdater,channel:{enabled:true,feedUrl:'https://updates.example.test/windows',channel:'stable',allowSignedRollback:true},appVersion:'1.0.0',packaged:true,publish:status=>statuses.push(status)});
  await controller.check();
  assert.equal(controller.getStatus().state,'AVAILABLE');
  await controller.download();
  assert.equal(controller.getStatus().state,'READY');
  controller.install();
  assert.equal(autoUpdater.installed,true);
  assert.equal(autoUpdater.allowDowngrade,true);
  assert.ok(statuses.length>=3);
});

test('support bundles omit recovery and candidate data while retaining crash evidence', () => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'bureau-support-'));
  try {
    const log=path.join(directory,'crash.log');
    appendDiagnostic(log,'test-crash',new Error('simulated'));
    const bundle=buildSupportBundle({appVersion:'1.0.0',electronVersion:'44',platform:'win32',arch:'x64',packaged:true,distribution:'installer',updateStatus:{state:'CURRENT'},crashLogPath:log});
    assert.equal(bundle.privacy.candidateNamesIncluded,false);
    assert.equal(bundle.privacy.recoveryDataIncluded,false);
    assert.match(bundle.crashLogTail,/simulated/);
  } finally { fs.rmSync(directory,{recursive:true,force:true}); }
});
