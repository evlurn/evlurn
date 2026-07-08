'use strict';

const crypto = require('node:crypto');

/**
 * Sorteia uma chave de um objeto de opções, respeitando os pesos (prob)
 * de cada uma. Usa crypto.randomInt para uma fonte de aleatoriedade de
 * melhor qualidade que Math.random().
 *
 * @param {Object} opcoes - ex: { azul: { prob: 33.33 }, preto: { prob: 0.01 } }
 * @returns {string} a chave sorteada
 */
function sortearOpcao(opcoes) {
  const entradas = Object.entries(opcoes);
  const somaProbabilidades = entradas.reduce((soma, [, o]) => soma + o.prob, 0);

  // Usamos precisão de 2 casas decimais (multiplicamos por 100) para
  // suportar probabilidades como 0,01% e 33,33% com números inteiros.
  const totalCentesimos = Math.round(somaProbabilidades * 100);
  let sorteio = crypto.randomInt(0, totalCentesimos);

  for (const [chave, opcao] of entradas) {
    const faixa = Math.round(opcao.prob * 100);
    if (sorteio < faixa) return chave;
    sorteio -= faixa;
  }

  // Fallback de segurança (não deveria ocorrer se as probabilidades somam 100)
  return entradas[entradas.length - 1][0];
}

module.exports = { sortearOpcao };
