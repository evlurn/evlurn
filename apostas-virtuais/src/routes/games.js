'use strict';

const { Router } = require('../http');
const { db } = require('../db');
const { listarJogos, obterJogo } = require('../games-config');
const { registrarLog } = require('../utils/logger');
const { exigirAutenticacao } = require('../middleware');

const router = new Router();

function rodadasAbertasPorJogo() {
  const linhas = db.prepare("SELECT * FROM rodadas WHERE status = 'aberta'").all();
  const mapa = {};
  linhas.forEach((r) => { mapa[r.jogo] = r; });
  return mapa;
}

// Lista todos os jogos disponíveis, suas opções/probabilidades e a rodada
// aberta de cada um (se houver). Usado para montar a tela de cada jogo.
router.get('/api/jogos', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const abertas = rodadasAbertasPorJogo();
  const jogos = listarJogos().map((j) => ({
    ...j,
    rodadaAberta: abertas[j.id] ? { id: abertas[j.id].id, data_abertura: abertas[j.id].data_abertura } : null,
  }));
  res.json({ jogos });
});

// Retorna o estado de uma rodada específica (usado para "polling" simples
// da tela do jogador enquanto espera o admin encerrar a rodada).
router.get('/api/rodadas/:id', (req, res, params) => {
  if (!exigirAutenticacao(req, res)) return;
  const rodada = db.prepare('SELECT * FROM rodadas WHERE id = ?').get(params.id);
  if (!rodada) return res.status(404).json({ erro: 'Rodada não encontrada.' });

  const minhaAposta = db
    .prepare('SELECT * FROM apostas WHERE rodada_id = ? AND usuario_id = ?')
    .get(rodada.id, req.usuario.id);

  res.json({ rodada, minhaAposta: minhaAposta || null });
});

router.post('/api/apostas', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const body = req.body || {};
  const jogoId = body.jogo;
  const escolha = body.escolha || null;
  const valor = Number(body.valor);

  const jogo = obterJogo(jogoId);
  if (!jogo) return res.status(400).json({ erro: 'Jogo inválido.' });

  if (!Number.isInteger(valor) || valor <= 0) {
    return res.status(400).json({ erro: 'O valor da aposta deve ser um número inteiro positivo.' });
  }

  const rodada = db.prepare("SELECT * FROM rodadas WHERE jogo = ? AND status = 'aberta'").get(jogoId);
  if (!rodada) {
    return res.status(400).json({ erro: 'Não há uma rodada aberta para esse jogo no momento. Aguarde o administrador abrir uma nova.' });
  }

  if (jogo.tipo === 'escolha') {
    const escolhasValidas = Object.entries(jogo.opcoes)
      .filter(([, o]) => !o.perdeAposta && !o.perdeTudo)
      .map(([chave]) => chave);
    if (!escolhasValidas.includes(escolha)) {
      return res.status(400).json({ erro: `Escolha inválida. Opções: ${escolhasValidas.join(', ')}.` });
    }
  }

  const usuarioAtual = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (valor > usuarioAtual.saldo) {
    return res.status(400).json({ erro: 'Saldo insuficiente para essa aposta.' });
  }

  const apostaExistente = db
    .prepare('SELECT id FROM apostas WHERE rodada_id = ? AND usuario_id = ?')
    .get(rodada.id, usuarioAtual.id);
  if (apostaExistente) {
    return res.status(409).json({ erro: 'Você já registrou uma aposta nesta rodada.' });
  }

  const agora = new Date().toISOString();
  const novoSaldo = usuarioAtual.saldo - valor;

  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuarioAtual.id);

  const infoAposta = db
    .prepare(
      `INSERT INTO apostas (usuario_id, rodada_id, jogo, escolha, valor, status, data)
       VALUES (?, ?, ?, ?, ?, 'pendente', ?)`
    )
    .run(usuarioAtual.id, rodada.id, jogoId, jogo.tipo === 'escolha' ? escolha : 'participar', valor, agora);

  db.prepare(
    `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
     VALUES (?, 'aposta_realizada', ?, ?, ?, ?, ?)`
  ).run(usuarioAtual.id, valor, usuarioAtual.saldo, novoSaldo, `Aposta em ${jogo.nome} (rodada #${rodada.id})`, agora);

  registrarLog({
    usuarioAfetado: usuarioAtual.id,
    tipoAcao: 'aposta_realizada',
    descricao: `"${usuarioAtual.apelido}" apostou ${valor} moedas em ${jogo.nome} (rodada #${rodada.id}${escolha ? `, escolha: ${escolha}` : ''}).`,
    ip: req.ip,
  });

  res.status(201).json({ mensagem: 'Aposta registrada! Aguarde o encerramento da rodada.', aposta: { id: Number(infoAposta.lastInsertRowid) }, saldo: novoSaldo });
});

// Histórico de apostas do próprio jogador
router.get('/api/apostas/minhas', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const apostas = db
    .prepare(
      `SELECT a.*, r.status AS rodada_status, r.data_encerramento
       FROM apostas a JOIN rodadas r ON r.id = a.rodada_id
       WHERE a.usuario_id = ? ORDER BY a.id DESC LIMIT 100`
    )
    .all(req.usuario.id);
  res.json({ apostas });
});

module.exports = { router };
