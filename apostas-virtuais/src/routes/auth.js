'use strict';

const { Router } = require('../http');
const _crypto = require('node:crypto');

// Gera invite_code único tipo QX72LAF9 (8 chars, sem caracteres ambíguos)
function gerarInviteCode(db) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code, tentativas = 0;
  do {
    const bytes = _crypto.randomBytes(8);
    code = Array.from(bytes).map(b => chars[b % chars.length]).join('');
    tentativas++;
    if (tentativas > 20) throw new Error('Falha ao gerar invite_code único.');
  } while (db.prepare('SELECT id FROM usuarios WHERE invite_code = ?').get(code));
  return code;
}

// Rate limiting simples para tentativas de login (in-memory).
// Bloqueia IP após 10 tentativas falhas em 15 minutos.
// Para produção com escala, substituir por Redis ou middleware dedicado.
const _loginTentativas = new Map(); // ip → { count, expiraEm }
const LIMITE_TENTATIVAS = 10;
const JANELA_MS = 15 * 60 * 1000; // 15 minutos

function verificarRateLimit(ip) {
  const agora = Date.now();
  const entrada = _loginTentativas.get(ip);
  if (!entrada || agora > entrada.expiraEm) {
    _loginTentativas.set(ip, { count: 1, expiraEm: agora + JANELA_MS });
    return false; // não bloqueado
  }
  entrada.count += 1;
  return entrada.count > LIMITE_TENTATIVAS; // bloqueado se ultrapassou limite
}

function resetarRateLimit(ip) {
  _loginTentativas.delete(ip);
}
const { db, getConfig } = require('../db');
const { hashPassword, verifyPassword } = require('../utils/security');
const { criarSessao, destruirSessao } = require('../sessions');
const { registrarLog } = require('../utils/logger');

const router = new Router();

function usuarioPublico(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    apelido: usuario.apelido,
    saldo: usuario.saldo,
    status: usuario.status,
    admin: Boolean(usuario.admin),
    data_cadastro: usuario.data_cadastro,
  };
}

// Busca de usuários ativos para o campo "Quem Indicou?" no cadastro.
// Endpoint público (o cadastro acontece antes do login existir).
router.get('/api/indicadores/buscar', (req, res, params, query) => {
  const termo = `%${(query.q || '').trim()}%`;
  const resultados = db
    .prepare(
      `SELECT id, nome, apelido FROM usuarios
       WHERE status = 'ativo' AND (nome LIKE ? OR apelido LIKE ?)
       ORDER BY nome LIMIT 10`
    )
    .all(termo, termo);
  res.json({ resultados });
});

router.post('/api/auth/register', async (req, res) => {
  const body = req.body || {};
  const nome = (body.nome || '').trim();
  const apelido = (body.apelido || '').trim();
  const senha = body.senha || '';
  const confirmarSenha = body.confirmarSenha || '';
  const indicadorId = body.indicadorId || null;
  const dataNascimento = body.dataNascimento || null;
  const identidadeGenero = (body.identidadeGenero || '').trim() || null;
  const identidadeGeneroOutro = (body.identidadeGeneroOutro || '').trim() || null;

  if (!nome || !apelido || !senha || !confirmarSenha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }
  if (apelido.length < 3) {
    return res.status(400).json({ erro: 'O apelido deve ter pelo menos 3 caracteres.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  if (senha !== confirmarSenha) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }

  const apelidoExistente = db.prepare('SELECT id FROM usuarios WHERE apelido = ?').get(apelido);
  if (apelidoExistente) {
    return res.status(409).json({ erro: 'Esse apelido já está em uso. Escolha outro.' });
  }

  if (indicadorId) {
    const indicador = db.prepare("SELECT id FROM usuarios WHERE id = ? AND status = 'ativo'").get(indicadorId);
    if (!indicador) {
      return res.status(400).json({ erro: 'Indicador inválido.' });
    }
  }

  const agora = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO usuarios (nome, apelido, senha_hash, data_nascimento, identidade_genero, identidade_genero_outro, indicador_id, invite_code, saldo, status, data_cadastro, admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pendente', ?, 0)`
    )
    .run(nome, apelido, hashPassword(senha), dataNascimento, identidadeGenero, identidadeGeneroOutro, indicadorId, gerarInviteCode(db), agora);

  registrarLog({
    usuarioAfetado: Number(info.lastInsertRowid),
    tipoAcao: 'cadastro_enviado',
    descricao: `Novo cadastro enviado por "${apelido}" (${nome}), aguardando aprovação.`,
    ip: req.ip,
  });

  res.status(201).json({
    mensagem: 'Cadastro enviado com sucesso! Aguarde a aprovação de um administrador para acessar o sistema.',
  });
});

router.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (verificarRateLimit(ip)) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
  }
  const body = req.body || {};
  const apelido = (body.apelido || '').trim();
  const senha = body.senha || '';

  if (!apelido || !senha) {
    return res.status(400).json({ erro: 'Informe apelido e senha.' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE apelido = ?').get(apelido);
  if (!usuario || !verifyPassword(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: 'Apelido ou senha incorretos.' });
  }

  if (usuario.status !== 'ativo') return res.status(403).json({ erro: 'Conta indisponível para acesso.' });
  if (usuario.status === 'pendente') {
    return res.status(403).json({ erro: 'Seu cadastro ainda está pendente de aprovação.' });
  }
  if (usuario.status === 'rejeitado') {
    return res.status(403).json({ erro: 'Seu cadastro foi rejeitado. Procure um administrador.' });
  }

  const token = criarSessao(usuario.id);
  res.setCookie('sessao', token, { maxAgeSegundos: 60 * 60 * 24 * 7 });

  resetarRateLimit(req.ip || 'unknown');
  registrarLog({ usuarioAfetado: usuario.id, tipoAcao: 'login', descricao: `Login realizado por "${usuario.apelido}".`, ip: req.ip });

  res.json({ usuario: usuarioPublico(usuario) });
});

router.post('/api/auth/logout', (req, res) => {
  if (req.tokenSessao) destruirSessao(req.tokenSessao);
  if (req.usuario) {
    registrarLog({ usuarioAfetado: req.usuario.id, tipoAcao: 'logout', descricao: `Logout realizado por "${req.usuario.apelido}".`, ip: req.ip });
  }
  res.clearCookie('sessao');
  res.json({ mensagem: 'Sessão encerrada.' });
});

router.get('/api/auth/me', (req, res) => {
  if (!req.usuario || req.usuario.status !== 'ativo') return res.status(401).json({ erro: 'Não autenticado.' });
  res.json({ usuario: usuarioPublico(req.usuario) });
});

module.exports = { router, usuarioPublico };
