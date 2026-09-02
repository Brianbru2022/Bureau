const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bureauDesktop', {
  toggleFullscreen: () => ipcRenderer.invoke('bureau:toggle-fullscreen'),
  setAssessmentActive: active => ipcRenderer.send('bureau:assessment-active', Boolean(active)),
  loadStorageSnapshot: () => ipcRenderer.invoke('bureau:storage-load'),
  saveStorageSnapshot: snapshot => ipcRenderer.send('bureau:storage-save', snapshot),
  exportStorageSnapshot: snapshot => ipcRenderer.invoke('bureau:storage-export', snapshot),
  importStorageSnapshot: () => ipcRenderer.invoke('bureau:storage-import'),
  getDistributionStatus: () => ipcRenderer.invoke('bureau:distribution-status'),
  checkForUpdates: () => ipcRenderer.invoke('bureau:update-check'),
  downloadUpdate: () => ipcRenderer.invoke('bureau:update-download'),
  installUpdate: () => ipcRenderer.invoke('bureau:update-install'),
  exportSupportBundle: () => ipcRenderer.invoke('bureau:support-export'),
  onDistributionStatus: listener => {
    const handler = (_event, status) => listener(status);
    ipcRenderer.on('bureau:distribution-status', handler);
    return () => ipcRenderer.removeListener('bureau:distribution-status', handler);
  },
  platform: 'windows',
});
