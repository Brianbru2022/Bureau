const fs = require('node:fs');

const loadUpdateChannel = filePath => {
  try {
    const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const validUrl = typeof value.feedUrl === 'string' && /^https:\/\//i.test(value.feedUrl);
    return {
      channel:typeof value.channel === 'string' ? value.channel : 'stable',
      enabled:value.enabled === true && validUrl,
      feedUrl:validUrl ? value.feedUrl : null,
      allowSignedRollback:value.allowSignedRollback === true,
    };
  } catch { return { channel:'stable', enabled:false, feedUrl:null, allowSignedRollback:false }; }
};

const createUpdaterController = ({ autoUpdater, channel, appVersion, packaged, publish }) => {
  let status = { state:channel.enabled && packaged ? 'IDLE' : 'UNAVAILABLE', appVersion, channel:channel.channel, availableVersion:null, progress:null, message:channel.enabled && packaged ? 'Ready to check for updates.' : 'Updates are unavailable in this build.' };
  const emit = update => { status={...status,...update};publish(status); };
  if (channel.enabled && packaged) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = channel.allowSignedRollback;
    autoUpdater.channel = channel.channel;
    autoUpdater.setFeedURL({ provider:'generic', url:channel.feedUrl, channel:channel.channel });
    autoUpdater.on('checking-for-update', () => emit({state:'CHECKING',message:'Consulting the signed update register.'}));
    autoUpdater.on('update-available', info => emit({state:'AVAILABLE',availableVersion:info.version,message:`Version ${info.version} is available.`}));
    autoUpdater.on('update-not-available', () => emit({state:'CURRENT',message:'This installation is current.'}));
    autoUpdater.on('download-progress', progress => emit({state:'DOWNLOADING',progress:Math.round(progress.percent),message:`Downloading update: ${Math.round(progress.percent)}%.`}));
    autoUpdater.on('update-downloaded', info => emit({state:'READY',availableVersion:info.version,progress:100,message:`Version ${info.version} is ready to install.`}));
    autoUpdater.on('error', error => emit({state:'ERROR',message:`Update check failed: ${error.message}`}));
  }
  return {
    getStatus:() => status,
    check:async () => {
      if (!channel.enabled || !packaged) return status;
      try { await autoUpdater.checkForUpdates(); } catch (error) { emit({state:'ERROR',message:`Update check failed: ${error.message}`}); }
      return status;
    },
    download:async () => {
      if (status.state !== 'AVAILABLE') return status;
      try { await autoUpdater.downloadUpdate(); } catch (error) { emit({state:'ERROR',message:`Update download failed: ${error.message}`}); }
      return status;
    },
    install:() => { if (status.state === 'READY') autoUpdater.quitAndInstall(false, true); },
  };
};

module.exports = { createUpdaterController, loadUpdateChannel };
