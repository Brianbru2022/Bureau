const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root=path.resolve(__dirname,'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const release=path.join(root,pkg.build.directories.output);
const channelRoot=path.join(release,'channel','stable');
const versionsRoot=path.join(channelRoot,'versions');
const rollback=process.argv.find(arg=>arg.startsWith('--rollback='))?.split('=')[1];
const copy=(source,destination)=>{if(!fs.existsSync(source))throw new Error(`Missing update-channel input: ${path.relative(root,source)}`);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);};
const requireValidSignature=file=>{
  const result=spawnSync('pwsh.exe',['-NoProfile','-NonInteractive','-Command',`(Get-AuthenticodeSignature -LiteralPath $env:BUREAU_CHANNEL_EXE).Status.ToString()`],{encoding:'utf8',env:{...process.env,BUREAU_CHANNEL_EXE:file}});
  if(result.status!==0||result.stdout.trim()!=='Valid') throw new Error(`Update channel refuses an unsigned or invalid installer: ${path.basename(file)}`);
};

if (rollback) {
  const source=path.join(versionsRoot,rollback);
  if (!path.resolve(source).startsWith(path.resolve(versionsRoot)+path.sep)) throw new Error('Invalid rollback version.');
  const rollbackInstaller=fs.readdirSync(source).find(file=>file.endsWith('-setup-x64.exe'));
  if(!rollbackInstaller) throw new Error(`Retained version ${rollback} has no installer.`);
  requireValidSignature(path.join(source,rollbackInstaller));
  for(const file of fs.readdirSync(source)) copy(path.join(source,file),path.join(channelRoot,file));
  console.log(`Stable update channel rolled back to retained signed version ${rollback}.`);
  process.exit(0);
}

const installer=`Bureau-of-Questionable-Knowledge-${pkg.version}-setup-x64.exe`;
requireValidSignature(path.join(release,installer));
const files=['stable.yml',installer,`${installer}.blockmap`];
const versionRoot=path.join(versionsRoot,pkg.version);
for(const file of files){copy(path.join(release,file),path.join(versionRoot,file));copy(path.join(release,file),path.join(channelRoot,file));}
const historyPath=path.join(channelRoot,'history.json');
const history=fs.existsSync(historyPath)?JSON.parse(fs.readFileSync(historyPath,'utf8')):{schemaVersion:1,channel:'stable',versions:[]};
const hash=createHash('sha256').update(fs.readFileSync(path.join(release,installer))).digest('hex').toUpperCase();
history.currentVersion=pkg.version;
history.updatedAt=new Date().toISOString();
history.versions=[{version:pkg.version,installer,sha256:hash},...history.versions.filter(item=>item.version!==pkg.version)];
fs.writeFileSync(historyPath,`${JSON.stringify(history,null,2)}\n`,'utf8');
console.log(`Staged ${pkg.version} in release/channel/stable with rollback history.`);
