> Atualização 0.8.3-beta: veja docs/Project/IMPLEMENTATION_083.md para execução e estado atual. Trechos históricos abaixo não representam validação de produção.

# HANDOFF — Evlurn
### Documento de Transferência de Desenvolvimento
**Data:** Agosto 2026
**Ambiente de origem:** Claude (Anthropic) — chat + bash tool
**Próximo ambiente:** Claude Code (repositório GitHub como fonte de verdade)

---

## Estado Atual

| Item | Valor |
|------|-------|
| Versão | v0.8.2-beta |
| Sprint finalizada | Sprint 03 — Navigation Update |
| Fase | Beta Privado |
| Branch principal | main |
| Deploy | Railway (não realizado ainda) |
| Domínio | evlurn.app (adquirido, DNS não apontado) |

---

## Funcionalidades Concluídas

**Backend:**
- Autenticação completa (login, logout, cadastro, sessões persistidas no SQLite, cookie HttpOnly + Secure + SameSite)
- Rate limiting de login: 10 tentativas por IP em 15 minutos
- Security headers em todas as respostas (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- 4 jogos funcionais: Roleta Primária (rodada coletiva), Joga a Moeda, Cofre Misterioso, Tudo ou Nada
- Sistema de rodadas com scheduler automático
- Sistema de multiplicadores: nível + patente (10 tiers) + títulos + eventos
- Login diário com streak e bônus crescente
- Trivia diária com recompensa
- Sugestões do usuário (envio + visualização admin)
- Painel administrativo completo
- Campos `beta_participante` e `invite_code` por usuário (Sprint 01)
- Senha admin via variável de ambiente `ADMIN_PASSWORD`

**Frontend:**
- Home pública (`/` → `index.html`) — visitante acessa sem login obrigatório
- Navegação por seções funcionais (sem "Mundos" como camada obrigatória)
- Seções: Início (dashboard), Conhecimento, Missões, Conquistas, Jogos, Perfil, Sobre
- Sidebar desktop sempre expandida + nav mobile com 5 itens
- Seção padrão pós-login: Início (não mais Jogos/Arena)
- Popup de boas-vindas com localStorage ("Não mostrar novamente")
- Botão flutuante de sugestão
- Páginas institucionais: `conheca.html`, `seja-criador.html`
- PWA: manifest, service worker, ícones
- Cache SW: `evlurn-v1` (legacy `chipclub-v1` removido)

**Segurança:**
- `.env.example` com todas as variáveis necessárias
- `SECURITY.md` com política pública de segurança
- Nenhum segredo no código-fonte

**Documentação:**
- `docs/Bible/Evlurn_Bible.md` — missão, história, filosofia
- `docs/Bible/Vision.md`, `docs/Bible/Manifesto.md`
- `docs/Architecture/Architecture.md`, `Decisions.md` (DEC-001 a DEC-026), `Roadmap.md`
- `docs/Design/` — 5 documentos (Design System, Brand, Color, Typography, Components)
- `docs/Economy/` — 3 documentos
- `docs/Editorial/` — Constituição Editorial, Knowledge System
- `docs/GameDesign/` — Game Design, Achievement System, Progression System
- `docs/Project/Backlog.md`, `CHANGELOG.md`, `ATA_PROJETO.md`

---

## Funcionalidades Parcialmente Implementadas

| Funcionalidade | O que existe | O que falta |
|----------------|-------------|-------------|
| XP e Nível | Campos no banco, barra no header | XP não é concedido por ações — decorativo |
| Streak de login | Campo no banco, rota POST | Não incrementa automaticamente ao logar |
| Missões | Schema no banco, seeds (9 missões), UI básica | Progresso não rastreado em tempo real, sem botão de reivindicar |
| Banco de Conquistas | Schema (titulos_def, usuario_titulos), preview visual | Sistema visual completo não implementado |
| Sugestões do usuário | Envio funcional, admin visualiza | Usuário não vê suas próprias sugestões com status |
| Academia/Conhecimento | Estrutura de navegação, UI placeholder | Sem schema de banco, sem rotas, sem conteúdo real |
| Vídeos Recompensados | Schema e config no banco | Sem rota de API, sem UI |

---

## Pendências Conhecidas

**Alta prioridade (bloqueiam experiência completa):**
- P01 — XP concedido por ações reais (login, trivia, missões, jogos)
- P02 — Streak de login automático (verificar data no login, não por clique)
- P03 — Front-end de missões completo (barra de progresso + reivindicação)
- P04 — Deploy Railway: volume `/data`, variável `ADMIN_PASSWORD`, domínio `evlurn.app`
- P05 — Política de Privacidade e Termos de Uso (exigidos para abertura pública)

**Média prioridade:**
- P06 — Usuário visualiza suas próprias sugestões com status
- P07 — Página dedicada ao EVC (`/evc.html`)
- P08 — Tutorial de primeiro acesso (cards pós-login, localStorage)
- P09 — Títulos concedidos automaticamente por critérios
- P10 — Redirect pós-cadastro para `/login.html?novo=1`
- P11 — Ranking público sem login (`/ranking`)

**Baixa prioridade:**
- P12 — Analytics básico no painel admin (DAU, MAU)
- P13 — Card de conquista compartilhável
- P14 — Push notifications (VAPID)
- P15 — Vídeos recompensados (aguarda conta Adinplay/Monetag)

---

## Próxima Etapa Recomendada

**Sprint 04 — Progression & Engagement**

Foco: tornar XP, streak e missões funcionais end-to-end.
Itens: P01, P02, P03 (alta prioridade acima).

Essas três funcionalidades têm backend preparado e exigem apenas integração com front-end.

---

## Arquitetura

**Stack:**
- Runtime: Node.js 24+ (nativo, sem Express)
- HTTP: `node:http` com roteador próprio em `src/http.js`
- Banco: SQLite via `node:sqlite` (WAL mode), zero dependências npm
- Frontend: HTML + CSS + JS puro, PWA
- Deploy: Railway + Volume persistente

**Estrutura principal:**
```
evlurn/
├── server.js              # Ponto de entrada
├── src/
│   ├── db.js              # Schema + migrações automáticas + seeds
│   ├── http.js            # Roteador HTTP próprio
│   ├── middleware.js      # Auth + admin guard
│   ├── sessions.js        # sessões persistidas no SQLite
│   ├── routes/            # auth, player, games, admin, extras, jogos individuais
│   ├── services/          # rodadas, multiplicadores, scheduler
│   └── utils/             # logger, random, security
├── public/                # Frontend (HTML/CSS/JS puro + PWA)
├── docs/                  # Documentação hierárquica
├── assets/                # Assets visuais
├── database/              # Migrations, seeds, backups (scripts, não o .sqlite)
├── .env.example           # Template de variáveis de ambiente
└── SECURITY.md            # Política pública de segurança
```

---

## Banco de Dados

**Localização em desenvolvimento:** `./data/database.sqlite` (criado automaticamente no startup)

**Localização em produção (Railway):** `/data/database.sqlite` — configurar via variável `DATABASE_DIR=/data`

**Comportamento:** o schema é criado automaticamente no startup via `src/db.js`. Migrações são feitas com `ALTER TABLE ... IF NOT EXISTS` no mesmo arquivo. Não há sistema formal de migrations — as alterações estão documentadas em `docs/Architecture/Decisions.md`.

**Importante:** o arquivo `data/` está no `.gitignore`. Nunca commitar o banco SQLite.

**Arquivos WAL/SHM:** também cobertos pelo `.gitignore` (`data/*.sqlite*`).

---

## Execução Local

```bash
# Pré-requisito: Node.js >= 24.0.0
node -v

# Iniciar (banco criado automaticamente)
node server.js

# Com senha de admin personalizada
npm start # após configurar ADMIN_PASSWORD no .env

# Desenvolvimento com reload automático
node --watch server.js

# Acesso: http://localhost:3000
# Administrador: senha configurada em ADMIN_PASSWORD, sem fallback.
```

---

## Git

**Branch principal:** `main`

**Estado esperado do repositório após esta transferência:**
- Todos os arquivos da Sprint 03 commitados
- `data/` excluído pelo `.gitignore`
- Nenhum `.env` real no repositório
- `HANDOFF.md` presente em `docs/Project/`

---

## Observações Importantes para o Próximo Desenvolvedor

1. **Zero dependências npm.** O `package.json` tem `"dependencies": {}` intencionalmente. Não instalar Express, Prisma ou outras libs sem decisão arquitetural documentada em `Decisions.md`.

2. **sessões persistidas no SQLite.** As sessões persistem após reinício, respeitando expiração e status ativo. Troca de senha revoga sessões.

3. **Scheduler de rodadas.** O scheduler da Roleta Primária inicia automaticamente com o servidor. Em desenvolvimento, pode gerar ruído nos logs.

4. **`ADMIN_PASSWORD` obrigatório em produção.** A ausência da variável em ambiente de produção gera erro explícito no console. O deploy no Railway não deve prosseguir sem essa variável configurada.

5. **Patente "Apostador" no banco.** O slug `apostador` permanece na tabela por compatibilidade (banco existente), mas o campo `nome` exibido ao usuário foi alterado para "Competidor". Não renomear o slug sem migração.

6. **Tabela `apostas`.** Nome mantido por compatibilidade histórica. Registra todas as participações nos jogos, não apenas apostas da Roleta.

7. **`index.html` é o ponto de entrada público.** O servidor serve `/index.html` quando o visitante acessa `/`. O `login.html` é acessível em `/login.html` diretamente.

8. **Design System.** Tokens CSS em `public/css/style.css` (variáveis `:root`). Toda a identidade visual (paleta, tipografia, espaçamento) está documentada em `docs/Design/`.

---

*Documento gerado em: Agosto 2026 | Versão: v0.8.2-beta | Sprint 03 concluída*
