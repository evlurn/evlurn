const {spawnSync}=require('node:child_process');
const path=require('node:path');
const result=spawnSync(process.execPath,['--test','test/security.test.cjs'],{cwd:path.resolve(__dirname,'../apostas-virtuais'),stdio:'inherit'});
process.exitCode=result.status??1;
