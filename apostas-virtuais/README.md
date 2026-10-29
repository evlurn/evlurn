# Evlurn

> **v0.8.0-beta** — *Intelligence Update*

**Plataforma de entretenimento inteligente voltada ao desenvolvimento humano.**

*Learn · Earn · Evolve*

---

> *"A Evlurn não existe para manter pessoas ocupadas. Ela existe para fazer com que cada minuto de entretenimento gere algum tipo de crescimento intelectual, profissional, cultural ou pessoal."*

---

## O que é a Evlurn

A Evlurn é um ecossistema gamificado onde jogar, aprender e evoluir acontecem no mesmo lugar, com a mesma conta, a mesma moeda (EVC) e o mesmo progresso.

Cada jogo exercita uma habilidade. Cada conteúdo gera recompensa. Cada minuto tem propósito.

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 22.5+ (nativo) |
| HTTP | `node:http` sem Express |
| Banco de dados | SQLite via `node:sqlite` (WAL mode) |
| Frontend | HTML + CSS + JavaScript puro |
| Deploy | Railway + Volume persistente |
| PWA | Service Worker + manifest.json |

**Filosofia:** zero dependências npm em produção.

---

## Início Rápido

```bash
# Pré-requisito: Node.js >= 22.5.0
node -v

# Iniciar o servidor
node server.js

# Acesse: http://localhost:3000/login.html
# Credenciais de primeiro acesso: configure via variável de ambiente ADMIN_PASSWORD
```

---

## Os Mundos

| Mundo | Propósito |
|-------|-----------|
| 🎮 **Arena** | Jogos por categoria cognitiva (Sorte, Lógica, Matemática, Conhecimento, Estratégia) |
| 📚 **Academia** | Centro de Conhecimento — artigos, trilhas, quizzes |
| 🛠️ **Oficina** | Calculadoras e ferramentas de utilidade |
| 🌍 **Explorar** | Curiosidades, fatos diários e desafios |
| 👤 **Perfil** | Identidade, Banco de Conquistas, estatísticas, evolução |

---

## Estrutura do Projeto

```
evlurn/
│
├── server.js              # Ponto de entrada — HTTP server + roteamento
├── package.json           # Node.js >= 22.5.0, zero dependências
├── railway.toml           # Configuração de deploy
│
├── src/                   # Código do servidor
│   ├── db.js              # Schema SQLite + migrações automáticas
│   ├── games-config.js    # Configuração centralizada dos jogos
│   ├── platform-config.js # Nome e domínio da plataforma
│   ├── http.js            # Roteador HTTP próprio
│   ├── middleware.js      # Autenticação e autorização
│   ├── sessions.js        # Sessões em memória
│   ├── routes/            # Handlers por domínio (auth, player, games, admin, extras, jogos individuais)
│   ├── services/          # Lógica de negócio (rodadas, multiplicadores, scheduler)
│   └── utils/             # logger, random, security
│
├── public/                # Frontend servido ao cliente
│   ├── app.html           # SPA principal — navegação por Mundos
│   ├── admin.html         # Painel administrativo
│   ├── css/style.css      # Estilos globais com tokens Evlurn
│   ├── js/                # app.js, admin.js, login.js, register.js, common.js
│   ├── icons/             # Ícones PWA (192, 512, apple-touch, favicon)
│   ├── manifest.json      # Web App Manifest
│   └── sw.js              # Service Worker
│
├── docs/                  # Documentação completa do projeto
│   ├── Bible/             # Identidade, visão e manifesto da marca
│   │   ├── Evlurn_Bible.md       # Documento mestre — história, filosofia, missão, valores
│   │   ├── Vision.md             # "O que é a Evlurn?" — filtro de decisão
│   │   └── Manifesto.md          # Manifesto oficial da marca
│   │
│   ├── Architecture/      # Arquitetura técnica e decisões
│   │   ├── Architecture.md       # Stack, estrutura, fluxo, escalabilidade
│   │   ├── Decisions.md          # Log de decisões arquiteturais (DEC-001 a DEC-015)
│   │   └── Roadmap.md            # Versões v0.8 a v2.0 por objetivos
│   │
│   ├── Design/            # Sistema de design e identidade visual
│   │   ├── Design_System.md      # Documento mestre de design
│   │   ├── Brand_Guidelines.md   # Uso do logo e tom de comunicação
│   │   ├── Color_System.md       # Paleta completa com tokens e WCAG
│   │   ├── Typography.md         # Fontes, tamanhos e hierarquia
│   │   └── Components.md         # Especificações de UI components
│   │
│   ├── Economy/           # Economia EVC
│   │   ├── Economy.md            # Fontes de ganho, drenos e sistemas
│   │   ├── Economy_Balance.md    # Fórmulas técnicas completas
│   │   └── Simulation.md         # Estrutura para simulações econômicas
│   │
│   ├── Editorial/         # Conteúdo e sistema editorial
│   │   ├── Editorial_Constitution.md  # 7 capítulos de governança editorial
│   │   └── Knowledge_System.md        # Centro de Conhecimento — categorias, schema
│   │
│   ├── GameDesign/        # Design dos jogos e sistemas de progressão
│   │   ├── Game_Design.md        # Jogos, categorias e mecânicas
│   │   ├── Achievement_System.md # Banco de Conquistas — raridades e tipos
│   │   └── Progression_System.md # Nível, patente, títulos e conquistas
│   │
│   └── Project/           # Gestão do projeto
│       ├── Backlog.md            # Pendências por prioridade e versão alvo
│       ├── CHANGELOG.md          # Histórico completo de versões com codinomes
│       └── ATA_PROJETO.md        # Resumo executivo histórico
│
├── assets/                # Recursos visuais da plataforma
│   ├── logo/              # Logotipo e símbolo Evlurn
│   ├── icons/             # Ícones de interface
│   ├── coins/             # Ícones EVC e moedas
│   ├── medals/            # Medalhas do Banco de Conquistas
│   ├── trophies/          # Troféus do Banco de Conquistas
│   ├── events/            # Assets de eventos especiais
│   ├── themes/            # Temas visuais
│   ├── backgrounds/       # Fundos e texturas
│   ├── mockups/           # Mockups de telas
│   └── sounds/            # Efeitos sonoros (futuro)
│
├── database/              # Organização do banco de dados
│   ├── migrations/        # Scripts de migração de schema
│   ├── seed/              # Dados iniciais para desenvolvimento
│   ├── backup/            # Backups manuais
│   └── schema/            # Documentação do schema atual
│
├── data/                  # Gerado em runtime — NÃO versionado
│   └── database.sqlite
│
└── ATA_PROJETO.md         # Resumo executivo (ver também docs/Project/ATA_PROJETO.md)
```

---

## Equipe

| Membro | Papel |
|--------|-------|
| **João Victor Freitas** | Fundador, Product Owner, Estrategista |
| **Claude (Anthropic)** | Lead Software Engineer & Arquiteto de Documentação |
| **ChatGPT (OpenAI)** | Colaborador Estratégico |

---

## Deploy

Ver `docs/Project/` e o guia `Evlurn_Guia_Deploy_Beta.docx` para instruções completas de GitHub → Railway → evlurn.app.

**Variáveis de ambiente:** consulte `.env.example` para a lista completa.

---

*v0.8.0-beta — Intelligence Update — evlurn.app*
