const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../apostas-virtuais');
const scratch = path.resolve(__dirname, '../.audit-work');
fs.mkdirSync(scratch, {recursive:true});
const results = { runtime: process.version, checks: [], findings: [] };
function check(name, ok) { results.checks.push({ name, passed: !!ok }); }
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
const sourceFiles = files(root);
for (const f of sourceFiles.filter(f=>f.endsWith('.js'))) check('syntax: '+path.relative(root,f), spawnSync(process.execPath,['--check',f]).status === 0);
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json')));
results.dependencies = pkg.dependencies;
results.originalTestScript = pkg.scripts.test || null;
results.sensitiveFiles = sourceFiles.filter(f=> /(?:\.env$|\.(?:sqlite|pem|key)$)/i.test(f)).map(f=>path.relative(root,f));
results.tokenPatternFiles = sourceFiles.filter(f=> /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN .*PRIVATE KEY-----|AKIA[0-9A-Z]{16})/.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(root,f));
async function start(label, adminPassword, production=false) {
  const dir = fs.mkdtempSync(path.join(scratch,'audit-'+label+'-'));
  fs.cpSync(root,dir,{recursive:true});
  const env = {...process.env, NODE_ENV:production?'production':'test', DATABASE_DIR:path.join(dir,'requested-data')};
  delete env.ADMIN_PASSWORD; delete env.RAILWAY_ENVIRONMENT;
  if (adminPassword) env.ADMIN_PASSWORD=adminPassword;
  const boot = `const http=require('node:http');const original=http.Server.prototype.listen;http.Server.prototype.listen=function(port,cb){return original.call(this,0,'127.0.0.1',()=>{console.log('AUDIT_PORT='+this.address().port);if(cb)cb();});};require('./server.js');`;
  const child=spawn(process.execPath,['-e',boot],{cwd:dir,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output=''; child.stderr.on('data',()=>{});
  const port=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{child.kill();reject(Error('Startup timeout'));},15000);
    child.on('exit',()=>{clearTimeout(timeout);reject(Error('Startup failed'));});
    child.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/AUDIT_PORT=(\d+)/);if(m){clearTimeout(timeout);resolve(Number(m[1]));}});
  });
  async function req(url,body,cookie,extra={}) { const r=await fetch(`http://127.0.0.1:${port}${url}`,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...extra},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(5000)}); const text=await r.text();return {status:r.status,headers:r.headers,text}; }
  return {dir,child,req,stop:()=>new Promise(resolve=>{child.once('exit',resolve);child.kill();})};
}
(async()=>{
 const secret=crypto.randomBytes(32).toString('hex');
 const app=await start('smoke',secret);
 try {
  for(const url of ['/','/login.html','/register.html','/conheca.html','/seja-criador.html']) check('public '+url,(await app.req(url)).status===200);
  check('admin rejects anonymous',(await app.req('/api/admin/dashboard')).status===401);
  check('me rejects anonymous',(await app.req('/api/auth/me')).status===401);
  const login=await app.req('/api/auth/login',{apelido:'admin',senha:secret});
  check('configured admin login',login.status===200);
  const cookie=login.headers.get('set-cookie')?.split(';')[0];
  check('cookie HttpOnly and SameSite',/HttpOnly/.test(login.headers.get('set-cookie')) && /SameSite=Strict/.test(login.headers.get('set-cookie')));
  check('admin dashboard',(await app.req('/api/admin/dashboard',null,cookie)).status===200);
  check('register',(await app.req('/api/auth/register',{nome:'Audit User',apelido:'audit-user',senha:secret,confirmarSenha:secret})).status===201);
  check('pending login blocked',(await app.req('/api/auth/login',{apelido:'audit-user',senha:secret})).status===403);
  await app.req('/api/auth/logout',{},cookie);
  check('logout invalidates session',(await app.req('/api/auth/me',null,cookie)).status===401);
  for(let i=0;i<10;i++) await app.req('/api/auth/login',{apelido:'absent',senha:secret});
  check('login throttled',(await app.req('/api/auth/login',{apelido:'absent',senha:secret})).status===429);
  const bypass=await app.req('/api/auth/login',{apelido:'absent',senha:secret},null,{'x-forwarded-for':'192.0.2.10'});
  results.findings.push({name:'Untrusted forwarded header bypasses direct-access rate limit',confirmed:bypass.status===401});
  results.findings.push({name:'DATABASE_DIR ignored',confirmed:fs.existsSync(path.join(app.dir,'data/database.sqlite'))&&!fs.existsSync(path.join(app.dir,'requested-data/database.sqlite'))});
 } finally { await app.stop(); }
 const prod=await start('production',null,true);
 try {
  const source=fs.readFileSync(path.join(root,'src/db.js'),'utf8');
  const defaultPassword=source.match(/process\.env\.ADMIN_PASSWORD \|\| '([^']+)'/)[1];
  const login=await prod.req('/api/auth/login',{apelido:'admin',senha:defaultPassword});
  results.findings.push({name:'Production starts and accepts built-in admin password without ADMIN_PASSWORD',confirmed:login.status===200});
  check('production cookie Secure',/Secure/.test(login.headers.get('set-cookie')));
 } finally { await prod.stop(); }
 fs.writeFileSync(path.join(scratch,'audit-results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
})().catch(err=>{console.error(err.message);process.exitCode=1;});

