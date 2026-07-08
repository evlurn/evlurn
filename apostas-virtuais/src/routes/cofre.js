'use strict';
const { Router } = require('../http');
const { db } = require('../db');
const { obterJogo } = require('../games-config');
const { registrarLog } = require('../utils/logger');
const { exigirAutenticacao } = require('../middleware');
const { calcularMultiplicadorTotal } = require('../services/multiplicadores');
const { sortearOpcao } = require('../utils/random');
const router = new Router();

function aberturasDiarias(uid) {
  const hoje = new Date().toISOString().slice(0,10);
  return db.prepare("SELECT COUNT(*) AS n FROM apostas WHERE usuario_id = ? AND jogo = 'cofre_misterioso' AND date(data) = ?").get(uid, hoje).n;
}

router.get('/api/cofre/preview', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const jogo = obterJogo('cofre_misterioso');
  const usuario = db.prepare('SELECT saldo FROM usuarios WHERE id = ?').get(req.usuario.id);
  const usadas = aberturasDiarias(req.usuario.id);
  res.json({ saldo: usuario.saldo, opcoes: jogo.opcoes, limiteDiario: jogo.limiteDiario, abertasHoje: usadas, restantes: Math.max(0, jogo.limiteDiario - usadas) });
});

router.post('/api/cofre/abrir', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { valor } = req.body || {};
  if (!Number.isInteger(valor) || valor <= 0) return res.status(400).json({ erro: 'Valor inválido.' });
  const jogo = obterJogo('cofre_misterioso');
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (valor > usuario.saldo) return res.status(400).json({ erro: 'Saldo insuficiente.' });
  const usadas = aberturasDiarias(usuario.id);
  if (usadas >= jogo.limiteDiario) return res.status(429).json({ erro: `Você já abriu ${jogo.limiteDiario} cofres hoje. Volte amanhã!` });
  const resultado = sortearOpcao(jogo.opcoes);
  const opcaoResultado = jogo.opcoes[resultado];
  const agora = new Date().toISOString();
  let ganhoFinal, novoSaldo;
  if (opcaoResultado.mult < 1) {
    ganhoFinal = Math.round(valor * opcaoResultado.mult) - valor; novoSaldo = usuario.saldo + ganhoFinal;
  } else {
    const { fatorFinal } = calcularMultiplicadorTotal(usuario, 'cofre_misterioso');
    ganhoFinal = Math.round(Math.round(valor * (opcaoResultado.mult - 1)) * fatorFinal);
    novoSaldo = usuario.saldo + ganhoFinal;
  }
  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
  db.prepare("INSERT INTO apostas (usuario_id, rodada_id, jogo, escolha, valor, resultado, ganho, status, data) VALUES (?, NULL, 'cofre_misterioso', 'abrir', ?, ?, ?, 'resolvida', ?)")
    .run(usuario.id, valor, resultado, ganhoFinal, agora);
  db.prepare(`INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(usuario.id, ganhoFinal >= 0 ? 'ganho' : 'perda', ganhoFinal, usuario.saldo, novoSaldo, `Cofre: ${opcaoResultado.label} ×${opcaoResultado.mult}. ${ganhoFinal >= 0 ? '+' : ''}${ganhoFinal}`, agora);
  registrarLog({ usuarioAfetado: usuario.id, tipoAcao: 'cofre_misterioso', descricao: `"${usuario.apelido}": ${opcaoResultado.label} ×${opcaoResultado.mult}. Apostou ${valor}, ${ganhoFinal >= 0 ? '+' : ''}${ganhoFinal}. Abertura ${usadas+1}/${jogo.limiteDiario}.`, ip: req.ip });
  res.json({ resultado, opcaoResultado, ganhoFinal, saldoAnterior: usuario.saldo, saldoNovo: novoSaldo, abertasHoje: usadas+1, restantes: jogo.limiteDiario - usadas - 1 });
});
module.exports = { router };
