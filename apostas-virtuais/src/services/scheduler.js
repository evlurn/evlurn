'use strict';

/**
 * Scheduler de rodadas automáticas — versão simplificada (sem presença).
 *
 * Ciclo de vida:
 *  1. O scheduler roda a cada segundo e calcula o "slot" atual no relógio.
 *     Com intervalo de 5min: slots em 00:00, 00:05, 00:10... de cada hora.
 *  2. No início de cada slot, abre uma rodada para cada jogo configurado
 *     (todos os jogadores têm acesso simultaneamente, sem condição de presença).
 *  3. No final do slot (transição), todas as rodadas automáticas são encerradas:
 *     - Com apostas  → resultado sorteado, saldos atualizados.
 *     - Sem apostas  → rodada cancelada silenciosamente.
 *  4. Se o scheduler for desligado, rodadas abertas por ele são encerradas
 *     imediatamente.
 *
 * Rodadas manuais (abertas pelo admin na aba Rodadas) não são afetadas.
 */

const { db, getConfig } = require('../db');
const { obterJogo } = require('../games-config');
const { sortearOpcao } = require('../utils/random');
const { registrarLog } = require('../utils/logger');

/** Número do slot atual desde meia-noite, dado um intervalo em minutos. */
function slotAtual(intervaloMin) {
  const agora = new Date();
  const minutosDoDia = agora.getHours() * 60 + agora.getMinutes();
  return Math.floor(minutosDoDia / intervaloMin);
}

/**
 * Retorna quantos segundos faltam para o próximo slot.
 * Útil para expor ao front-end como contagem regressiva.
 */
function segundosParaProximoSlot(intervaloMin) {
  const agora = new Date();
  const segundosDoDia = agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();
  const intervaloSeg = intervaloMin * 60;
  return intervaloSeg - (segundosDoDia % intervaloSeg);
}

/**
 * Encerra uma rodada automática: sorteia resultado se houver apostas,
 * ou cancela silenciosamente se não houver nenhuma.
 */
function encerrarRodadaAuto(rodada) {
  const jogo = obterJogo(rodada.jogo);
  const apostas = db
    .prepare("SELECT * FROM apostas WHERE rodada_id = ? AND status = 'pendente'")
    .all(rodada.id);
  const agora = new Date().toISOString();

  if (!apostas.length) {
    db.prepare("UPDATE rodadas SET status = 'cancelada', data_encerramento = ? WHERE id = ?")
      .run(agora, rodada.id);
    registrarLog({
      tipoAcao: 'rodada_cancelada',
      descricao: `[Auto] Rodada #${rodada.id} (${jogo.nome}) cancelada: nenhuma aposta no período.`,
    });
    return;
  }

  const resultado = sortearOpcao(jogo.opcoes);
  const opcaoResultado = jogo.opcoes[resultado];
  const resumo = { ganharam: 0, perderam: 0, totalDistribuido: 0 };

  for (const aposta of apostas) {
    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(aposta.usuario_id);

    let tipoDestino;
    if (opcaoResultado.perdeTudo) {
      tipoDestino = 'perde_tudo';
    } else if (opcaoResultado.perdeAposta) {
      tipoDestino = 'perde_aposta';
    } else if (jogo.tipo === 'escolha') {
      tipoDestino = aposta.escolha === resultado ? 'ganho' : 'perde_aposta';
    } else {
      tipoDestino = 'ganho';
    }

    if (tipoDestino === 'ganho') {
      const ganho = Math.round(aposta.valor * opcaoResultado.mult);
      const novoSaldo = usuario.saldo + ganho;
      db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
      db.prepare(
        `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
         VALUES (?, 'ganho', ?, ?, ?, ?, ?)`
      ).run(usuario.id, ganho, usuario.saldo, novoSaldo,
        `Ganhou em ${jogo.nome} (rodada #${rodada.id}, resultado: ${opcaoResultado.label})`, agora);
      db.prepare('UPDATE apostas SET resultado = ?, ganho = ?, status = ? WHERE id = ?')
        .run(resultado, ganho, 'resolvida', aposta.id);
      resumo.ganharam++;
      resumo.totalDistribuido += ganho;
    } else if (tipoDestino === 'perde_tudo') {
      const saldoAnterior = usuario.saldo;
      db.prepare('UPDATE usuarios SET saldo = 0 WHERE id = ?').run(usuario.id);
      db.prepare(
        `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
         VALUES (?, 'perda_total', ?, ?, 0, ?, ?)`
      ).run(usuario.id, saldoAnterior, saldoAnterior,
        `Eliminado em ${jogo.nome} (rodada #${rodada.id})`, agora);
      db.prepare('UPDATE apostas SET resultado = ?, ganho = 0, status = ? WHERE id = ?')
        .run(resultado, 'resolvida', aposta.id);
      resumo.perderam++;
    } else {
      db.prepare('UPDATE apostas SET resultado = ?, ganho = 0, status = ? WHERE id = ?')
        .run(resultado, 'resolvida', aposta.id);
      resumo.perderam++;
    }
  }

  db.prepare("UPDATE rodadas SET status = 'encerrada', resultado = ?, data_encerramento = ? WHERE id = ?")
    .run(resultado, agora, rodada.id);

  registrarLog({
    tipoAcao: 'rodada_encerrada',
    descricao: `[Auto] Rodada #${rodada.id} (${jogo.nome}) encerrada. Resultado: ${opcaoResultado.label}. ${resumo.ganharam} ganharam, ${resumo.perderam} perderam, ${resumo.totalDistribuido} moedas distribuídas.`,
  });
}

let slotAnterior = null;
let schedulerTimer = null;

function ciclo() {
  const ativo = getConfig('scheduler_ativo', 'false') === 'true';

  if (!ativo) {
    // Encerra rodadas automáticas abertas caso o scheduler tenha sido desligado
    const abertas = db
      .prepare("SELECT * FROM rodadas WHERE status = 'aberta' AND criado_por IS NULL")
      .all();
    for (const r of abertas) encerrarRodadaAuto(r);
    slotAnterior = null;
    return;
  }

  const intervaloMin = Math.max(1, Number(getConfig('scheduler_intervalo_min', 5)));
  const slot = slotAtual(intervaloMin);

  // Detectou virada de slot: encerra rodadas automáticas do slot anterior
  if (slotAnterior !== null && slot !== slotAnterior) {
    const abertasAuto = db
      .prepare("SELECT * FROM rodadas WHERE status = 'aberta' AND criado_por IS NULL")
      .all();
    for (const r of abertasAuto) encerrarRodadaAuto(r);
  }

  slotAnterior = slot;

  // Abre rodadas para todos os jogos configurados que ainda não têm rodada aberta
  // Exclui tudo_ou_nada: é um jogo individual instantâneo, não usa o sistema de rodadas.
  const jogosConfig = getConfig('scheduler_jogos', '')
    .split(',').map((s) => s.trim()).filter((s) => s && s !== 'tudo_ou_nada');

  for (const jogoId of jogosConfig) {
    const jaAberta = db
      .prepare("SELECT id FROM rodadas WHERE jogo = ? AND status = 'aberta'")
      .get(jogoId);
    if (jaAberta) continue;

    const agora = new Date().toISOString();
    const info = db
      .prepare("INSERT INTO rodadas (jogo, status, data_abertura, criado_por) VALUES (?, 'aberta', ?, NULL)")
      .run(jogoId, agora);

    const jogo = obterJogo(jogoId);
    registrarLog({
      tipoAcao: 'rodada_criada',
      descricao: `[Auto] Rodada #${info.lastInsertRowid} aberta para ${jogo.nome} (slot ${slot}, intervalo ${intervaloMin}min).`,
    });
  }
}

function iniciar() {
  if (schedulerTimer) return;
  schedulerTimer = setInterval(ciclo, 1000);
  // eslint-disable-next-line no-console
  console.log('Scheduler de rodadas automáticas iniciado.');
}

function parar() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
}

/** Expõe tempo restante para ser consumido pela API de status. */
function statusAtual() {
  const ativo = getConfig('scheduler_ativo', 'false') === 'true';
  const intervaloMin = Math.max(1, Number(getConfig('scheduler_intervalo_min', 5)));
  return {
    ativo,
    intervaloMin,
    segundosParaProximoSlot: ativo ? segundosParaProximoSlot(intervaloMin) : null,
    slotAtual: ativo ? slotAtual(intervaloMin) : null,
  };
}

module.exports = { iniciar, parar, encerrarRodadaAuto, statusAtual };
