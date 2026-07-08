'use strict';

/**
 * Mini-framework HTTP construído apenas com módulos nativos do Node.
 *
 * Por que não usar Express? O ambiente onde este projeto foi gerado não
 * tinha acesso à internet para "npm install", então não foi possível
 * baixar o Express nem outras dependências de terceiros. A solução foi
 * escrever um roteador minimalista com uma API parecida (app.get,
 * app.post, req.params, req.body, res.json...) para que o código fique
 * organizado e familiar. Vantagem extra: o projeto roda com "node
 * server.js" sem precisar de "npm install" nenhuma — zero dependências
 * de terceiros. Se preferir usar Express de verdade no seu ambiente
 * (que tem acesso à internet), isso pode ser adaptado facilmente; veja
 * o README.md para detalhes.
 */

const { URL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

class Router {
  constructor() {
    this.routes = [];
  }

  _add(method, rota, handler) {
    const partes = rota.split('/').filter(Boolean);
    this.routes.push({ method, partes, handler, rota });
  }

  get(rota, handler) { this._add('GET', rota, handler); }
  post(rota, handler) { this._add('POST', rota, handler); }
  put(rota, handler) { this._add('PUT', rota, handler); }
  delete(rota, handler) { this._add('DELETE', rota, handler); }

  // Mescla rotas de outro Router (usado para módulos de rotas separados)
  use(subRouter) {
    this.routes.push(...subRouter.routes);
  }

  match(method, pathname) {
    const partesUrl = pathname.split('/').filter(Boolean);
    for (const rota of this.routes) {
      if (rota.method !== method) continue;
      if (rota.partes.length !== partesUrl.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < rota.partes.length; i++) {
        const def = rota.partes[i];
        const val = partesUrl[i];
        if (def.startsWith(':')) {
          params[def.slice(1)] = decodeURIComponent(val);
        } else if (def !== val) {
          ok = false;
          break;
        }
      }
      if (ok) return { handler: rota.handler, params };
    }
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((parte) => {
    const idx = parte.indexOf('=');
    if (idx === -1) return;
    const k = parte.slice(0, idx).trim();
    const v = parte.slice(idx + 1).trim();
    cookies[k] = decodeURIComponent(v);
  });
  return cookies;
}

function lerBody(req) {
  return new Promise((resolve, reject) => {
    let dados = '';
    req.on('data', (chunk) => {
      dados += chunk;
      if (dados.length > 2 * 1024 * 1024) {
        reject(new Error('Corpo da requisição excede o limite permitido'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!dados) return resolve({});
      try {
        resolve(JSON.parse(dados));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function montarResposta(res) {
  res.status = function (codigo) {
    res.statusCode = codigo;
    return res;
  };
  res.json = function (corpo) {
    const texto = JSON.stringify(corpo);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(texto);
    return res;
  };
  res.setCookie = function (nome, valor, opcoes = {}) {
    const partes = [`${nome}=${encodeURIComponent(valor)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict'];
    if (opcoes.maxAgeSegundos) partes.push(`Max-Age=${opcoes.maxAgeSegundos}`);
    const existente = res.getHeader('Set-Cookie');
    const novo = existente ? [].concat(existente, partes.join('; ')) : partes.join('; ');
    res.setHeader('Set-Cookie', novo);
    return res;
  };
  res.clearCookie = function (nome) {
    res.setHeader('Set-Cookie', `${nome}=; Path=/; HttpOnly; Max-Age=0`);
    return res;
  };
  return res;
}

function criarServidorEstatico(diretorioPublico) {
  return function servirArquivo(req, res, pathname) {
    let alvo = pathname === '/' ? '/login.html' : pathname;
    const caminhoCompleto = path.normalize(path.join(diretorioPublico, alvo));

    // Protege contra path traversal (ex: /../../etc/passwd)
    if (!caminhoCompleto.startsWith(diretorioPublico)) {
      res.statusCode = 403;
      res.end('Acesso negado');
      return true;
    }

    if (!fs.existsSync(caminhoCompleto) || fs.statSync(caminhoCompleto).isDirectory()) {
      return false;
    }

    const ext = path.extname(caminhoCompleto);
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(caminhoCompleto).pipe(res);
    return true;
  };
}

module.exports = { Router, parseCookies, lerBody, montarResposta, criarServidorEstatico };
