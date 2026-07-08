'use strict';

const { db } = require('../db');

/**
 * Registra uma ação no log do sistema. Deve ser chamado para toda ação
 * relevante (cadastro, login, aposta, rodada, ajuste administrativo etc).
 *
 * @param {Object} entrada
 * @param {number|null} entrada.usuarioAfetado - id do usuário relacionado à ação
 * @param {number|null} entrada.adminResponsavel - id do admin que executou a ação (se houver)
 * @param {string} entrada.tipoAcao - identificador curto do tipo de ação
 * @param {string} entrada.descricao - descrição detalhada e legível da ação
 * @param {string|null} entrada.ip - endereço IP de onde partiu a requisição (se conhecido)
 */
function registrarLog({ usuarioAfetado = null, adminResponsavel = null, tipoAcao, descricao, ip = null }) {
  db.prepare(
    `INSERT INTO logs (data, usuario_afetado, admin_responsavel, tipo_acao, descricao, ip)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(new Date().toISOString(), usuarioAfetado, adminResponsavel, tipoAcao, descricao, ip);
}

module.exports = { registrarLog };
