'use strict';

const { Router } = require('../http');
const { db } = require('../db');
const { exigirAutenticacao } = require('../middleware');

const router = new Router();

function calcularRanking() {
  return db
    .prepare(`SELECT id, nome, apelido, saldo FROM usuarios WHERE status = 'ativo' ORDER BY saldo DESC, id ASC`)
    .all()
    .map((u, idx) => ({ posicao: idx + 1, ...u }));
}

router.get('/api/player/home', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const ranking = calcularRanking();
  const minhaPosicao = ranking.find((r) => r.id === req.usuario.id);
  res.json({
    usuario: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      apelido: req.usuario.apelido,
      saldo: req.usuario.saldo,
      admin: Boolean(req.usuario.admin),
    },
    posicaoRanking: minhaPosicao ? minhaPosicao.posicao : null,
    totalJogadores: ranking.length,
  });
});

router.get('/api/player/ranking', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  res.json({ ranking: calcularRanking() });
});

module.exports = { router, calcularRanking };
