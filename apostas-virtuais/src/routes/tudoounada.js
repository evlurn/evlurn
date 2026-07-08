'use strict';
const { Router } = require('../http');
const { db } = require('../db');
const { faixaTudoOuNada } = require('../games-config');
const { registrarLog } = require('../utils/logger');
const { exigirAutenticacao } = require('../middleware');
const { calcularMultiplicadorTotal } = require('../services/multiplicadores');
const crypto = require('node:crypto');
const router = new Router();
const PERCENTUAIS_VALIDOS = [10, 25, 50, 100];

function posicaoNoRanking(usuarioId) {
  const ranking = db.prepare("SELECT id FROM usuarios WHERE status = 'ativo' ORDER BY saldo DESC, id ASC").all();
  const pos = ranking.findIndex((r) => r.id === usuarioId) + 1;
  return { posicao: pos || ranking.length, total: ranking.length };
}

router.get('/api/tudo-ou-nada/preview', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  const { posicao, total } = posicaoNoRanking(usuario.id);
  const faixa = faixaTudoOuNada(posicao);
  const { fatorFinal, detalhes } = calcularMultiplicadorTotal(usuario, 'tudo_ou_nada');
  const opcoes = PERCENTUAIS_VALIDOS.map((pct) => {
    const valorAposta = Math.floor(usuario.saldo * pct / 100);
    const ganhoBase = Math.round(valorAposta * faixa.retorno);
    const ganhoComMult = Math.round(ganhoBase * fatorFinal);
    return { percentual: pct, valorAposta, ganhoSeVencer: ganhoComMult, saldoSeVencer: usuario.saldo + ganhoComMult, saldoSePerder: usuario.saldo - valorAposta };
  });
  res.json({ posicaoRanking: posicao, totalJogadores: total, faixa: { label: faixa.label, chanceGanho: faixa.chanceGanho, chancePerda: 100 - faixa.chanceGanho, retorno: faixa.retorno, retornoPct: Math.round(faixa.retorno * 100) }, multiplicador: detalhes, saldoAtual: usuario.saldo, opcoes });
});

router.post('/api/tudo-ou-nada/apostar', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { percentual } = req.body || {};
  if (!PERCENTUAIS_VALIDOS.includes(Number(percentual))) return res.status(400).json({ erro: `Percentual inválido. Use: ${PERCENTUAIS_VALIDOS.join(', ')}.` });
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (usuario.saldo <= 0) return res.status(400).json({ erro: 'Saldo insuficiente.' });
  const valorAposta = Math.floor(usuario.saldo * Number(percentual) / 100);
  if (valorAposta <= 0) return res.status(400).json({ erro: 'Valor calculado é zero. Saldo muito baixo.' });
  const { posicao, total } = posicaoNoRanking(usuario.id);
  const faixa = faixaTudoOuNada(posicao);
  const { fatorFinal, detalhes } = calcularMultiplicadorTotal(usuario, 'tudo_ou_nada');
  const sorteio = crypto.randomInt(0, 100);
  const ganhou = sorteio < faixa.chanceGanho;
  const agora = new Date().toISOString();
  let novoSaldo, ganhoFinal, descricaoResultado;
  if (ganhou) {
    const ganhoBase = Math.round(valorAposta * faixa.retorno);
    ganhoFinal = Math.round(ganhoBase * fatorFinal);
    novoSaldo = usuario.saldo + ganhoFinal;
    descricaoResultado = `VENCEU +${ganhoFinal} fichas`;
  } else {
    ganhoFinal = -valorAposta;
    novoSaldo = usuario.saldo - valorAposta;
    descricaoResultado = `PERDEU -${valorAposta} fichas`;
  }
  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
  // Registra na tabela apostas para histórico e contagem unificados
  db.prepare("INSERT INTO apostas (usuario_id, rodada_id, jogo, escolha, valor, resultado, ganho, status, data) VALUES (?, NULL, 'tudo_ou_nada', ?, ?, ?, ?, 'resolvida', ?)")
    .run(usuario.id, String(percentual)+'%', valorAposta, ganhou ? 'ganhou' : 'perdeu', ganhoFinal, agora);
  db.prepare(`INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(usuario.id, ganhou ? 'ganho' : 'perda', ganhoFinal, usuario.saldo, novoSaldo, `Tudo ou Nada: ${descricaoResultado} (${percentual}% do saldo, posição #${posicao})`, agora);
  registrarLog({ usuarioAfetado: usuario.id, tipoAcao: 'tudo_ou_nada', descricao: `"${usuario.apelido}" jogou Tudo ou Nada. ${percentual}% | Apostou: ${valorAposta} | Posição: #${posicao}/${total} | Odds: ${faixa.chanceGanho}% | ${descricaoResultado}`, ip: req.ip });
  res.json({ ganhou, percentual: Number(percentual), valorAposta, ganhoFinal, saldoAnterior: usuario.saldo, saldoNovo: novoSaldo, posicaoRanking: posicao, faixa: faixa.label, chanceGanho: faixa.chanceGanho, retorno: faixa.retorno });
});
module.exports = { router };
