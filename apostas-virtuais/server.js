'use strict';

const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const { Router, lerBody, montarResposta, criarServidorEstatico } = require('./src/http');
const { identificarUsuario } = require('./src/middleware');

const authRoutes      = require('./src/routes/auth');
const playerRoutes    = require('./src/routes/player');
const gamesRoutes     = require('./src/routes/games');
const adminRoutes     = require('./src/routes/admin');
const tudoOuNadaRoutes = require('./src/routes/tudoounada');
const jogaMoedaRoutes  = require('./src/routes/jogamoeda');
const cofreRoutes      = require('./src/routes/cofre');
const extrasRoutes     = require('./src/routes/extras');
const scheduler        = require('./src/services/scheduler');

require('./src/db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const router = new Router();
router.use(authRoutes.router);
router.use(playerRoutes.router);
router.use(gamesRoutes.router);
router.use(adminRoutes.router);
router.use(tudoOuNadaRoutes.router);
router.use(jogaMoedaRoutes.router);
router.use(cofreRoutes.router);
router.use(extrasRoutes.router);

// Status do scheduler — acessível por qualquer usuário logado
router.get('/api/scheduler/status', (req, res) => {
  if (!req.usuario) return res.status(401).json({ erro: 'Não autenticado.' });
  res.json(scheduler.statusAtual());
});

const servirEstatico = criarServidorEstatico(PUBLIC_DIR);

const server = http.createServer(async (req, res) => {
  montarResposta(res);
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const query = Object.fromEntries(url.searchParams.entries());
    identificarUsuario(req);
    if (pathname.startsWith('/api/')) {
      if (['POST','PUT','DELETE'].includes(req.method)) req.body = await lerBody(req);
      const encontrada = router.match(req.method, pathname);
      if (!encontrada) { res.status(404).json({ erro: 'Rota não encontrada.' }); return; }
      await encontrada.handler(req, res, encontrada.params, query);
      return;
    }
    const servido = servirEstatico(req, res, pathname);
    if (!servido) { res.statusCode = 404; res.setHeader('Content-Type','text/html'); res.end('<h1>404</h1><a href="/login.html">Login</a>'); }
  } catch (erro) {
    console.error('Erro:', erro);
    if (!res.headersSent) res.status(500).json({ erro: 'Erro interno.' });
  }
});

server.listen(PORT, () => {
  console.log(`\nEvlurn rodando em http://localhost:${PORT}\n`);
  scheduler.iniciar();
});
