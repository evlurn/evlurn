'use strict';

const crypto = require('node:crypto');

const SCRYPT_KEYLEN = 64;

/**
 * Gera um hash seguro de senha usando scrypt (módulo nativo do Node,
 * sem dependências externas). Formato armazenado: "salt:hash" em hex.
 */
function hashPassword(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica se a senha informada corresponde ao hash armazenado.
 * Usa timingSafeEqual para evitar ataques de timing.
 */
function verifyPassword(senha, hashArmazenado) {
  const [salt, hash] = String(hashArmazenado).split(':');
  if (!salt || !hash) return false;
  const hashTentativa = crypto.scryptSync(senha, salt, SCRYPT_KEYLEN);
  const hashOriginal = Buffer.from(hash, 'hex');
  if (hashTentativa.length !== hashOriginal.length) return false;
  return crypto.timingSafeEqual(hashTentativa, hashOriginal);
}

function gerarToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { hashPassword, verifyPassword, gerarToken };
