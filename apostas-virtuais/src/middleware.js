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
  const { isIP } = require('node:net');
  const peer = normalizarIp(req.socket.remoteAddress);
  const trusted = new Set((process.env.TRUSTED_PROXY_IPS || '').split(',').map(s => normalizarIp(s.trim())).filter(Boolean));
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',').map(s => normalizarIp(s.trim()));
  req.ip = peer;
  // Walk from the socket toward the client; stop at the first untrusted hop.
  if (trusted.has(peer) && forwarded.every(ip => isIP(ip))) {
    const chain = [...forwarded, peer];
    while (chain.length > 1 && trusted.has(chain[chain.length - 1])) chain.pop();
    req.ip = chain[chain.length - 1];
  }
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
