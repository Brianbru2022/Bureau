import React from 'react';
import { Download, PackageCheck, RefreshCw, Upload, Wrench } from 'lucide-react';
import { applyStorageSnapshot, captureStorageSnapshot, downloadStorageSnapshot } from '../../game/storageSnapshot';

export const DesktopDataControls: React.FC = () => {
  const [notice, setNotice] = React.useState('');
  const [distribution, setDistribution] = React.useState<BureauDistributionStatus | null>(null);
  const [maintenanceBusy, setMaintenanceBusy] = React.useState(false);

  React.useEffect(() => {
    const desktop=window.bureauDesktop;
    if (!desktop) return undefined;
    void desktop.getDistributionStatus().then(setDistribution);
    return desktop.onDistributionStatus(setDistribution);
  }, []);
  const exportData = async () => {
    if (window.bureauDesktop) {
      const saved = await window.bureauDesktop.exportStorageSnapshot(captureStorageSnapshot());
      setNotice(saved ? 'Recovery file exported.' : 'Export cancelled.');
    } else {
      downloadStorageSnapshot();
      setNotice('Recovery file downloaded.');
    }
  };
  const importData = async () => {
    const snapshot = await window.bureauDesktop?.importStorageSnapshot();
    if (!snapshot) { setNotice('Import cancelled or the file was invalid.'); return; }
    const imported = applyStorageSnapshot(snapshot, true);
    if (!imported) { setNotice('No recognised Bureau records were found.'); return; }
    window.location.reload();
  };
  const runMaintenance = async (action: 'CHECK' | 'DOWNLOAD' | 'INSTALL' | 'SUPPORT') => {
    const desktop=window.bureauDesktop;
    if (!desktop) return;
    setMaintenanceBusy(true);
    try {
      if (action==='CHECK') setDistribution(await desktop.checkForUpdates());
      if (action==='DOWNLOAD') setDistribution(await desktop.downloadUpdate());
      if (action==='INSTALL') await desktop.installUpdate();
      if (action==='SUPPORT') setNotice(await desktop.exportSupportBundle()?'Privacy-safe support bundle exported.':'Support export cancelled.');
    } finally { setMaintenanceBusy(false); }
  };
  const updateAction=distribution?.state==='AVAILABLE'?'DOWNLOAD':distribution?.state==='READY'?'INSTALL':'CHECK';
  const updateLabel=updateAction==='DOWNLOAD'?'Download update':updateAction==='INSTALL'?'Install update':'Check for updates';

  return <details open={Boolean(window.bureauDesktop)} className="mb-4 rounded-xl border-2 border-[#6c4931] bg-[#fff7df]/85 text-left">
    <summary className="cursor-pointer px-3 py-2 font-['Cinzel'] text-xs font-black text-[#244b55]">Recovery and Windows maintenance</summary>
    <div className="space-y-3 border-t-2 border-dashed border-[#b99a64] p-3">
    <div><strong className="font-['Cinzel'] text-xs text-[#244b55]">Save recovery</strong><p className="mt-1 font-['Fraunces'] text-xs text-[#665348]">Export a web save for safekeeping or transfer it into the Windows edition.</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={exportData} className="bureau-button rounded-lg bg-[#376d9b] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"><Download size={13} className="mr-1 inline"/>Export recovery file</button>{window.bureauDesktop ? <button type="button" onClick={importData} className="bureau-button rounded-lg bg-[#4f7457] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white"><Upload size={13} className="mr-1 inline"/>Import web save</button> : null}</div></div>
    {window.bureauDesktop ? <div className="border-t-2 border-dashed border-[#b99a64] pt-3"><strong className="font-['Cinzel'] text-xs text-[#244b55]">Windows maintenance</strong><p aria-live="polite" className="mt-1 font-['Courier_Prime'] text-xs font-bold text-[#665348]">Version {distribution?.appVersion??'checking'} · {distribution?.message??'Reading distribution status.'}</p><div className="mt-2 flex flex-wrap gap-2">{distribution?.state!=='UNAVAILABLE'?<button type="button" disabled={maintenanceBusy||distribution?.state==='CHECKING'||distribution?.state==='DOWNLOADING'} onClick={()=>void runMaintenance(updateAction)} className="bureau-button rounded-lg bg-[#9b5b3f] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white disabled:opacity-45">{updateAction==='INSTALL'?<PackageCheck size={13} className="mr-1 inline"/>:<RefreshCw size={13} className="mr-1 inline"/>}{updateLabel}</button>:null}<button type="button" disabled={maintenanceBusy} onClick={()=>void runMaintenance('SUPPORT')} className="bureau-button rounded-lg bg-[#695779] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-white disabled:opacity-45"><Wrench size={13} className="mr-1 inline"/>Export support bundle</button></div></div>:null}
    {notice ? <p role="status" className="font-['Courier_Prime'] text-xs font-bold text-[#376d9b]">{notice}</p> : null}
    </div>
  </details>;
};
