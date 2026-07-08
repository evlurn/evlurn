'use strict';

const { parseCookies } = require('./http');
const { obterUsuarioPorToken } = require('./sessions');

/** Normaliza endereços IPv4 mapeados em IPv6 (::ffff:192.168.1.5 -> 192.168.1.5). */
function normalizarIp(ip) {
  if (!ip) return null;
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

/**
 * Resolve o usuário autenticado (se houver) a partir do cookie de sessão
 * e anexa em req.usuario. Também resolve o IP do cliente em req.ip, usado
 * para registrar de onde cada ação do log partiu. Não bloqueia a requisição.
 */
function identificarUsuario(req) {
  const cookies = parseCookies(req);
  const usuario = obterUsuarioPorToken(cookies.sessao);
  req.usuario = usuario;
  req.tokenSessao = cookies.sessao;
  // x-forwarded-for é usado quando o servidor roda detrás de um proxy/load
  // balancer; em uso direto na rede local, o IP vem do próprio socket.
  const forwardedFor = req.headers['x-forwarded-for'];
  req.ip = normalizarIp(forwardedFor ? forwardedFor.split(',')[0].trim() : req.socket.remoteAddress);
}

/** Exige que exista um usuário autenticado e ativo. */
function exigirAutenticacao(req, res) {
  if (!req.usuario) {
    res.status(401).json({ erro: 'Não autenticado. Faça login novamente.' });
    return false;
  }
  if (req.usuario.status !== 'ativo') {
    res.status(403).json({ erro: 'Sua conta ainda não foi aprovada ou está inativa.' });
    return false;
  }
  return true;
}

/** Exige que o usuário autenticado seja administrador. */
function exigirAdmin(req, res) {
  if (!exigirAutenticacao(req, res)) return false;
  if (!req.usuario.admin) {
    res.status(403).json({ erro: 'Acesso restrito a administradores.' });
    return false;
  }
  return true;
}

module.exports = { identificarUsuario, exigirAutenticacao, exigirAdmin };
