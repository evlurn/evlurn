# Architecture — Evlurn

> Documento técnico de arquitetura. Descreve as decisões estruturais do projeto, seus fundamentos e implicações para escalabilidade futura.

---

## Stack tecnológico

| Camada | Tecnologia | Decisão |
|--------|-----------|---------|
| Runtime | Node.js 22.5+ | LTS estável com SQLite nativo via `node:sqlite` |
| HTTP | `node:http` nativo | Sem Express — roteador próprio em `src/http.js` |
| Banco de dados | SQLite (WAL mode) | Arquivo único, zero configuração, backup trivial |
| Frontend | HTML + CSS + JS puro | Sem frameworks — carregamento instantâneo |
| PWA | Service Worker + manifest | Instalável em Android e iOS sem App Store |
| Deploy | Railway + volume persistente | PaaS com suporte a volumes para SQLite |
| Domínio | evlurn.app (Cloudflare) | TLD .app exige HTTPS — SSL automático |

**Filosofia:** zero dependências npm em produção. O `package.json` lista `"dependencies": {}` intencionalmente.

---

## Estrutura de diretórios

```
evlurn/
├── server.js              # Ponto de entrada — HTTP server + roteamento
├── package.json           # Metadados e engines (Node >= 22.5.0)
├── railway.toml           # Configuração de deploy
├── .gitignore
│
├── src/                   # Código do servidor (não servido ao cliente)
│   ├── db.js              # Schema SQLite + migrações automáticas + seeds
│   ├── games-config.js    # Configuração centralizada dos 4 jogos
│   ├── platform-config.js # Nome, domínio e tagline da plataforma
│   ├── http.js            # Router, parseCookies, lerBody, serveStatic
│   ├── middleware.js      # Identificar usuário, exigir auth, exigir admin
│   ├── sessions.js        # CRUD de sessões em memória
│   ├── routes/            # Handlers HTTP por domínio
│   │   ├── auth.js        # Login, registro, logout
│   │   ├── player.js      # Home, ranking, apostas do jogador
│   │   ├── games.js       # Listar jogos, abrir aposta, detalhe de rodada
│   │   ├── admin.js       # Dashboard, usuários, rodadas, logs, eventos
│   │   ├── extras.js      # Sugestões, notificações, trivia, conta, perfil
│   │   ├── tudoounada.js  # Jogo Tudo ou Nada (rota própria)
│   │   ├── jogamoeda.js   # Jogo Joga a Moeda (rota própria)
│   │   └── cofre.js       # Jogo Cofre Misterioso (rota própria)
│   ├── services/
│   │   ├── multiplicadores.js  # Cálculo de bônus (nível + patente + títulos + eventos)
│   │   ├── rodadas.js          # Abertura, encerramento e resolução de rodadas
│   │   └── scheduler.js        # Automação de rodadas alinhada ao relógio
│   └── utils/
│       ├── logger.js      # Registro de ações no banco (logs)
│       ├── random.js      # Sorteio ponderado por probabilidade
│       └── security.js    # hashPassword, verifyPassword (scrypt nativo)
│
├── public/                # Servido estaticamente ao cliente
│   ├── login.html
│   ├── register.html
│   ├── app.html           # SPA principal (Mundos)
│   ├── admin.html         # Painel administrativo
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker
│   ├── favicon.ico
│   ├── icons/             # Ícones PWA (192, 512, apple-touch)
│   ├── css/style.css      # Estilos globais (variáveis + componentes)
│   └── js/
│       ├── common.js      # api(), formatarMoeda(), toast(), sair(), SW
│       ├── app.js         # SPA: Mundos, jogos, perfil, config
│       ├── admin.js       # Painel admin: usuários, rodadas, logs
│       ├── login.js
│       └── register.js
│
├── data/                  # Gerado em runtime — não commitado
│   └── database.sqlite    # Banco de dados SQLite
│
├── docs/                  # Documentação do projeto
├── assets/                # Recursos visuais (logos, ícones, mockups)
└── ATA_PROJETO.md         # Resumo executivo e histórico
```

---

## Fluxo de requisição

```
Cliente (browser)
    │
    ▼
server.js (HTTP server)
    │
    ├─ /api/* ──► identificarUsuario() ──► Router.match() ──► handler()
    │                                           │
    │                                     routes/*.js
    │                                     services/*.js
    │                                     db.js (SQLite)
    │
    └─ /* ──► criarServidorEstatico() ──► public/
```

---

## Banco de dados

**14 tabelas principais:**

| Tabela | Propósito |
|--------|-----------|
| `usuarios` | Perfis, saldo EVC, nível, streak, patente |
| `sessoes` | Tokens de sessão (em memória + fallback DB) |
| `rodadas` | Rodadas abertas e encerradas da Roleta Primária |
| `apostas` | Registro unificado de todas as participações nos jogos |
| `movimentacoes` | Ledger completo de transações EVC |
| `atividades` | Log de atividades para missões e XP |
| `missoes_def` | Definição das missões (slug, critério, recompensa) |
| `missao_progresso` | Progresso diário/semanal por usuário |
| `titulos_def` | Definição dos 17 títulos disponíveis |
| `usuario_titulos` | Títulos conquistados por usuário |
| `videos_assistidos` | Controle de vídeos recompensados por dia |
| `sugestoes` | Feedback dos usuários |
| `eventos` | Eventos temporários com multiplicadores |
| `logs` | Auditoria completa de ações admin e sistema |
| `config` | Configurações dinâmicas da plataforma (key-value) |

**Decisão WAL mode:** Write-Ahead Logging permite leituras e escritas simultâneas sem bloqueio — essencial para múltiplos usuários simultâneos com SQLite.

---

## Sistema de sessões

Sessões são armazenadas **em memória** (objeto JS no processo) com token seguro gerado por `crypto.randomBytes(32)`. Cookie `HttpOnly + SameSite=Strict`.

**Implicação:** ao reiniciar o servidor, sessões ativas são invalidadas — usuários precisam fazer login novamente. Aceitável para beta; em produção com escala maior, migrar para tabela `sessoes` no SQLite ou Redis.

---

## Sistema de multiplicadores

Fórmula aplicada em todos os ganhos de jogos:

```
ganho_final = ganho_base × (1 + bônus_nível + bônus_patente + bônus_títulos) × mult_evento
```

- Bônus nível: 0% (Nv. 1) a +10% (Nv. 50)
- Bônus patente: 0% (Visitante) a +22% (Mestre da Fortuna)
- Bônus títulos: soma dos títulos com bônus (máx. teórico ~10%)
- Multiplicador evento: definido pelo admin (ex: 2× em Happy Hour)
- **Cap total:** bônus somado limitado a 50% para evitar snowballing

---

## Análise de escalabilidade

### 100 usuários (beta fechado)
**Status atual:** suportado sem alterações.
SQLite com WAL aguenta facilmente. Railway Hobby ($5/mês) é suficiente.

### 1.000 usuários
**Gargalo principal:** sessões em memória. Com 1.000 usuários ativos, o objeto de sessões pode acumular centenas de MBs se não houver limpeza periódica.
**Solução:** implementar TTL e limpeza automática de sessões expiradas (job a cada hora).
**Outros gargalos:** nenhum crítico. SQLite WAL suporta bem esse volume.

### 10.000 usuários
**Gargalo principal:** SQLite com escritas concorrentes intensas. Embora WAL melhore leituras simultâneas, escritas ainda são serializadas.
**Gargalo secundário:** servidor single-process Node.js — sem clustering, uma CPU suporta até ~2-5k req/s dependendo do hardware.
**Solução arquitetural:** migrar para PostgreSQL + Node Cluster ou PM2 com múltiplos workers. O código de acesso ao banco está isolado em `src/db.js` — a migração de SQLite para Postgres exige reescrever apenas esse arquivo.

### 100.000 usuários
**Requer:** PostgreSQL gerenciado (Supabase, Neon ou RDS), CDN para assets estáticos, separação do servidor em microserviços ou pelo menos múltiplos processos com load balancer, cache de sessão em Redis.
**Estimativa de custo:** R$800–2.000/mês em infraestrutura.

---

## Decisões arquiteturais registradas

Ver `docs/Decisions.md` para o log completo de decisões e suas justificativas.

---

*Última atualização: Julho 2026*
