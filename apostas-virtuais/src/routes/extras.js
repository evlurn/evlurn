'use strict';

const { Router } = require('../http');
const { db } = require('../db');
const { exigirAutenticacao, exigirAdmin } = require('../middleware');
const { registrarLog } = require('../utils/logger');
const { hashPassword, verifyPassword } = require('../utils/security');
const { destruirSessao } = require('../sessions');

const router = new Router();

// ─── SUGESTÕES ────────────────────────────────────────────
router.post('/api/sugestoes', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { texto } = req.body || {};
  if (!texto || texto.trim().length < 10) {
    return res.status(400).json({ erro: 'A sugestão precisa ter pelo menos 10 caracteres.' });
  }
  if (texto.trim().length > 1000) {
    return res.status(400).json({ erro: 'Sugestão muito longa. Máximo de 1000 caracteres.' });
  }
  const agora = new Date().toISOString();
  const info = db.prepare(
    'INSERT INTO sugestoes (usuario_id, texto, data, lida) VALUES (?, ?, ?, 0)'
  ).run(req.usuario.id, texto.trim(), agora);

  registrarLog({
    usuarioAfetado: req.usuario.id,
    tipoAcao: 'sugestao_enviada',
    descricao: `"${req.usuario.apelido}" enviou uma sugestão (ID ${info.lastInsertRowid}).`,
    ip: req.ip,
  });
  res.status(201).json({ mensagem: 'Sugestão enviada! Obrigado pelo feedback.' });
});

// Admin: listar e marcar sugestões como lidas
router.get('/api/admin/sugestoes', (req, res) => {
  if (!exigirAdmin(req, res)) return;
  const sugestoes = db.prepare(
    `SELECT s.*, u.apelido, u.nome FROM sugestoes s
     JOIN usuarios u ON u.id = s.usuario_id
     ORDER BY s.lida ASC, s.data DESC LIMIT 100`
  ).all();
  res.json({ sugestoes });
});

router.post('/api/admin/sugestoes/:id/lida', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  db.prepare('UPDATE sugestoes SET lida = 1 WHERE id = ?').run(params.id);
  res.json({ mensagem: 'Marcada como lida.' });
});

// ─── NOTIFICAÇÕES ─────────────────────────────────────────
// Sistema simples: retorna contagem de itens pendentes relevantes para o usuário
router.get('/api/notificacoes', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const hoje = new Date().toISOString().slice(0, 10);
  const notificacoes = [];

  // Verifica se é o primeiro login do dia (login diário disponível)
  const ultimoLogin = req.usuario.ultimo_login;
  const ultimaData = ultimoLogin ? ultimoLogin.slice(0, 10) : null;
  if (ultimaData !== hoje) {
    notificacoes.push({
      tipo: 'login_diario',
      mensagem: 'Confirme sua presença diária e ganhe moedas!',
      acao: 'login_diario',
    });
  }

  // Para admin: cadastros pendentes não lidos
  if (req.usuario.admin) {
    const pendentes = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE status = 'pendente'").get().n;
    if (pendentes > 0) {
      notificacoes.push({
        tipo: 'admin_pendentes',
        mensagem: `${pendentes} cadastro(s) aguardando aprovação.`,
        acao: 'admin_pendentes',
      });
    }
    const sugestoesPendentes = db.prepare('SELECT COUNT(*) AS n FROM sugestoes WHERE lida = 0').get().n;
    if (sugestoesPendentes > 0) {
      notificacoes.push({
        tipo: 'admin_sugestoes',
        mensagem: `${sugestoesPendentes} sugestão(ões) não lida(s).`,
        acao: 'admin_sugestoes',
      });
    }
  }

  res.json({ notificacoes, total: notificacoes.length });
});

// ─── LOGIN DIÁRIO ──────────────────────────────────────────
router.post('/api/login-diario/confirmar', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const hoje = new Date().toISOString().slice(0, 10);
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  const ultimoLogin = usuario.ultimo_login ? usuario.ultimo_login.slice(0, 10) : null;

  if (ultimoLogin === hoje) {
    return res.status(409).json({ erro: 'Presença diária já confirmada hoje.' });
  }

  // Calcular streak
  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const novoStreak = ultimoLogin === ontem ? (usuario.streak_atual || 0) + 1 : 1;

  // Recompensa base + bônus por streak
  const recompensaBase = 10;
  const bonusStreak = Math.min(novoStreak * 2, 50); // máx 50 de bônus
  const totalMoedas = recompensaBase + bonusStreak;
  const xpGanho = 3;
  const agora = new Date().toISOString();
  const novoSaldo = usuario.saldo + totalMoedas;

  db.prepare(
    'UPDATE usuarios SET saldo = ?, streak_atual = ?, ultimo_login = ? WHERE id = ?'
  ).run(novoSaldo, novoStreak, agora, usuario.id);

  db.prepare(
    `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
     VALUES (?, 'login_diario', ?, ?, ?, ?, ?)`
  ).run(usuario.id, totalMoedas, usuario.saldo, novoSaldo,
    `Login diário — Streak ${novoStreak} dias (+${bonusStreak} bônus)`, agora);

  registrarLog({
    usuarioAfetado: usuario.id,
    tipoAcao: 'login_diario',
    descricao: `"${usuario.apelido}" confirmou presença diária. Streak: ${novoStreak} dias. +${totalMoedas} moedas.`,
    ip: req.ip,
  });

  res.json({
    mensagem: `Presença confirmada! +${totalMoedas} moedas`,
    moedas: totalMoedas,
    bonusStreak,
    streak: novoStreak,
    novoSaldo,
    xpGanho,
  });
});

// ─── TRIVIA DIÁRIA ─────────────────────────────────────────
const TRIVIA_BANCO = [
  { pergunta: 'Qual é o país com mais usuários de internet do mundo?', opcoes: ['EUA', 'China', 'India', 'Brasil'], correta: 1, explicacao: 'A China tem mais de 1 bilhão de usuários de internet.' },
  { pergunta: 'Qual empresa criou o sistema operacional Android?', opcoes: ['Apple', 'Microsoft', 'Google', 'Samsung'], correta: 2, explicacao: 'O Android foi criado pela Android Inc. e adquirido pelo Google em 2005.' },
  { pergunta: 'Quantos bits tem um byte?', opcoes: ['4', '8', '16', '32'], correta: 1, explicacao: '1 byte = 8 bits. Isso é padrão na computação moderna.' },
  { pergunta: 'O que significa "HTML"?', opcoes: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Main Layer', 'Home Tool Markup Language'], correta: 0, explicacao: 'HTML é a linguagem de marcação padrão para criar páginas web.' },
  { pergunta: 'Qual o país com maior PIB do mundo?', opcoes: ['China', 'EUA', 'Alemanha', 'Japão'], correta: 1, explicacao: 'Os EUA possuem o maior PIB nominal do mundo, com cerca de US$ 27 trilhões (2024).' },
  { pergunta: 'Quem escreveu "Dom Quixote"?', opcoes: ['Lope de Vega', 'Miguel de Cervantes', 'Gabriel García Márquez', 'Jorge Luis Borges'], correta: 1, explicacao: 'Miguel de Cervantes publicou Dom Quixote em 1605, considerado o primeiro romance moderno.' },
  { pergunta: 'Qual é o menor planeta do Sistema Solar?', opcoes: ['Mercúrio', 'Marte', 'Plutão', 'Vênus'], correta: 0, explicacao: 'Mercúrio é o menor planeta — Plutão foi reclassificado como planeta-anão em 2006.' },
  { pergunta: 'Em que ano o Brasil sediou a Copa do Mundo?', opcoes: ['2010', '2012', '2014', '2016'], correta: 2, explicacao: 'O Brasil sediou a Copa do Mundo FIFA em 2014, com a famosa goleada de 7×1 da Alemanha.' },
  { pergunta: 'Qual é a fórmula química da água?', opcoes: ['H2O', 'CO2', 'O2', 'NaCl'], correta: 0, explicacao: 'H2O: dois átomos de hidrogênio e um de oxigênio.' },
  { pergunta: 'Qual é a capital da Austrália?', opcoes: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correta: 2, explicacao: 'Canberra é a capital — muitos pensam que é Sydney, mas Sydney é apenas a maior cidade.' },
];

router.get('/api/trivia/hoje', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const diaDoAno = Math.floor((Date.now() / 86400000)) % TRIVIA_BANCO.length;
  const trivia = TRIVIA_BANCO[diaDoAno];
  // Não envia a resposta correta no GET — só no POST de resposta
  res.json({
    id: diaDoAno,
    pergunta: trivia.pergunta,
    opcoes: trivia.opcoes,
  });
});

router.post('/api/trivia/responder', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { id, resposta } = req.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const todayId = Math.floor(Date.now() / 86400000) % TRIVIA_BANCO.length;
  if (!Number.isInteger(id) || id !== todayId || !Number.isInteger(resposta) || resposta < 0 || resposta >= TRIVIA_BANCO[id].opcoes.length) {
    return res.status(400).json({ erro: 'Resposta ou trivia inválida para hoje.' });
  }
  db.exec('BEGIN IMMEDIATE');
  try {
  if (db.prepare("SELECT 1 FROM movimentacoes WHERE usuario_id = ? AND tipo = 'trivia' AND substr(data, 1, 10) = ?").get(req.usuario.id, today)) {
    db.exec('ROLLBACK');
    return res.status(409).json({ erro: 'Você já respondeu à trivia de hoje.' });
  }
  const trivia = TRIVIA_BANCO[id];


  const acertou = Number(resposta) === trivia.correta;
  const recompensa = acertou ? 25 : 5; // ganha menos mesmo errando (incentivo a participar)
  const agora = new Date().toISOString();
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  const novoSaldo = usuario.saldo + recompensa;

  db.prepare('UPDATE usuarios SET saldo = ? WHERE id = ?').run(novoSaldo, usuario.id);
  db.prepare(
    `INSERT INTO movimentacoes (usuario_id, tipo, valor, saldo_anterior, saldo_novo, motivo, data)
     VALUES (?, 'trivia', ?, ?, ?, ?, ?)`
  ).run(usuario.id, recompensa, usuario.saldo, novoSaldo,
    `Trivia diária: ${acertou ? 'acertou' : 'errou'} (+${recompensa})`, agora);

  db.exec('COMMIT');
  res.json({
    acertou,
    respostaCorreta: trivia.correta,
    opcaoCorreta: trivia.opcoes[trivia.correta],
    explicacao: trivia.explicacao,
    recompensa,
    novoSaldo,
  });
  } catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
});

// ─── CONFIGURAÇÕES DE CONTA ────────────────────────────────
router.get('/api/conta/configuracoes', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const u = db.prepare(
    'SELECT id, nome, apelido, data_nascimento, identidade_genero, identidade_genero_outro, data_cadastro, streak_atual, ultimo_login FROM usuarios WHERE id = ?'
  ).get(req.usuario.id);
  res.json({ conta: u });
});

router.post('/api/conta/alterar-senha', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body || {};
  if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha precisa ter ao menos 6 caracteres.' });
  }
  if (novaSenha !== confirmarNovaSenha) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!verifyPassword(senhaAtual, usuario.senha_hash)) {
    return res.status(401).json({ erro: 'Senha atual incorreta.' });
  }
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(hashPassword(novaSenha), usuario.id);
  registrarLog({
    usuarioAfetado: usuario.id,
    tipoAcao: 'senha_alterada',
    descricao: `"${usuario.apelido}" alterou a própria senha.`,
    ip: req.ip,
  });
  db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(usuario.id);
  res.clearCookie('sessao');
  res.json({ mensagem: 'Senha alterada. Entre novamente para continuar.' });
});

// Exclusão de conta pelo próprio usuário (soft delete → status 'excluido')
router.delete('/api/conta', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { senha } = req.body || {};
  if (!senha) return res.status(400).json({ erro: 'Confirme sua senha para excluir a conta.' });
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!verifyPassword(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }
  if (usuario.admin) {
    return res.status(403).json({ erro: 'Contas de administrador não podem ser excluídas por este meio.' });
  }
  const agora = new Date().toISOString();
  // Anonimiza dados pessoais e marca como excluída (LGPD: direito ao esquecimento)
  db.prepare(
    "UPDATE usuarios SET status = 'excluido', nome = '[conta excluída]', senha_hash = '', data_nascimento = NULL, identidade_genero = NULL WHERE id = ?"
  ).run(usuario.id);
  if (req.tokenSessao) destruirSessao(req.tokenSessao);
  registrarLog({
    usuarioAfetado: usuario.id,
    tipoAcao: 'conta_excluida',
    descricao: `Conta de "${usuario.apelido}" foi excluída e anonimizada a pedido do próprio usuário.`,
    ip: req.ip,
  });
  res.json({ mensagem: 'Conta excluída. Seus dados pessoais foram removidos.' });
});

// Admin: excluir conta de outro usuário
router.delete('/api/admin/usuarios/:id', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  if (usuario.admin) return res.status(403).json({ erro: 'Não é possível excluir outro administrador.' });
  db.prepare(
    "UPDATE usuarios SET status = 'excluido', nome = '[conta excluída]', senha_hash = '', data_nascimento = NULL, identidade_genero = NULL WHERE id = ?"
  ).run(params.id);
  registrarLog({
    usuarioAfetado: usuario.id,
    adminResponsavel: req.usuario.id,
    tipoAcao: 'conta_excluida_admin',
    descricao: `Conta de "${usuario.apelido}" excluída pelo admin "${req.usuario.apelido}".`,
    ip: req.ip,
  });
  res.json({ mensagem: `Conta de "${usuario.apelido}" excluída.` });
});


// ─── EDIÇÃO DE PERFIL (pelo próprio usuário) ────────────
router.get('/api/conta/perfil', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const u = db.prepare(
    'SELECT id, nome, apelido, data_nascimento, identidade_genero, identidade_genero_outro FROM usuarios WHERE id = ?'
  ).get(req.usuario.id);
  res.json({ perfil: u });
});

router.put('/api/conta/perfil', (req, res) => {
  if (!exigirAutenticacao(req, res)) return;
  const { nome, dataNascimento, identidadeGenero, identidadeGeneroOutro } = req.body || {};

  if (nome !== undefined && nome.trim().length < 2) {
    return res.status(400).json({ erro: 'O nome precisa ter pelo menos 2 caracteres.' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  const novoNome = (nome || '').trim() || usuario.nome;
  const novaDataNasc = dataNascimento !== undefined ? (dataNascimento || null) : usuario.data_nascimento;
  const novoGenero = identidadeGenero !== undefined ? (identidadeGenero || null) : usuario.identidade_genero;
  const novoGeneroOutro = identidadeGeneroOutro !== undefined ? (identidadeGeneroOutro || null) : usuario.identidade_genero_outro;

  db.prepare(
    'UPDATE usuarios SET nome = ?, data_nascimento = ?, identidade_genero = ?, identidade_genero_outro = ? WHERE id = ?'
  ).run(novoNome, novaDataNasc, novoGenero, novoGeneroOutro, req.usuario.id);

  registrarLog({
    usuarioAfetado: req.usuario.id,
    tipoAcao: 'perfil_atualizado',
    descricao: `"${usuario.apelido}" atualizou o próprio perfil.`,
    ip: req.ip,
  });
  res.json({ mensagem: 'Perfil atualizado com sucesso.' });
});

// ─── EDIÇÃO DE PERFIL (pelo admin) ───────────────────────
router.put('/api/admin/usuarios/:id/perfil', (req, res, params) => {
  if (!exigirAdmin(req, res)) return;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const { nome, apelido, dataNascimento, identidadeGenero, identidadeGeneroOutro, status } = req.body || {};

  // Validações
  if (nome !== undefined && (nome || '').trim().length < 2) {
    return res.status(400).json({ erro: 'Nome muito curto.' });
  }
  if (apelido !== undefined) {
    const ap = (apelido || '').trim();
    if (ap.length < 3) return res.status(400).json({ erro: 'Apelido muito curto (mínimo 3 caracteres).' });
    const conflito = db.prepare('SELECT id FROM usuarios WHERE apelido = ? AND id != ?').get(ap, params.id);
    if (conflito) return res.status(409).json({ erro: 'Esse apelido já está em uso por outro usuário.' });
  }
  const statusValidos = ['ativo', 'pendente', 'rejeitado', 'excluido'];
  if (status !== undefined && !statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}.` });
  }

  const novoNome     = (nome    || '').trim() || usuario.nome;
  const novoApelido  = (apelido || '').trim() || usuario.apelido;
  const novoStatus   = status   !== undefined ? status : usuario.status;
  const novaDataNasc = dataNascimento   !== undefined ? (dataNascimento   || null) : usuario.data_nascimento;
  const novoGenero   = identidadeGenero !== undefined ? (identidadeGenero || null) : usuario.identidade_genero;
  const novoGeneroOutro = identidadeGeneroOutro !== undefined ? (identidadeGeneroOutro || null) : usuario.identidade_genero_outro;

  db.prepare(
    'UPDATE usuarios SET nome = ?, apelido = ?, data_nascimento = ?, identidade_genero = ?, identidade_genero_outro = ?, status = ? WHERE id = ?'
  ).run(novoNome, novoApelido, novaDataNasc, novoGenero, novoGeneroOutro, novoStatus, params.id);

  registrarLog({
    usuarioAfetado: params.id,
    adminResponsavel: req.usuario.id,
    tipoAcao: 'perfil_editado_admin',
    descricao: `Admin "${req.usuario.apelido}" editou o perfil de "${usuario.apelido}": nome="${novoNome}", apelido="${novoApelido}", status="${novoStatus}".`,
    ip: req.ip,
  });
  res.json({ mensagem: 'Perfil do usuário atualizado.' });
});

module.exports = { router };
