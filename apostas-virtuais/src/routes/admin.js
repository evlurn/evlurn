'use strict';

const { Router } = require('../http');
const { db, getConfig, setConfig } = require('../db');
const { exigirAdmin } = require('../middleware');
const { registrarLog } = require('../utils/logger');
const { listarJogos } = require('../games-config');
const { abrirRodada, encerrarRodada } = require('../services/rodadas');
const { calcularRanking } = require('./player');

const router = new Router();

// ---------- DASHBOARD ----------
router.get('/api/admin/dashboard', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const ativos = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE status = 'ativo'").get().n;
  const pendentes = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE status = 'pendente'").get().n;
  const moedasEmCirculacao = db.prepare("SELECT COALESCE(SUM(saldo),0) AS total FROM usuarios WHERE status = 'ativo'").get().total;
  const rodadasAbertas = db.prepare("SELECT COUNT(*) AS n FROM rodadas WHERE status = 'aberta'").get().n;
  const apostasHoje = db.prepare("SELECT COUNT(*) AS n FROM apostas WHERE date(data) = date('now')").get().n;

  res.json({
    ativos,
    pendentes,
    moedasEmCirculacao,
    rodadasAbertas,
    apostasHoje,
    saldoInicial: Number(getConfig('saldo_inicial', 1000)),
    bonusIndicacao: Number(getConfig('bonus_indicacao', 200)),
    schedulerAtivo: getConfig('scheduler_ativo', 'false') === 'true',
    schedulerIntervaloMin: Number(getConfig('scheduler_intervalo_min', 5)),
    schedulerJogos: getConfig('scheduler_jogos', '').split(',').map((s) => s.trim()).filter(Boolean),
  });
});

router.post('/api/admin/config', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const { saldoInicial, bonusIndicacao, schedulerAtivo, schedulerIntervaloMin, schedulerJogos } = req.body || {};
  if (saldoInicial !== undefined) {
    if (!Number.isInteger(saldoInicial) || saldoInicial < 0) return res.status(400).json({ erro: 'Saldo inicial inválido.' });
    setConfig('saldo_inicial', saldoInicial);
  }
  if (bonusIndicacao !== undefined) {
    if (!Number.isInteger(bonusIndicacao) || bonusIndicacao < 0) return res.status(400).json({ erro: 'Bônus de indicação inválido.' });
    setConfig('bonus_indicacao', bonusIndicacao);
  }
  if (schedulerAtivo !== undefined) {
    setConfig('scheduler_ativo', schedulerAtivo ? 'true' : 'false');
  }
  if (schedulerIntervaloMin !== undefined) {
    if (!Number.isInteger(schedulerIntervaloMin) || schedulerIntervaloMin < 1) return res.status(400).json({ erro: 'Intervalo mínimo é 1 minuto.' });
    setConfig('scheduler_intervalo_min', schedulerIntervaloMin);
  }
  if (Array.isArray(schedulerJogos)) {
    setConfig('scheduler_jogos', schedulerJogos.join(','));
  }
  registrarLog({ adminResponsavel: req.usuario.id, tipoAcao: 'ajuste_config', descricao: `Configurações atualizadas por "${req.usuario.apelido}".`, ip: req.ip });
  res.json({ mensagem: 'Configurações atualizadas.' });
});

// ---------- CADASTROS PENDENTES ----------
router.get('/api/admin/pendentes', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const pendentes = db
    .prepare(
      `SELECT u.id, u.nome, u.apelido, u.data_cadastro, i.nome AS indicador_nome, i.apelido AS indicador_apelido
       FROM usuarios u LEFT JOIN usuarios i ON i.id = u.indicador_id
       WHERE u.status = 'pendente' ORDER BY u.data_cadastro ASC`
    )
    .all();
  res.json({ pendentes });
});

router.post('/api/admin/pendentes/:id/aprovar', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario || usuario.status !== 'pendente') return res.status(404).json({ erro: 'Cadastro pendente não encontrado.' });

  const saldoInicial = Number(getConfig('saldo_inicial', 1000));
  const agora = new Date().toISOString();

  db.prepare("UPDATE usuarios SET status = 'ativo', saldo = ? WHERE id = ?").run(saldoInicial, usuario.id);
  db.prepare(
    `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
     VALUES (?, 'saldo_inicial', ?, 0, ?, 'Cadastro aprovado - saldo inicial', ?)`
  ).run(usuario.id, saldoInicial, saldoInicial, agora);

  registrarLog({ usuarioAfetado: usuario.id, adminResponsavel: req.usuario.id, tipoAcao: 'cadastro_aprovado', descricao: `Cadastro de "${usuario.apelido}" aprovado por "${req.usuario.apelido}". Saldo inicial: ${saldoInicial}.`, ip: req.ip });

  if (usuario.indicador_id) {
    const bonus = Number(getConfig('bonus_indicacao', 200));
    const indicador = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuario.indicador_id);
    if (indicador) {
      const novoSaldoIndicador = indicador.saldo + bonus;
      db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldoIndicador, indicador.id);
      db.prepare(
        `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
         VALUES (?, 'bonus_indicacao', ?, ?, ?, ?, ?)`
      ).run(indicador.id, bonus, indicador.saldo, novoSaldoIndicador, `Bônus por indicar "${usuario.apelido}"`, agora);
      registrarLog({ usuarioAfetado: indicador.id, adminResponsavel: req.usuario.id, tipoAcao: 'bonus_indicacao', descricao: `"${indicador.apelido}" recebeu ${bonus} moedas de bônus por indicar "${usuario.apelido}".`, ip: req.ip });
    }
  }

  res.json({ mensagem: 'Cadastro aprovado com sucesso.' });
});

router.post('/api/admin/pendentes/:id/rejeitar', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario || usuario.status !== 'pendente') return res.status(404).json({ erro: 'Cadastro pendente não encontrado.' });

  db.prepare("UPDATE usuarios SET status = 'rejeitado' WHERE id = ?").run(usuario.id);
  registrarLog({ usuarioAfetado: usuario.id, adminResponsavel: req.usuario.id, tipoAcao: 'cadastro_rejeitado', descricao: `Cadastro de "${usuario.apelido}" rejeitado por "${req.usuario.apelido}".`, ip: req.ip });

  res.json({ mensagem: 'Cadastro rejeitado.' });
});

// ---------- USUÁRIOS ----------
router.get('/api/admin/usuarios', (req, res, params, query) => {
  if (!exigirAdmin(req, res)) return;
  const termo = (query.busca || '').trim();
  let usuarios;
  if (termo) {
    const like = `%${termo}%`;
    usuarios = db
      .prepare(`SELECT id, nome, apelido, saldo, status, admin FROM usuarios WHERE CAST(id AS TEXT) = ? OR nome LIKE ? OR apelido LIKE ? ORDER BY nome`)
      .all(termo, like, like);
  } else {
    usuarios = db.prepare('SELECT id, nome, apelido, saldo, status, admin FROM usuarios ORDER BY nome').all();
  }
  res.json({ usuarios });
});

router.get('/api/admin/usuarios/:id', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT id, nome, apelido, saldo, status, admin, data_cadastro, indicador_id FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const historico = db.prepare('SELECT * FROM movimentacoes WHERE usuario_id = ? ORDER BY id DESC LIMIT 50').all(usuario.id);
  const apostas = db.prepare('SELECT * FROM apostas WHERE usuario_id = ? ORDER BY id DESC LIMIT 50').all(usuario.id);

  res.json({ usuario, historico, apostas });
});

router.post('/api/admin/usuarios/:id/ajustar', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const { valor, motivo, tipo } = req.body || {};
  if (!Number.isInteger(valor) || valor <= 0) return res.status(400).json({ erro: 'Informe um valor inteiro positivo.' });
  if (!['adicionar', 'remover'].includes(tipo)) return res.status(400).json({ erro: 'Tipo deve ser "adicionar" ou "remover".' });
  if (!motivo || !motivo.trim()) return res.status(400).json({ erro: 'Informe o motivo do ajuste.' });

  const delta = tipo === 'adicionar' ? valor : -valor;
  const novoSaldo = usuario.saldo + delta;
  if (novoSaldo < 0) return res.status(400).json({ erro: 'O ajuste deixaria o saldo negativo.' });

  const agora = new Date().toISOString();
  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
  db.prepare(
    `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
     VALUES (?, 'ajuste_admin', ?, ?, ?, ?, ?)`
  ).run(usuario.id, delta, usuario.saldo, novoSaldo, motivo.trim(), agora);

  registrarLog({
    usuarioAfetado: usuario.id,
    adminResponsavel: req.usuario.id,
    tipoAcao: 'ajuste_admin',
    descricao: `"${req.usuario.apelido}" ${tipo === 'adicionar' ? 'adicionou' : 'removeu'} ${valor} moedas de "${usuario.apelido}". Motivo: ${motivo.trim()}.`,
    ip: req.ip,
  });

  res.json({ mensagem: 'Saldo ajustado com sucesso.', novoSaldo });
});

// ---------- RODADAS ----------
router.get('/api/admin/rodadas', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const rodadas = db
    .prepare(
      `SELECT r.*, (SELECT COUNT(*) FROM apostas a WHERE a.rodada_id = r.id) AS total_apostas
       FROM rodadas r ORDER BY r.id DESC LIMIT 100`
    )
    .all();
  res.json({ rodadas, jogos: listarJogos() });
});

router.post('/api/admin/rodadas', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const { jogo } = req.body || {};
  try {
    const id = abrirRodada(jogo, req.usuario.id, req.ip);
    res.status(201).json({ mensagem: 'Rodada aberta com sucesso.', rodadaId: id });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.post('/api/admin/rodadas/:id/encerrar', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  try {
    const resultado = encerrarRodada(params.id, req.usuario.id, req.ip);
    res.json({ mensagem: 'Rodada encerrada e resultado sorteado.', ...resultado });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// ---------- RANKING (visão administrativa) ----------
router.get('/api/admin/ranking', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  res.json({ ranking: calcularRanking() });
});

// ---------- LOGS ----------
router.get('/api/admin/logs', (req, res, params, query) => {
  if (!exigirAdmin(req, res)) return;
  const termo = (query.busca || '').trim();
  let logs;
  if (termo) {
    const like = `%${termo}%`;
    logs = db
      .prepare(
        `SELECT l.*, ua.apelido AS usuario_afetado_apelido, ar.apelido AS admin_responsavel_apelido
         FROM logs l
         LEFT JOIN usuarios ua ON ua.id = l.usuario_afetado
         LEFT JOIN usuarios ar ON ar.id = l.admin_responsavel
         WHERE l.tipo_acao LIKE ? OR l.descricao LIKE ?
         ORDER BY l.id DESC LIMIT 200`
      )
      .all(like, like);
  } else {
    logs = db
      .prepare(
        `SELECT l.*, ua.apelido AS usuario_afetado_apelido, ar.apelido AS admin_responsavel_apelido
         FROM logs l
         LEFT JOIN usuarios ua ON ua.id = l.usuario_afetado
         LEFT JOIN usuarios ar ON ar.id = l.admin_responsavel
         ORDER BY l.id DESC LIMIT 200`
      )
      .all();
  }
  res.json({ logs });
});

// ---------- EVENTOS ----------
router.get('/api/admin/eventos', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const eventos = db.prepare('SELECT * FROM eventos ORDER BY data_inicio DESC LIMIT 50').all();
  res.json({ eventos });
});

router.post('/api/admin/eventos', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const { nome, descricao, multiplicador, bonusFixo, jogos, dataInicio, dataFim } = req.body || {};
  if (!nome || !descricao || !dataInicio || !dataFim) {
    return res.status(400).json({ erro: 'Nome, descrição, início e fim são obrigatórios.' });
  }
  if (new Date(dataFim) <= new Date(dataInicio)) {
    return res.status(400).json({ erro: 'A data de fim deve ser após o início.' });
  }
  const mult = Number(multiplicador) || 1.5;
  if (mult < 1 || mult > 10) return res.status(400).json({ erro: 'Multiplicador deve estar entre 1 e 10.' });

  const info = db.prepare(
    `INSERT INTO eventos (nome, descricao, multiplicador, bonus_fixo, jogos, data_inicio, data_fim, ativo, criado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(nome.trim(), descricao.trim(), mult, Number(bonusFixo) || 0, jogos || null, dataInicio, dataFim, req.usuario.id);

  registrarLog({
    adminResponsavel: req.usuario.id,
    tipoAcao: 'evento_criado',
    descricao: `Evento "${nome}" criado por "${req.usuario.apelido}". Multiplicador: ×${mult}. Período: ${dataInicio} → ${dataFim}.`,
    ip: req.ip,
  });
  res.status(201).json({ mensagem: 'Evento criado com sucesso.', id: Number(info.lastInsertRowid) });
});

router.post('/api/admin/eventos/:id/encerrar', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const evento = db.prepare('SELECT * FROM eventos WHERE id = ?').get(params.id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });
  db.prepare('UPDATE eventos SET ativo = 0 WHERE id = ?').run(params.id);
  registrarLog({
    adminResponsavel: req.usuario.id,
    tipoAcao: 'evento_encerrado',
    descricao: `Evento "${evento.nome}" encerrado manualmente por "${req.usuario.apelido}".`,
    ip: req.ip,
  });
  res.json({ mensagem: 'Evento encerrado.' });
});

module.exports = { router };
