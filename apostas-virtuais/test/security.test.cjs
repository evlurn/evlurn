const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const app=path.resolve(__dirname,'..');
const scratch=path.resolve(app,'../.audit-work');fs.mkdirSync(scratch,{recursive:true});
const secret=crypto.randomBytes(24).toString('hex');
function env(dir,extra={}){return {...process.env,NODE_ENV:'test',RAILWAY_ENVIRONMENT:'',ADMIN_PASSWORD:secret,DATABASE_DIR:dir,HOST:'127.0.0.1',PORT:'0',TRUSTED_PROXY_IPS:'',...extra};}
function dir(){return fs.mkdtempSync(path.join(scratch,'security-'));}
async function start(data,extra={}){
 const code=`const http=require('node:http');const listen=http.Server.prototype.listen;http.Server.prototype.listen=function(...args){this.once('listening',()=>process.send({port:this.address().port}));return listen.apply(this,args);};require('./server');`;
 const child=spawn(process.execPath,['-e',code],{cwd:app,env:env(data,extra),windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
 const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('startup timeout'));},10000);child.once('message',m=>{clearTimeout(timer);resolve(m.port)});child.once('exit',()=>{clearTimeout(timer);reject(Error('startup failed'))});});
 return {async stop(){const stopped=new Promise(r=>child.once('exit',r));child.kill();await stopped;},async req(url,body,cookie,headers={}){const r=await fetch(`http://127.0.0.1:${port}${url}`,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],headers:r.headers,body:await r.json().catch(()=>null)};}};
}
test('bootstrap rejects absent and weak credentials, including Railway',()=>{
 for(const extra of [{NODE_ENV:'production',ADMIN_PASSWORD:''},{NODE_ENV:'production',ADMIN_PASSWORD:'short'},{RAILWAY_ENVIRONMENT:'test',ADMIN_PASSWORD:''},{ADMIN_PASSWORD:''}]){
  const result=spawnSync(process.execPath,['-e',"require('./src/db')"],{cwd:app,env:env(dir(),extra)});assert.notEqual(result.status,0);
 }
});
test('static files cannot escape through sibling prefix or encoded Windows separator',()=>{
 const {criarServidorEstatico}=require('../src/http');const base=dir();const pub=path.join(base,'public');fs.mkdirSync(pub);fs.mkdirSync(pub+'-private');fs.writeFileSync(path.join(pub+'-private','secret.txt'),'private');
 for(const input of ['/../public-private/secret.txt','/..\\public-private\\secret.txt']){let result='';const res={statusCode:200,end:s=>result=s,setHeader(){}};criarServidorEstatico(pub)({},res,input);assert.equal(res.statusCode,403);assert.notEqual(result,'private');}
});
test('security, persistence and member workflows',async t=>{
 const data=dir();let server=await start(data);
 try{
 let admin,member;
 await t.test('public pages and persistent directory',async()=>{assert.equal((await server.req('/')).status,200);assert.ok(fs.existsSync(path.join(data,'database.sqlite')));});
 await t.test('anonymous cannot access admin',async()=>assert.equal((await server.req('/api/admin/dashboard')).status,401));
 await t.test('admin can authenticate',async()=>{const r=await server.req('/api/auth/login',{apelido:'admin',senha:secret});assert.equal(r.status,200);admin=r.cookie;assert.match(r.headers.get('set-cookie'),/HttpOnly/);});
 await t.test('pending user must be approved, member cannot access admin',async()=>{
  assert.equal((await server.req('/api/auth/register',{nome:'Test Member',apelido:'member',senha:secret,confirmarSenha:secret})).status,201);
  assert.equal((await server.req('/api/auth/login',{apelido:'member',senha:secret})).status,403);
  assert.equal((await server.req('/api/admin/pendentes/2/aprovar',{},admin)).status,200);
  const r=await server.req('/api/auth/login',{apelido:'member',senha:secret});assert.equal(r.status,200);member=r.cookie;
  assert.equal((await server.req('/api/admin/dashboard',null,member)).status,403);
 });
 await t.test('trivia reward is paid only once; invalid answers rejected',async()=>{
  const q=(await server.req('/api/trivia/hoje',null,member)).body;
  assert.equal((await server.req('/api/trivia/responder',{id:q.id,resposta:99},member)).status,400);
  assert.equal((await server.req('/api/trivia/responder',{id:q.id,resposta:0},member)).status,200);
  assert.equal((await server.req('/api/trivia/responder',{id:q.id,resposta:0},member)).status,409);
 });
 await t.test('restart preserves users, sessions and trivia claim',async()=>{
  await server.stop();server=await start(data);
  assert.equal((await server.req('/api/auth/me',null,member)).status,200);
  const q=(await server.req('/api/trivia/hoje',null,member)).body;
  assert.equal((await server.req('/api/trivia/responder',{id:q.id,resposta:0},member)).status,409);
 });
 await t.test('password change invalidates all member sessions',async()=>{
  const other=(await server.req('/api/auth/login',{apelido:'member',senha:secret})).cookie;
  assert.equal((await server.req('/api/conta/alterar-senha',{senhaAtual:secret,novaSenha:secret+'x',confirmarNovaSenha:secret+'x'},member)).status,200);
  assert.equal((await server.req('/api/auth/me',null,member)).status,401);assert.equal((await server.req('/api/auth/me',null,other)).status,401);
 });
 await t.test('forwarded header cannot bypass direct-access rate limit',async()=>{
  for(let i=0;i<11;i++)await server.req('/api/auth/login',{apelido:'missing',senha:secret});
  assert.equal((await server.req('/api/auth/login',{apelido:'missing',senha:secret},null,{'x-forwarded-for':'192.0.2.1'})).status,429);
 });
 }finally{await server.stop();}
});
test('production cookies are Secure with explicit credentials',async()=>{const s=await start(dir(),{NODE_ENV:'production'});try{const r=await s.req('/api/auth/login',{apelido:'admin',senha:secret});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/Secure/);}finally{await s.stop();}});
test('legacy admin credential blocks production; rotation preserves account and revokes sessions',()=>{
 const data=dir();
 const seed=spawnSync(process.execPath,['-e',"const {db}=require('./src/db'); const {hashPassword}=require('./src/utils/security'); db.prepare('UPDATE usuarios SET senha_hash = ? WHERE admin = 1').run(hashPassword('admin123')); require('./src/sessions').criarSessao(1); db.close();"],{cwd:app,env:env(data)});assert.equal(seed.status,0);
 const blocked=spawnSync(process.execPath,['-e',"require('./src/db')"],{cwd:app,env:env(data,{NODE_ENV:'production'})});assert.notEqual(blocked.status,0);
 const rotate=spawnSync(process.execPath,['../scripts/rotate-admin.cjs'],{cwd:app,env:env(data,{NEW_ADMIN_PASSWORD:secret+'rotated'})});assert.equal(rotate.status,0);
 const verified=spawnSync(process.execPath,['-e',"const assert=require('node:assert/strict');const {db}=require('./src/db');assert.equal(db.prepare('SELECT count(*) AS n FROM sessoes').get().n,0);assert.equal(db.prepare('SELECT count(*) AS n FROM usuarios').get().n,1);db.close();"],{cwd:app,env:env(data,{NODE_ENV:'production'})});assert.equal(verified.status,0);
});
test('excluded accounts cannot log in or reuse sessions',async()=>{
 const data=dir();const s=await start(data);
 try{const login=await s.req('/api/auth/login',{apelido:'admin',senha:secret});
 const changed=spawnSync(process.execPath,['-e',"const {db}=require('./src/db');db.prepare(\"UPDATE usuarios SET status = 'excluido' WHERE id = 1\").run();db.close();"],{cwd:app,env:env(data)});assert.equal(changed.status,0);
 assert.equal((await s.req('/api/auth/me',null,login.cookie)).status,401);
 assert.equal((await s.req('/api/auth/login',{apelido:'admin',senha:secret})).status,403);
 }finally{await s.stop();}
});
test('trusted proxy stops at first untrusted hop rather than spoofed leftmost entry',()=>{
 const code="const assert=require('node:assert/strict');const {identificarUsuario}=require('./src/middleware');const r={headers:{'x-forwarded-for':'203.0.113.5, 192.0.2.20'},socket:{remoteAddress:'::ffff:127.0.0.1'}};identificarUsuario(r);assert.equal(r.ip,'192.0.2.20');";
 const result=spawnSync(process.execPath,['-e',code],{cwd:app,env:env(dir(),{TRUSTED_PROXY_IPS:'127.0.0.1'})});assert.equal(result.status,0);
});
