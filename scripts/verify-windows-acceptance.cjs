const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'..','WINDOWS-ACCEPTANCE.csv');
const lines=fs.readFileSync(file,'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);
const requiredTrue=[2,4,5,6,7,8,9,10,11,12,13];
const valid=lines.filter(line=>{
  const cells=line.split(',').map(value=>value.trim());
  return cells.length>=17&&cells[0]&&cells[1]&&cells[3]==='Valid'&&requiredTrue.every(index=>cells[index].toLowerCase()==='true')&&cells[14]&&/^\d{4}-\d{2}-\d{2}$/.test(cells[15]);
});
if(valid.length<3||new Set(valid.map(line=>line.split(',')[0])).size<3){
  console.error('Windows acceptance is incomplete: three unique clean machines with valid signatures and every lifecycle check are required.');
  process.exit(1);
}
console.log(`Windows acceptance passed for ${valid.length} clean machines.`);
