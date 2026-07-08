'use strict';

const { db } = require('../db');

const PATENTES = [
  { slug: 'visitante',         nome: 'Visitante',         icone: '👤', streakMin: 0,   fichasDia: 0,   bonusMult: 0.00 },
  { slug: 'frequentador',      nome: 'Frequentador',      icone: '🚶', streakMin: 3,   fichasDia: 5,   bonusMult: 0.01 },
  { slug: 'participante',      nome: 'Participante',      icone: '🎮', streakMin: 7,   fichasDia: 10,  bonusMult: 0.02 },
  { slug: 'apostador',         nome: 'Apostador',         icone: '🎲', streakMin: 14,  fichasDia: 20,  bonusMult: 0.03 },
  { slug: 'competidor',        nome: 'Competidor',        icone: '⚡', streakMin: 21,  fichasDia: 35,  bonusMult: 0.05 },
  { slug: 'estrategista',      nome: 'Estrategista',      icone: '🧠', streakMin: 30,  fichasDia: 50,  bonusMult: 0.07 },
  { slug: 'veterano',          nome: 'Veterano',          icone: '🔥', streakMin: 60,  fichasDia: 70,  bonusMult: 0.09 },
  { slug: 'magnata',           nome: 'Magnata',           icone: '💎', streakMin: 90,  fichasDia: 100, bonusMult: 0.12 },
  { slug: 'lenda_viva',        nome: 'Lenda Viva',        icone: '👑', streakMin: 180, fichasDia: 135, bonusMult: 0.16 },
  { slug: 'mestre_da_fortuna', nome: 'Mestre da Fortuna', icone: '🏆', streakMin: 365, fichasDia: 180, bonusMult: 0.22 },
];

function obterPatente(streakAtual) {
  let patente = PATENTES[0];
  for (const p of PATENTES) {
    if (streakAtual >= p.streakMin) patente = p;
  }
  return patente;
}

function xpParaNivel(nivel) { return nivel * 100; }

function calcularNivel(xpTotal) {
  let nivel = 1, xpGasto = 0;
  while (nivel < 50) {
    const custo = xpParaNivel(nivel);
    if (xpGasto + custo > xpTotal) break;
    xpGasto += custo;
    nivel++;
  }
  const xpNivelAtual = xpTotal - xpGasto;
  const xpProximo = nivel < 50 ? xpParaNivel(nivel) : 0;
  return { nivel, xpNivelAtual, xpProximo, percentual: xpProximo > 0 ? Math.floor((xpNivelAtual / xpProximo) * 100) : 100 };
}

function bonusNivel(nivel) { return Number(((nivel - 1) / 49 * 0.10).toFixed(4)); }

const TITULOS_COM_BONUS = { lendario: 0.02, milionario: 0.02, conquistador: 0.01, fenix: 0.01 };

function bonusTitulos(usuarioId) {
  try {
    const conquistados = db.prepare('SELECT titulo_slug FROM usuario_titulos WHERE usuario_id = ?').all(usuarioId).map((r) => r.titulo_slug);
    return conquistados.reduce((soma, slug) => soma + (TITULOS_COM_BONUS[slug] || 0), 0);
  } catch(e) { return 0; }
}

function multEvento(jogoId = null) {
  try {
    const agora = new Date().toISOString();
    const ativos = db.prepare(
      `SELECT multiplicador FROM eventos WHERE ativo = 1 AND data_inicio <= ? AND data_fim >= ?
       AND (jogos IS NULL OR jogos = '' OR instr(',' || jogos || ',', ?) > 0)`
    ).all(agora, agora, jogoId ? `,${jogoId},` : ',');
    return ativos.length ? Math.max(...ativos.map((e) => Number(e.multiplicador))) : 1;
  } catch(e) { return 1; }
}

function calcularMultiplicadorTotal(usuario, jogoId = null) {
  const { nivel } = calcularNivel(usuario.xp || 0);
  const streak = usuario.streak_atual || 0;
  const patente = obterPatente(streak);
  const bNivel = bonusNivel(nivel);
  const bPatente = patente.bonusMult;
  const bTitulos = bonusTitulos(usuario.id);
  const mEvento = multEvento(jogoId);
  const bonusSomado = Math.min(bNivel + bPatente + bTitulos, 0.50);
  const fatorFinal = Number(((1 + bonusSomado) * mEvento).toFixed(4));
  return { fatorFinal, detalhes: { nivel, patente: patente.slug, patenteNome: `${patente.icone} ${patente.nome}`, bonusNivel: Number((bNivel*100).toFixed(1)), bonusPatente: Number((bPatente*100).toFixed(1)), bonusTitulos: Number((bTitulos*100).toFixed(1)), bonusSomado: Number((bonusSomado*100).toFixed(1)), multEvento: mEvento } };
}

module.exports = { PATENTES, obterPatente, calcularNivel, calcularMultiplicadorTotal, multEvento };
