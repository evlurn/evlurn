'use strict';

const { db } = require('./db');
const { gerarToken } = require('./utils/security');

const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function criarSessao(usuarioId) {
  const token = gerarToken();
  const agora = new Date();
  const expira = new Date(agora.getTime() + DURACAO_SESSAO_MS);
  db.prepare('INSERT INTO sessoes (token, usuario_id, criado_em, expira_em) VALUES (?, ?, ?, ?)').run(
    token,
    usuarioId,
    agora.toISOString(),
    expira.toISOString()
  );
  return token;
}

function obterUsuarioPorToken(token) {
  if (!token) return null;
  const sessao = db.prepare('SELECT * FROM sessoes WHERE token = ?').get(token);
  if (!sessao) return null;
  if (new Date(sessao.expira_em) < new Date()) {
    db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
    return null;
  }
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(sessao.usuario_id);
  return usuario?.status === 'ativo' ? usuario : null;
}

function destruirSessao(token) {
  db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
}

module.exports = { criarSessao, obterUsuarioPorToken, destruirSessao };
