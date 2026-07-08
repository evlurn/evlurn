'use strict';

/**
 * Configuração central da plataforma.
 * Mude PLATFORM_NAME e PLATFORM_DOMAIN aqui — o restante do sistema usa essas constantes.
 * Quando o nome definitivo for decidido, basta atualizar este arquivo.
 */

const PLATFORM = {
  NAME: 'Evlurn',          // <- substituir quando o nome for definido
  DOMAIN: 'evlurn.app',    // <- substituir junto com o domínio
  TAGLINE: 'Learn · Earn · Evolve',
  ADMIN_EMAIL: '',           // preencher ao configurar o servidor de produção
};

module.exports = { PLATFORM };
