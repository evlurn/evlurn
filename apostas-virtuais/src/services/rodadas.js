'use strict';

const { db } = require('../db');
const { obterJogo } = require('../games-config');
const { sortearOpcao } = require('../utils/random');
const { registrarLog } = require('../utils/logger');
const { calcularMultiplicadorTotal, calcularNivel } = require('./multiplicadores');

function abrirRodada(jogoId, adminId) {
  const jogo = obterJogo(jogoId);
  if (!jogo) throw new Error('Jogo inválido.');

  const jaAberta = db.prepare("SELECT id FROM rodadas WHERE jogo = ? AND status = 'aberta'").get(jogoId);
  if (jaAberta) throw new Error('Já existe uma rodada aberta para esse jogo.');

  const agora = new Date().toISOString();
  const info = db
    .prepare(`INSERT INTO rodadas (jogo, status, data_abertura, criado_por) VALUES (?, 'aberta', ?, ?)`)
    .run(jogoId, agora, adminId);

  registrarLog({
    adminResponsavel: adminId,
    tipoAcao: 'rodada_criada',
    descricao: `Rodada #${info.lastInsertRowid} aberta para o jogo "${jogo.nome}".`,
  });

  return Number(info.lastInsertRowid);
}

/**
 * Decide o destino de uma aposta individual dado o resultado sorteado.
 * Retorna um objeto descrevendo o que fazer: 'ganho', 'perde_aposta' (já
 * descontado no momento da aposta, nada a fazer) ou 'perde_tudo' (zera o
 * saldo inteiro do jogador, usado em "Sobreviveu ou Não").
 */
function resolverDestinoAposta(aposta, jogo, resultado, opcaoResultado, usuario) {
  if (opcaoResultado.perdeTudo) return { tipo: 'perde_tudo' };
  if (opcaoResultado.perdeAposta) return { tipo: 'perde_aposta' };

  let multBase = opcaoResultado.mult;

  // "Tudo ou Nada" tem multiplicador dinâmico baseado no nível do jogador
  if (jogo.id === 'tudo_ou_nada' && jogo.multDinamico && resultado === 'ganhou') {
    const { nivel } = calcularNivel(usuario.xp || 0);
    multBase = multTudoOuNada(nivel);
  }

  // tipo 'escolha': jogador apostou em uma opção específica — só ganha se acertar
  if (jogo.tipo === 'escolha') {
    if (aposta.escolha === resultado) return { tipo: 'ganho', mult: multBase };
    return { tipo: 'perde_aposta' };
  }

  // tipo 'compartilhado': todos os apostadores recebem o mesmo resultado
  return { tipo: 'ganho', mult: multBase };
}

function encerrarRodada(rodadaId, adminId) {
  const rodada = db.prepare('SELECT * FROM rodadas WHERE id = ?').get(rodadaId);
  if (!rodada) throw new Error('Rodada não encontrada.');
  if (rodada.status !== 'aberta') throw new Error('Essa rodada já foi encerrada.');

  const jogo = obterJogo(rodada.jogo);
  const resultado = sortearOpcao(jogo.opcoes);
  const opcaoResultado = jogo.opcoes[resultado];
  const agora = new Date().toISOString();

  const apostas = db.prepare("SELECT * FROM apostas WHERE rodada_id = ? AND status = 'pendente'").all(rodadaId);

  const resumo = { ganharam: 0, perderam: 0, totalDistribuido: 0 };

  for (const aposta of apostas) {
    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(aposta.usuario_id);
    const destino = resolverDestinoAposta(aposta, jogo, resultado, opcaoResultado, usuario);

    if (destino.tipo === 'ganho') {
      // Aplica multiplicadores de nível + patente + títulos + eventos
      const { fatorFinal, detalhes } = calcularMultiplicadorTotal(usuario, jogo.id);
      const ganhoBase = Math.round(aposta.valor * destino.mult);
      const ganho = Math.round(ganhoBase * fatorFinal);
      const bonusExtra = ganho - ganhoBase;

      const novoSaldo = usuario.saldo + ganho;
      db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
      db.prepare(
        `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
         VALUES (?, 'ganho', ?, ?, ?, ?, ?)`
      ).run(
        usuario.id, ganho, usuario.saldo, novoSaldo,
        `Ganhou em ${jogo.nome} (rodada #${rodadaId}, resultado: ${opcaoResultado.label})${bonusExtra > 0 ? ` · Bônus mult ${detalhes.bonusSomado}%+evento×${detalhes.multEvento}: +${bonusExtra}` : ''}`,
        agora
      );
      db.prepare('UPDATE apostas SET resultado = ?, ganho = ?, status = ? WHERE id = ?').run(resultado, ganho, 'resolvida', aposta.id);
      resumo.ganharam += 1;
      resumo.totalDistribuido += ganho;
    } else if (destino.tipo === 'perde_tudo') {
      const saldoAnterior = usuario.saldo;
      db.prepare('UPDATE usuarios SET saldo = 0 WHERE id = ?').run(usuario.id);
      db.prepare(
        `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
         VALUES (?, 'perda_total', ?, ?, 0, ?, ?)`
      ).run(usuario.id, saldoAnterior, saldoAnterior, `Tudo ou Nada: perdeu todo o saldo (rodada #${rodadaId}).`, agora);
      db.prepare('UPDATE apostas SET resultado = ?, ganho = 0, status = ? WHERE id = ?').run(resultado, 'resolvida', aposta.id);
      resumo.perderam += 1;
    } else {
      db.prepare('UPDATE apostas SET resultado = ?, ganho = 0, status = ? WHERE id = ?').run(resultado, 'resolvida', aposta.id);
      resumo.perderam += 1;
    }
  }

  db.prepare("UPDATE rodadas SET status = 'encerrada', resultado = ?, data_encerramento = ? WHERE id = ?").run(resultado, agora, rodadaId);

  registrarLog({
    adminResponsavel: adminId,
    tipoAcao: 'rodada_encerrada',
    descricao: `Rodada #${rodadaId} (${jogo.nome}) encerrada. Resultado: ${opcaoResultado.label}. ${resumo.ganharam} ganharam, ${resumo.perderam} perderam, ${resumo.totalDistribuido} moedas distribuídas.`,
  });

  return { resultado, opcaoResultado, resumo };
}

module.exports = { abrirRodada, encerrarRodada };
