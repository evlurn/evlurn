// Local review only: disposable database and automatic access to a test member.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
if(process.env.NODE_ENV==='production'||process.env.RAILWAY_ENVIRONMENT)throw Error('Preview is local only.');
const root=path.resolve(__dirname,'../apostas-virtuais');
const scratch=path.resolve(__dirname,'../.audit-work');fs.mkdirSync(scratch,{recursive:true});
process.env.NODE_ENV='test';process.env.HOST='127.0.0.1';process.env.PORT='4173';
process.env.ADMIN_PASSWORD=crypto.randomBytes(32).toString('hex');
process.env.DATABASE_DIR=fs.mkdtempSync(path.join(scratch,'preview-'));
process.env.TRUSTED_PROXY_IPS='';
const {db}=require(path.join(root,'src/db'));
const {hashPassword}=require(path.join(root,'src/utils/security'));
const result=db.prepare("INSERT INTO usuarios (nome,apelido,senha_hash,saldo,status,data_cadastro,admin) VALUES (?,?,?,?,'ativo',?,0)").run('Visitante de demonstração','visitante',hashPassword(crypto.randomBytes(32).toString('hex')),1000,new Date().toISOString());
const {criarSessao}=require(path.join(root,'src/sessions'));
const http=require('node:http');const create=http.createServer;
http.createServer=function(handler){return create.call(this,(req,res)=>{
 if(!['127.0.0.1:4173','localhost:4173'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
 if(req.url==='/preview'){
  const token=criarSessao(Number(result.lastInsertRowid));
  res.writeHead(303,{'Set-Cookie':`sessao=${token}; HttpOnly; SameSite=Strict; Path=/`,'Location':'/app.html','Cache-Control':'no-store'});res.end();return;
 }
 handler(req,res);
});};
require(path.join(root,'server'));
console.log('Prévia local: http://127.0.0.1:4173/preview — dados descartáveis. Ctrl+C para encerrar.');
