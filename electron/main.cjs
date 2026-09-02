const { app, BrowserWindow, dialog, ipcMain, Menu, protocol, session } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');
const fs = require('node:fs');
const { readStorageSnapshot, writeStorageSnapshot } = require('./storage.cjs');
const { appendDiagnostic, buildSupportBundle } = require('./diagnostics.cjs');
const { createUpdaterController, loadUpdateChannel } = require('./updater.cjs');

let mainWindow;
let assessmentActive = false;
let quitConfirmed = false;
let quitPromptOpen = false;
let recoveryPromptOpen = false;
let updaterController;
const developmentUrl = process.env.BUREAU_DEV_URL;
const e2eUserDataDirectory = process.env.NODE_ENV === 'test' ? process.env.BUREAU_E2E_USER_DATA_DIR : undefined;
if (e2eUserDataDirectory) app.setPath('userData', path.resolve(e2eUserDataDirectory));

protocol.registerSchemesAsPrivileged([{ scheme:'bureau', privileges:{ standard:true, secure:true, supportFetchAPI:true, corsEnabled:true } }]);

const userDataFile = name => path.join(app.getPath('userData'), name);
const storageFile = () => userDataFile('bureau-storage-v1.json');
const legacyStorageFile = () => path.join(app.getPath('appData'), 'The Bureau', 'bureau-storage-v1.json');
const windowStateFile = () => userDataFile('window-state-v1.json');
const crashLogFile = () => userDataFile('bureau-crash.log');
const updateChannelFile = () => path.resolve(__dirname, '..', 'UPDATE-CHANNEL.json');

const readJson = (filePath, fallback) => {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
};
const writeJsonAtomic = (filePath, value) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive:true });
    const temporary = `${filePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(temporary, filePath);
  } catch { /* window preferences must never block launch */ }
};
const appendCrashLog = details => {
  appendDiagnostic(crashLogFile(), details.type ?? 'desktop-error', details);
};

process.on('uncaughtException', error => appendDiagnostic(crashLogFile(), 'uncaught-exception', error));
process.on('unhandledRejection', reason => appendDiagnostic(crashLogFile(), 'unhandled-rejection', reason));

const loadWindowState = () => {
  const state = readJson(windowStateFile(), {});
  return {
    width: Number.isFinite(state.width) ? Math.max(1024, state.width) : 1600,
    height: Number.isFinite(state.height) ? Math.max(720, state.height) : 900,
    x: Number.isFinite(state.x) ? state.x : undefined,
    y: Number.isFinite(state.y) ? state.y : undefined,
    maximized: state.maximized === true,
    fullscreen: state.fullscreen === true
  };
};
const saveWindowState = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const bounds = mainWindow.getNormalBounds();
  writeJsonAtomic(windowStateFile(), { ...bounds, maximized:mainWindow.isMaximized(), fullscreen:mainWindow.isFullScreen() });
};

const registerAppProtocol = () => {
  const root = path.resolve(__dirname, '..', 'dist');
  protocol.registerFileProtocol('bureau', (request, callback) => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== 'app') return callback({ error:-10 });
      const requested = decodeURIComponent(url.pathname);
      const candidate = path.resolve(root, `.${requested === '/' ? '/index.html' : requested}`);
      const relative = path.relative(root, candidate);
      const isInside = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
      const safePath = isInside && fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(root, 'index.html');
      callback({ path:safePath });
    } catch { callback({ error:-6 }); }
  });
};

const requestQuitConfirmation = async () => {
  if (!assessmentActive || quitConfirmed || !mainWindow || mainWindow.isDestroyed()) { quitConfirmed = true; app.quit(); return; }
  if (quitPromptOpen) return;
  quitPromptOpen = true;
  const result = await dialog.showMessageBox(mainWindow, {
    type:'question', title:'Leave the Bureau?',
    message:'An assessment is still active.',
    detail:'The latest filed state and a desktop recovery copy will remain available on the next launch.',
    buttons:['Keep playing','Quit safely'], cancelId:0, defaultId:0, noLink:true
  });
  quitPromptOpen = false;
  if (result.response === 1) { quitConfirmed = true; saveWindowState(); app.quit(); }
};

const promptForRendererRecovery = async details => {
  appendCrashLog(details);
  if (recoveryPromptOpen || !mainWindow || mainWindow.isDestroyed()) return;
  recoveryPromptOpen = true;
  const result = await dialog.showMessageBox(mainWindow, {
    type:'error', title:'Bureau filing interruption',
    message:'The assessment display stopped unexpectedly.',
    detail:'The most recent local and desktop recovery records remain intact.',
    buttons:['Reload saved assessment','Close Bureau'], defaultId:0, cancelId:1, noLink:true
  });
  recoveryPromptOpen = false;
  if (result.response === 0 && !mainWindow.isDestroyed()) mainWindow.reload();
  else { quitConfirmed = true; app.quit(); }
};

const createWindow = async () => {
  const state = loadWindowState();
  const icon = path.resolve(__dirname, '..', 'build', 'icon.ico');
  mainWindow = new BrowserWindow({
    width:state.width, height:state.height, x:state.x, y:state.y,
    minWidth:1024, minHeight:720, show:false, backgroundColor:'#d7c79d', autoHideMenuBar:true,
    icon:fs.existsSync(icon) ? icon : undefined,
    webPreferences:{
      preload:path.join(__dirname, 'preload.cjs'), contextIsolation:true, nodeIntegration:false,
      sandbox:true, devTools:Boolean(developmentUrl), spellcheck:false
    }
  });
  mainWindow.setFullScreen(state.fullscreen);
  if (state.maximized && !state.fullscreen) mainWindow.maximize();
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('close', event => {
    saveWindowState();
    if (assessmentActive && !quitConfirmed) { event.preventDefault(); void requestQuitConfirmation(); }
  });
  mainWindow.on('unresponsive', () => void promptForRendererRecovery({ type:'unresponsive' }));
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason !== 'clean-exit') void promptForRendererRecovery({ type:'render-process-gone', ...details });
  });
  mainWindow.webContents.on('will-navigate', (event, target) => {
    const permitted = developmentUrl ? target.startsWith(developmentUrl) : target.startsWith('bureau://app/');
    if (!permitted) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') { event.preventDefault(); mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
  });
  if (developmentUrl) await mainWindow.loadURL(developmentUrl);
  else await mainWindow.loadURL('bureau://app/index.html');
};

ipcMain.handle('bureau:toggle-fullscreen', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
  saveWindowState();
  return mainWindow.isFullScreen();
});
ipcMain.on('bureau:assessment-active', (_event, active) => { assessmentActive = Boolean(active); });
ipcMain.handle('bureau:storage-load', () => {
  const primary = readStorageSnapshot(storageFile());
  if (primary) return primary;
  const legacy = readStorageSnapshot(legacyStorageFile());
  if (legacy) {
    writeStorageSnapshot(storageFile(), legacy);
    return legacy;
  }
  const portableDirectory = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath);
  const portableImport = path.join(portableDirectory, 'bureau-storage-export.json');
  const imported = readStorageSnapshot(portableImport);
  if (imported) writeStorageSnapshot(storageFile(), imported);
  return imported;
});
ipcMain.on('bureau:storage-save', (_event, snapshot) => { writeStorageSnapshot(storageFile(), snapshot); });
ipcMain.handle('bureau:storage-export', async (_event, snapshot) => {
  const result = await dialog.showSaveDialog(mainWindow, { title:'Export Bureau recovery file', defaultPath:path.join(app.getPath('documents'), 'bureau-storage-export.json'), filters:[{name:'Bureau recovery file',extensions:['json']}] });
  return result.canceled || !result.filePath ? false : writeStorageSnapshot(result.filePath, snapshot);
});
ipcMain.handle('bureau:storage-import', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { title:'Import Bureau web save', properties:['openFile'], filters:[{name:'Bureau recovery file',extensions:['json']}] });
  if (result.canceled || !result.filePaths[0]) return null;
  const snapshot = readStorageSnapshot(result.filePaths[0]);
  if (snapshot) writeStorageSnapshot(storageFile(), snapshot);
  return snapshot;
});
ipcMain.handle('bureau:distribution-status', () => updaterController?.getStatus() ?? { state:'UNAVAILABLE', appVersion:app.getVersion(), channel:'stable', availableVersion:null, progress:null, message:'Updates are unavailable in this build.' });
ipcMain.handle('bureau:update-check', () => updaterController?.check());
ipcMain.handle('bureau:update-download', () => updaterController?.download());
ipcMain.handle('bureau:update-install', async () => {
  if (!updaterController || updaterController.getStatus().state !== 'READY') return false;
  if (assessmentActive) {
    const result=await dialog.showMessageBox(mainWindow,{type:'question',title:'Install Bureau update?',message:'An assessment is still active.',detail:'The recovery record will remain available, but installation closes the Bureau.',buttons:['Keep playing','Install update'],defaultId:0,cancelId:0,noLink:true});
    if (result.response!==1) return false;
  }
  quitConfirmed=true;
  updaterController.install();
  return true;
});
ipcMain.handle('bureau:support-export', async () => {
  const result=await dialog.showSaveDialog(mainWindow,{title:'Export Bureau support bundle',defaultPath:path.join(app.getPath('documents'),`bureau-support-${app.getVersion()}.json`),filters:[{name:'Bureau support bundle',extensions:['json']}]});
  if (result.canceled||!result.filePath) return false;
  const distribution=process.env.PORTABLE_EXECUTABLE_DIR?'portable':app.isPackaged?'installer':'development';
  const bundle=buildSupportBundle({appVersion:app.getVersion(),electronVersion:process.versions.electron,platform:process.platform,arch:process.arch,packaged:app.isPackaged,distribution,updateStatus:updaterController?.getStatus()??{state:'UNAVAILABLE'},crashLogPath:crashLogFile()});
  try { fs.writeFileSync(result.filePath,`${JSON.stringify(bundle,null,2)}\n`,'utf8');return true; } catch { return false; }
});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.setAppUserModelId('uk.co.questionableknowledge.bureau');
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
  app.on('before-quit', event => { if (assessmentActive && !quitConfirmed) { event.preventDefault(); void requestQuitConfirmation(); } else saveWindowState(); });
  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    registerAppProtocol();
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    await createWindow();
    updaterController=createUpdaterController({autoUpdater,channel:loadUpdateChannel(updateChannelFile()),appVersion:app.getVersion(),packaged:app.isPackaged,publish:status=>mainWindow?.webContents.send('bureau:distribution-status',status)});
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
}
