import storageKeys from '../../electron/storage-keys.json';

export interface BureauStorageSnapshot {
  version: 1;
  exportedAt: number;
  values: Record<string, string>;
}

export const captureStorageSnapshot = (): BureauStorageSnapshot => ({
  version: 1,
  exportedAt: Date.now(),
  values: Object.fromEntries(storageKeys.flatMap(key => {
    const value = localStorage.getItem(key);
    return value === null ? [] : [[key, value]];
  }))
});

export const applyStorageSnapshot = (snapshot: BureauStorageSnapshot | null, overwrite = false): number => {
  if (!snapshot || snapshot.version !== 1 || typeof snapshot.values !== 'object') return 0;
  const allowed = new Set<string>(storageKeys);
  let imported = 0;
  for (const [key, value] of Object.entries(snapshot.values)) {
    if (!allowed.has(key) || typeof value !== 'string' || (!overwrite && localStorage.getItem(key) !== null)) continue;
    localStorage.setItem(key, value);
    imported += 1;
  }
  return imported;
};

export const downloadStorageSnapshot = () => {
  const blob = new Blob([JSON.stringify(captureStorageSnapshot(), null, 2)], { type:'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'bureau-storage-export.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
};

export const initialiseDesktopStorage = async () => {
  if (!window.bureauDesktop) return;
  const snapshot = await window.bureauDesktop.loadStorageSnapshot();
  applyStorageSnapshot(snapshot, false);
  const synchronise = () => window.bureauDesktop?.saveStorageSnapshot(captureStorageSnapshot());
  synchronise();
  window.addEventListener('pagehide', synchronise);
  window.setInterval(synchronise, 5_000);
};
