// Run with application stopped and a verified backup. Never logs credentials.
const path=require('node:path'),fs=require('node:fs');
const {DatabaseSync}=require('node:sqlite');
const {hashPassword}=require('../apostas-virtuais/src/utils/security');
const password=process.env.NEW_ADMIN_PASSWORD;
if(!password||password.trim().length<12)throw Error('Defina NEW_ADMIN_PASSWORD com pelo menos 12 caracteres.');
const filename=path.join(process.env.DATABASE_DIR?path.resolve(process.env.DATABASE_DIR):path.resolve(__dirname,'../apostas-virtuais/data'),'database.sqlite');
if(!fs.existsSync(filename))throw Error('Banco existente não encontrado.');
const db=new DatabaseSync(filename);
try{
 const user=db.prepare('SELECT id FROM usuarios WHERE apelido = ? AND admin = 1').get(process.env.ADMIN_USERNAME||'admin');
 if(!user)throw Error('Administrador não encontrado.');
 db.exec('BEGIN IMMEDIATE');
 db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(hashPassword(password),user.id);
 db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(user.id);
 db.exec('COMMIT');console.log('Senha administrativa atualizada; sessões revogadas.');
}catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}finally{db.close();}
