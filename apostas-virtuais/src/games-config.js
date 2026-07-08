'use strict';

/**
 * Configuração central dos jogos do Evlurn.
 *
 * ─── ECONOMIA DOS JOGOS ───────────────────────────────────
 * Todos os jogos têm leve vantagem para o sistema (house edge),
 * balanceada pelo fato de que jogadores têm múltiplas fontes de
 * ganho fora das apostas (missões, login diário, indicações, etc.).
 *
 * Roleta Primal    → house edge ~7%  (33.3% × 2.8 − 1 = −6.76%)
 * Joga a Moeda     → house edge ~6%  (49.5% × 1.9 − 1 = −5.95%)
 * Cofre Misterioso → house edge ~7%  (EV ponderado = 0.929)
 * Tudo ou Nada     → edge variável por faixa de ranking
 *
 * ─── TIPOS DE JOGO ──────────────────────────────────────
 * "rodada"     → social/coletivo; depende do scheduler para abrir/fechar
 * "individual" → instantâneo; cada jogador joga sozinho via rota própria
 */

const GAMES = {
  roleta_primal: {
    id: 'roleta_primal',
    nome: 'Roleta Primária',
    tipo: 'escolha',   // FIX: era 'rodada' — o jogador ESCOLHE uma cor e só ganha se acertar
    usaRodadas: true,  // indica que este jogo usa o sistema de rodadas do scheduler
    descricao: 'Jogo social coletivo. Escolha uma cor antes do fechamento. Só ganha quem acertar.',
    opcoes: {
      azul:     { label: 'Azul',     prob: 33.3,  mult: 2.8  },
      verde:    { label: 'Verde',    prob: 33.3,  mult: 2.8  },
      vermelho: { label: 'Vermelho', prob: 33.3,  mult: 2.8  },
      preto:    { label: 'Preto',    prob: 0.1,   mult: 10   }, // jackpot raro
    },
  },

  joga_moeda: {
    id: 'joga_moeda',
    nome: 'Joga a Moeda',
    tipo: 'individual', // instantâneo — sem rodadas
    descricao: 'Escolha cara ou coroa. Resultado imediato. Cuidado: 1% de cair no lado e perder a aposta.',
    opcoes: {
      cara:  { label: 'Cara',  prob: 49.5, mult: 1.9 },
      coroa: { label: 'Coroa', prob: 49.5, mult: 1.9 },
      lado:  { label: 'Lado',  prob: 1,    mult: 0, perdeAposta: true },
    },
  },

  cofre_misterioso: {
    id: 'cofre_misterioso',
    nome: 'Cofre Misterioso',
    tipo: 'individual', // instantâneo — sem rodadas
    descricao: 'Aposte um valor e abra o cofre. O que estará dentro? Máximo de 10 aberturas por dia.',
    limiteDiario: 10,
    opcoes: {
      bronze:   { label: 'Bronze',   prob: 45, mult: 0.60 }, // dreno constante
      prata:    { label: 'Prata',    prob: 30, mult: 0.90 }, // quase neutro
      ouro:     { label: 'Ouro',     prob: 15, mult: 1.10 }, // leve ganho
      diamante: { label: 'Diamante', prob: 8,  mult: 1.80 }, // bom ganho
      lendario: { label: 'Lendário', prob: 2,  mult: 4.00 }, // jackpot
    },
    // EV ponderado: 0.45×0.60 + 0.30×0.90 + 0.15×1.10 + 0.08×1.80 + 0.02×4.00
    //             = 0.27 + 0.27 + 0.165 + 0.144 + 0.08 = 0.929 → house edge 7.1%
  },

  tudo_ou_nada: {
    id: 'tudo_ou_nada',
    nome: 'Tudo ou Nada',
    tipo: 'individual',
    descricao: 'Escolha quanto do seu saldo arriscar. Suas chances dependem de onde você está no ranking.',
    faixas: [
      { label: 'Top 10',       rankMin: 1,  rankMax: 10,  chanceGanho: 60, retorno: 0.20 },
      { label: 'Posições 11–50', rankMin: 11, rankMax: 50, chanceGanho: 65, retorno: 0.25 },
      { label: 'Abaixo do Top 50', rankMin: 51, rankMax: null, chanceGanho: 70, retorno: 0.30 },
    ],
    percentuaisDisponiveis: [10, 25, 50, 100],
  },
};

function faixaTudoOuNada(posicaoRanking) {
  const faixas = GAMES.tudo_ou_nada.faixas;
  for (const f of faixas) {
    if (posicaoRanking >= f.rankMin && (f.rankMax === null || posicaoRanking <= f.rankMax)) return f;
  }
  return faixas[faixas.length - 1];
}

function listarJogos() {
  return Object.values(GAMES).map((g) => ({
    id: g.id,
    nome: g.nome,
    tipo: g.tipo,
    descricao: g.descricao,
    opcoes: g.opcoes || null,
    faixas: g.faixas || null,
    percentuaisDisponiveis: g.percentuaisDisponiveis || null,
    limiteDiario: g.limiteDiario || null,
  }));
}

function obterJogo(jogoId) { return GAMES[jogoId] || null; }

module.exports = { GAMES, listarJogos, obterJogo, faixaTudoOuNada };
