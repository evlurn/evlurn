'use strict';
const { Router } = require('../http');
const { db } = require('../db');
const { obterJogo } = require('../games-config');
const { registrarLog } = require('../utils/logger');
const { exigirAutenticacao } = require('../middleware');
const { calcularMultiplicadorTotal } = require('../services/multiplicadores');
const { sortearOpcao } = require('../utils/random');
const router = new Router();

router.get('/api/jogamoeda/preview', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const usuario = db.prepare('SELECT saldo FROM usuarios WHERE id = ?').get(req.usuario.id);
  res.json({ saldo: usuario.saldo, opcoes: obterJogo('joga_moeda').opcoes });
});

router.post('/api/jogamoeda/apostar', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { escolha, valor } = req.body || {};
  const jogo = obterJogo('joga_moeda');
  if (!['cara','coroa'].includes(escolha)) return res.status(400).json({ erro: 'Escolha "cara" ou "coroa".' });
  if (!Number.isInteger(valor) || valor <= 0) return res.status(400).json({ erro: 'Valor inválido.' });
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (valor > usuario.saldo) return res.status(400).json({ erro: 'Saldo insuficiente.' });
  const resultado = sortearOpcao(jogo.opcoes);
  const opcaoResultado = jogo.opcoes[resultado];
  const agora = new Date().toISOString();
  let ganhoFinal, novoSaldo, ganhou;
  if (opcaoResultado.perdeAposta || resultado !== escolha) {
    ganhoFinal = -valor; novoSaldo = usuario.saldo - valor; ganhou = false;
  } else {
    const { fatorFinal } = calcularMultiplicadorTotal(usuario, 'joga_moeda');
    ganhoFinal = Math.round(Math.round(valor * (opcaoResultado.mult - 1)) * fatorFinal);
    novoSaldo = usuario.saldo + ganhoFinal; ganhou = true;
  }
  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
  // Registra na tabela apostas para contagem e histórico unificado
  db.prepare("INSERT INTO apostas (usuario_id, rodada_id, jogo, escolha, valor, resultado, ganho, status, data) VALUES (?, NULL, 'joga_moeda', ?, ?, ?, ?, 'resolvida', ?)")
    .run(usuario.id, escolha, valor, resultado, ganhoFinal, agora);
  db.prepare(`INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(usuario.id, ganhou ? 'ganho' : 'perda', ganhoFinal, usuario.saldo, novoSaldo, `Joga a Moeda: ${escolha} → ${resultado}. ${ganhou ? '+' : ''}${ganhoFinal}`, agora);
  registrarLog({ usuarioAfetado: usuario.id, tipoAcao: 'joga_moeda', descricao: `"${usuario.apelido}": escolheu "${escolha}", saiu "${resultado}". ${ganhou ? 'GANHOU +' : 'PERDEU '}${Math.abs(ganhoFinal)}. Saldo: ${usuario.saldo} → ${novoSaldo}.`, ip: req.ip });
  res.json({ ganhou, escolha, resultado, resultadoLabel: opcaoResultado.label, ganhoFinal, saldoAnterior: usuario.saldo, saldoNovo: novoSaldo });
});
module.exports = { router };
