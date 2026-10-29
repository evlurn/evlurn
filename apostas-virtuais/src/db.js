'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword, verifyPassword } = require('./utils/security');

const production = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
const bootstrapPassword = process.env.ADMIN_PASSWORD;
if (production && (!bootstrapPassword || bootstrapPassword.trim().length < 12)) {
  throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres antes de iniciar em produção.');
}
const DATA_DIR = process.env.DATABASE_DIR?.trim()
  ? path.resolve(process.env.DATABASE_DIR) : path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  apelido TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  data_nascimento TEXT,
  identidade_genero TEXT,
  identidade_genero_outro TEXT,
  indicador_id INTEGER,
  saldo INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 1,
  titulo_ativo TEXT,
  streak_atual INTEGER NOT NULL DEFAULT 0,
  ultimo_login TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_cadastro TEXT NOT NULL,
  admin INTEGER NOT NULL DEFAULT 0,
  beta_participante INTEGER NOT NULL DEFAULT 1,  -- 1 = participou do Beta Privado
  invite_code TEXT UNIQUE,                        -- identificador único de convite (ex: QX72LAF9)
  FOREIGN KEY (indicador_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS rodadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jogo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberta',
  resultado TEXT,
  data_abertura TEXT NOT NULL,
  data_encerramento TEXT,
  criado_por INTEGER,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS apostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  rodada_id INTEGER,
  jogo TEXT NOT NULL,
  escolha TEXT,
  valor INTEGER NOT NULL,
  resultado TEXT,
  ganho INTEGER,
  status TEXT NOT NULL DEFAULT 'pendente',
  data TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  valor INTEGER NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_novo INTEGER NOT NULL,
  motivo TEXT,
  data TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  usuario_afetado INTEGER,
  admin_responsavel INTEGER,
  tipo_acao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  ip TEXT
);

CREATE TABLE IF NOT EXISTS sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  criado_em TEXT NOT NULL,
  expira_em TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS videos_assistidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  iniciado_em TEXT NOT NULL,
  concluido_em TEXT,
  recompensa INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS sugestoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  texto TEXT NOT NULL,
  data TEXT NOT NULL,
  lida INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS titulos_def (
  slug TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL DEFAULT '🏆',
  raridade TEXT NOT NULL DEFAULT 'comum',
  criterio_tipo TEXT NOT NULL,
  criterio_valor INTEGER NOT NULL DEFAULT 1,
  criterio_jogo TEXT
);

CREATE TABLE IF NOT EXISTS usuario_titulos (
  usuario_id INTEGER NOT NULL,
  titulo_slug TEXT NOT NULL,
  data_conquista TEXT NOT NULL,
  PRIMARY KEY (usuario_id, titulo_slug),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS missoes_def (
  slug TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'diaria',
  criterio_tipo TEXT NOT NULL,
  criterio_jogo TEXT,
  criterio_valor INTEGER NOT NULL DEFAULT 1,
  recompensa_moedas INTEGER NOT NULL DEFAULT 50,
  recompensa_xp INTEGER NOT NULL DEFAULT 20,
  ativa INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS missao_progresso (
  usuario_id INTEGER NOT NULL,
  missao_slug TEXT NOT NULL,
  data_ref TEXT NOT NULL,
  progresso INTEGER NOT NULL DEFAULT 0,
  concluida INTEGER NOT NULL DEFAULT 0,
  data_conclusao TEXT,
  PRIMARY KEY (usuario_id, missao_slug, data_ref),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  multiplicador REAL NOT NULL DEFAULT 1.5,
  bonus_fixo INTEGER NOT NULL DEFAULT 0,
  jogos TEXT,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_por INTEGER,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_apostas_rodada ON apostas(rodada_id);
CREATE INDEX IF NOT EXISTS idx_apostas_usuario ON apostas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario ON movimentacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_atividades_usuario ON atividades(usuario_id, data);
CREATE INDEX IF NOT EXISTS idx_videos_usuario ON videos_assistidos(usuario_id, iniciado_em);
`;

db.exec(SCHEMA);

// Migração: colunas demográficas podem não existir em bancos anteriores
const colunasUsuariosV2 = db.prepare('PRAGMA table_info(usuarios)').all().map((c) => c.name);
// Migração: colunas da Sprint 01 (v0.8.1-beta)
if (!colunasUsuariosV2.includes('beta_participante')) {
  db.exec("ALTER TABLE usuarios ADD COLUMN beta_participante INTEGER NOT NULL DEFAULT 1");
}
if (!colunasUsuariosV2.includes('invite_code')) {
  db.exec("ALTER TABLE usuarios ADD COLUMN invite_code TEXT");
  // Gerar invite_code para usuários existentes que ainda não têm
  const semCodigo = db.prepare("SELECT id FROM usuarios WHERE invite_code IS NULL").all();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (const u of semCodigo) {
    let code;
    do {
      const bytes = require('node:crypto').randomBytes(8);
      code = Array.from(bytes).map(b => chars[b % chars.length]).join('');
    } while (db.prepare('SELECT id FROM usuarios WHERE invite_code = ?').get(code));
    db.prepare('UPDATE usuarios SET invite_code = ? WHERE id = ?').run(code, u.id);
  }
}

if (!colunasUsuariosV2.includes('data_nascimento')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN data_nascimento TEXT');
}
if (!colunasUsuariosV2.includes('identidade_genero')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN identidade_genero TEXT');
}
if (!colunasUsuariosV2.includes('identidade_genero_outro')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN identidade_genero_outro TEXT');
}

// Migração: tabela de eventos pode não existir em bancos antigos
const tabelasExistentes = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
if (!tabelasExistentes.includes('eventos')) {
  db.exec(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    multiplicador REAL NOT NULL DEFAULT 1.5,
    bonus_fixo INTEGER NOT NULL DEFAULT 0,
    jogos TEXT,
    data_inicio TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_por INTEGER
  )`);
}

// Migração de bancos existentes: colunas novas em usuarios
const colunasUsuarios = db.prepare('PRAGMA table_info(usuarios)').all().map((c) => c.name);
if (!colunasUsuarios.includes('xp')) db.exec('ALTER TABLE usuarios ADD COLUMN xp INTEGER NOT NULL DEFAULT 0');
if (!colunasUsuarios.includes('nivel')) db.exec('ALTER TABLE usuarios ADD COLUMN nivel INTEGER NOT NULL DEFAULT 1');
if (!colunasUsuarios.includes('titulo_ativo')) db.exec('ALTER TABLE usuarios ADD COLUMN titulo_ativo TEXT');
if (!colunasUsuarios.includes('streak_atual')) db.exec('ALTER TABLE usuarios ADD COLUMN streak_atual INTEGER NOT NULL DEFAULT 0');
if (!colunasUsuarios.includes('ultimo_login')) db.exec('ALTER TABLE usuarios ADD COLUMN ultimo_login TEXT');

const colunasLogs = db.prepare('PRAGMA table_info(logs)').all().map((c) => c.name);
if (!colunasLogs.includes('ip')) db.exec('ALTER TABLE logs ADD COLUMN ip TEXT');

function getConfig(chave, padrao) {
  const row = db.prepare('SELECT valor FROM config WHERE chave = ?').get(chave);
  return row ? row.valor : padrao;
}

function setConfig(chave, valor) {
  db.prepare(
    'INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor'
  ).run(chave, String(valor));
}

// Configurações padrão
const cfgDefaults = {
  saldo_inicial: 1000,
  bonus_indicacao: 200,
  scheduler_ativo: 'false',
  scheduler_intervalo_min: 5,
  scheduler_jogos: 'roleta_primal',
  video_recompensa_moedas: 30,
  video_recompensa_xp: 5,
  video_limite_diario: 10,
  video_duracao_seg: 28,
};
for (const [k, v] of Object.entries(cfgDefaults)) {
  if (getConfig(k, null) === null) setConfig(k, v);
}

// Seed de títulos
const TITULOS_SEED = [
  { slug: 'estreante',     nome: 'Estreante',     icone: '🌱', raridade: 'comum',    descricao: 'Fez sua primeira aposta.',             criterio_tipo: 'apostas_total',   criterio_valor: 1 },
  { slug: 'apostador',     nome: 'Apostador',     icone: '🎲', raridade: 'comum',    descricao: '50 apostas realizadas.',               criterio_tipo: 'apostas_total',   criterio_valor: 50 },
  { slug: 'veterano',      nome: 'Veterano',      icone: '⚔️',  raridade: 'raro',     descricao: '200 apostas realizadas.',              criterio_tipo: 'apostas_total',   criterio_valor: 200 },
  { slug: 'sortudo',       nome: 'Sortudo',       icone: '🍀', raridade: 'comum',    descricao: 'Ganhou 10 apostas.',                   criterio_tipo: 'apostas_ganhas',  criterio_valor: 10 },
  { slug: 'imparavel',     nome: 'Imparável',     icone: '🔥', raridade: 'raro',     descricao: 'Ganhou 5 apostas seguidas.',           criterio_tipo: 'sequencia_ganhos',criterio_valor: 5 },
  { slug: 'lendario',      nome: 'Lendário',      icone: '⭐', raridade: 'lendario', descricao: 'Acertou o Preto na Roleta Primal.',    criterio_tipo: 'evento_raro',     criterio_valor: 1, criterio_jogo: 'preto_roleta' },
  { slug: 'fenix',         nome: 'Fênix',         icone: '🦅', raridade: 'epico',    descricao: 'Voltou do saldo zero.',                criterio_tipo: 'fenix',           criterio_valor: 1 },
  { slug: 'influencer',    nome: 'Influencer',    icone: '📣', raridade: 'raro',     descricao: 'Teve 5 indicações aprovadas.',         criterio_tipo: 'indicacoes',      criterio_valor: 5 },
  { slug: 'embaixador',    nome: 'Embaixador',    icone: '👑', raridade: 'epico',    descricao: 'Teve 10 indicações aprovadas.',        criterio_tipo: 'indicacoes',      criterio_valor: 10 },
  { slug: 'maratonista',   nome: 'Maratonista',   icone: '📺', raridade: 'comum',    descricao: 'Assistiu 50 anúncios.',                criterio_tipo: 'videos_total',    criterio_valor: 50 },
  { slug: 'fiel',          nome: 'Fiel',          icone: '📅', raridade: 'raro',     descricao: '7 dias seguidos de login.',            criterio_tipo: 'streak',          criterio_valor: 7 },
  { slug: 'desbravador',   nome: 'Desbravador',   icone: '🗺️', raridade: 'comum',    descricao: 'Jogou os 4 jogos disponíveis.',        criterio_tipo: 'jogos_distintos', criterio_valor: 4 },
  { slug: 'milionario',    nome: 'Milionário',    icone: '💰', raridade: 'epico',    descricao: 'Atingiu 10.000 moedas.',               criterio_tipo: 'saldo_max',       criterio_valor: 10000 },
  { slug: 'conquistador',  nome: 'Conquistador',  icone: '🏅', raridade: 'epico',    descricao: 'Desbloqueou 10 títulos.',              criterio_tipo: 'titulos_total',   criterio_valor: 10 },
  { slug: 'noturno',       nome: 'Noturno',       icone: '🌙', raridade: 'raro',     descricao: 'Apostou após meia-noite.',             criterio_tipo: 'evento_raro',     criterio_valor: 1, criterio_jogo: 'noturno' },
  { slug: 'missoes10',     nome: 'Dedicado',      icone: '✅', raridade: 'comum',    descricao: 'Concluiu 10 missões diárias.',         criterio_tipo: 'missoes_total',   criterio_valor: 10 },
  { slug: 'missoes50',     nome: 'Incansável',    icone: '💪', raridade: 'raro',     descricao: 'Concluiu 50 missões diárias.',         criterio_tipo: 'missoes_total',   criterio_valor: 50 },
];

const stmtTitulo = db.prepare(`
  INSERT INTO titulos_def (slug, nome, descricao, icone, raridade, criterio_tipo, criterio_valor, criterio_jogo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO NOTHING
`);
for (const t of TITULOS_SEED) {
  stmtTitulo.run(t.slug, t.nome, t.descricao, t.icone, t.raridade, t.criterio_tipo, t.criterio_valor, t.criterio_jogo || null);
}

// Seed de missões
const MISSOES_SEED = [
  { slug: 'login_diario',     nome: 'Presença garantida', descricao: 'Faça login hoje.',                             tipo: 'diaria',   criterio_tipo: 'login',          criterio_valor: 1,  recompensa_moedas: 10,  recompensa_xp: 3 },
  { slug: 'apostar_qualquer', nome: 'Em jogo!',           descricao: 'Faça 3 apostas em qualquer jogo.',             tipo: 'diaria',   criterio_tipo: 'apostas_total',  criterio_valor: 3,  recompensa_moedas: 50,  recompensa_xp: 15 },
  { slug: 'ganhar_aposta',    nome: 'Na veia',            descricao: 'Ganhe 1 aposta hoje.',                         tipo: 'diaria',   criterio_tipo: 'apostas_ganhas', criterio_valor: 1,  recompensa_moedas: 30,  recompensa_xp: 10 },
  { slug: 'ver_videos',       nome: 'Olhos no ecrã',      descricao: 'Assista 3 anúncios.',                          tipo: 'diaria',   criterio_tipo: 'videos',         criterio_valor: 3,  recompensa_moedas: 45,  recompensa_xp: 12 },
  { slug: 'roleta_primal',    nome: 'Roda que roda',      descricao: 'Jogue 2 rodadas de Roleta Primal.',            tipo: 'diaria',   criterio_tipo: 'apostas_jogo',   criterio_valor: 2,  recompensa_moedas: 25,  recompensa_xp: 8, criterio_jogo: 'roleta_primal' },
  { slug: 'cofre_mist',       nome: 'Abre o cofre!',      descricao: 'Jogue 1 rodada de Cofre Misterioso.',          tipo: 'diaria',   criterio_tipo: 'apostas_jogo',   criterio_valor: 1,  recompensa_moedas: 25,  recompensa_xp: 8, criterio_jogo: 'cofre_misterioso' },
  { slug: 'convidar',         nome: 'Boca a boca',        descricao: 'Tenha 1 indicação aprovada esta semana.',      tipo: 'semanal',  criterio_tipo: 'indicacoes',     criterio_valor: 1,  recompensa_moedas: 200, recompensa_xp: 50 },
  { slug: 'apostas_semana',   nome: 'Semana intensa',     descricao: 'Faça 20 apostas esta semana.',                 tipo: 'semanal',  criterio_tipo: 'apostas_total',  criterio_valor: 20, recompensa_moedas: 150, recompensa_xp: 40 },
  { slug: 'videos_semana',    nome: 'Maratona de anúncios',descricao: 'Assista 15 anúncios esta semana.',            tipo: 'semanal',  criterio_tipo: 'videos',         criterio_valor: 15, recompensa_moedas: 120, recompensa_xp: 35 },
];

const stmtMissao = db.prepare(`
  INSERT INTO missoes_def (slug, nome, descricao, tipo, criterio_tipo, criterio_jogo, criterio_valor, recompensa_moedas, recompensa_xp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO NOTHING
`);
for (const m of MISSOES_SEED) {
  stmtMissao.run(m.slug, m.nome, m.descricao, m.tipo, m.criterio_tipo, m.criterio_jogo || null, m.criterio_valor, m.recompensa_moedas, m.recompensa_xp);
}

// Seed do admin
const totalUsuarios = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
if (totalUsuarios === 0) {
  if (!bootstrapPassword || bootstrapPassword.trim().length < 12) {
    throw new Error('Defina ADMIN_PASSWORD com pelo menos 12 caracteres para criar o administrador.');
  }
  const agora = new Date().toISOString();
  db.prepare(
    `INSERT INTO usuarios (nome, apelido, senha_hash, indicador_id, saldo, status, data_cadastro, admin)
     VALUES (?, ?, ?, NULL, ?, 'ativo', ?, 1)`
  ).run('Administrador', 'admin', hashPassword(bootstrapPassword), Number(getConfig('saldo_inicial', 1000)), agora);
  db.prepare(`INSERT INTO logs (data, usuario_afetado, admin_responsavel, tipo_acao, descricao) VALUES (?, 1, 1, 'sistema', 'Admin padrão criado.')`)
    .run(agora);
  console.log('Administrador inicial criado.');
}

if (production && db.prepare('SELECT senha_hash FROM usuarios WHERE admin = 1').all().some(u => verifyPassword('admin123', u.senha_hash))) {
  db.close();
  throw new Error('Credencial administrativa legada detectada. Rotacione a senha com o servidor parado antes de iniciar.');
}
module.exports = { db, getConfig, setConfig };
