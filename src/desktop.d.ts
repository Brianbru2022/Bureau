type BureauUpdateState = 'UNAVAILABLE' | 'IDLE' | 'CHECKING' | 'CURRENT' | 'AVAILABLE' | 'DOWNLOADING' | 'READY' | 'ERROR';
interface BureauDistributionStatus {
  state: BureauUpdateState;
  appVersion: string;
  channel: string;
  availableVersion: string | null;
  progress: number | null;
  message: string;
}
interface BureauDesktopApi {
  toggleFullscreen: () => Promise<boolean>;
  setAssessmentActive: (active: boolean) => void;
  loadStorageSnapshot: () => Promise<import('./game/storageSnapshot').BureauStorageSnapshot | null>;
  saveStorageSnapshot: (snapshot: import('./game/storageSnapshot').BureauStorageSnapshot) => void;
  exportStorageSnapshot: (snapshot: import('./game/storageSnapshot').BureauStorageSnapshot) => Promise<boolean>;
  importStorageSnapshot: () => Promise<import('./game/storageSnapshot').BureauStorageSnapshot | null>;
  getDistributionStatus: () => Promise<BureauDistributionStatus>;
  checkForUpdates: () => Promise<BureauDistributionStatus>;
  downloadUpdate: () => Promise<BureauDistributionStatus>;
  installUpdate: () => Promise<boolean>;
  exportSupportBundle: () => Promise<boolean>;
  onDistributionStatus: (listener: (status: BureauDistributionStatus) => void) => () => void;
  platform: 'windows';
}

interface Window { bureauDesktop?: BureauDesktopApi; }
