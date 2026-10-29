# CHANGELOG — Evlurn
> Histórico completo de versões. Cada versão tem um **codinome** que resume seu foco principal.

---

## [0.8.2-beta] — *Sprint 03 · Navigation Update* — Julho 2026
**Foco:** Remoção do conceito de "Mundos" como mecanismo principal de navegação. Jogos deixam de ser o destino padrão pós-login.

### Alterado — Navegação
- `app.html` reescrito: sidebar com seções funcionais (Início, Conhecimento, Missões, Conquistas, Jogos, Perfil, Sobre, Seja Criador)
- `app.js` reescrito: `ativarSecao()` substitui `ativarMundo()`. Seções nomeadas por função, não por conceito
- Seção padrão pós-login: **Início** (dashboard) em vez de Jogos/Arena
- Sidebar desktop: sempre expandida com labels visíveis, sem hover-to-expand
- Emojis substituídos por símbolos tipográficos na navegação (◎ ✓ ◆ ▷ ○ ℹ ✦)
- Nav mobile inferior mantida com 5 itens principais (Início, Missões, Jogos, Conquistas, Perfil)

### Adicionado — Seções
- **Início:** dashboard com resumo (saldo EVC, nível, ranking, partidas), atalhos rápidos e trivia
- **Missões:** missões diárias visíveis com trivia interativa e login diário automático
- **Conquistas:** prévia visual das 6 raridades do Banco de Conquistas
- **Sobre:** missão, versão, tagline e links institucionais
- **Configurações de Perfil:** integradas na seção Perfil

### Corrigido
- `server.js`: rota `/` agora serve `index.html` diretamente (visitante não é redirecionado para login)
- `sw.js`: cache version `chipclub-v1` → `evlurn-v1`
- `app.js`: "House edge" removido dos cards de jogos
- `app.js`: `PLATFORM_NAME = 'Evlurn'` (era 'ChipClub')
- `multiplicadores.js`: patente "Apostador" → "Competidor"

### Preservado
- Todos os 4 jogos funcionais (Roleta Primária, Joga a Moeda, Cofre Misterioso, Tudo ou Nada)
- Sistema de autenticação intacto
- Painel admin sem alterações
- Popup de boas-vindas e botão de sugestão mantidos

---

## [0.8.1-beta] — *Security Patch* — Julho 2026
**Foco:** Auditoria de segurança pré-lançamento. Correções aplicadas antes do primeiro deploy público.

### Corrigido — Crítico
- **Credenciais hardcoded:** senha `admin123` removida de `README.md`, `ATA_PROJETO.md` e `docs/Project/ATA_PROJETO.md`
- **Senha admin via env:** `src/db.js` agora usa `process.env.ADMIN_PASSWORD` com fallback seguro e aviso em produção
- **Cookie sem Secure:** flag `Secure` adicionada condicionalmente em produção (`src/http.js`)
- **package.json com nome antigo:** `name` atualizado de `"chipclub"` para `"evlurn"`

### Adicionado — Alta Prioridade
- **Security headers:** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` em todas as respostas HTTP
- **Rate limiting:** 10 tentativas de login por IP por janela de 15 minutos (`src/routes/auth.js`)
- **`.env.example`:** template com todas as variáveis de ambiente necessárias e documentadas
- **`SECURITY.md`:** política pública de segurança, disclosure e práticas adotadas
- **`.gitignore` expandido:** entradas para `.env.*`, `*.bak`, `*.tmp`, `logs/`, `desktop.ini`

### Adicionado — Documentação
- `docs/Architecture/Decisions.md`: DEC-016 a DEC-020 (segurança)
- `docs/Bible/Evlurn_Bible.md`: seção "Segurança e Governança" com 5 princípios permanentes
- `docs/Architecture/Roadmap.md`: item de auditoria de segurança adicionado como obrigatório em v0.9.0-beta

### Não alterado
- Nenhuma funcionalidade, rota, endpoint ou lógica de negócio foi modificada
- Nenhum schema de banco de dados foi alterado

---

## [0.8.1-beta] — *Sprint 01 · Institutional Layer* — Julho 2026
**Foco:** Identidade pública da plataforma, onboarding e infraestrutura de crescimento.

### Adicionado — Frontend
- `public/conheca.html` — página institucional pública: história, missão, Mundos, filosofia e pilares
- `public/seja-criador.html` — apresentação do Programa de Criadores (benefícios, tipos de conteúdo, princípios editoriais)
- Pop-up de boas-vindas na primeira visita (`common.js` + `localStorage`)
  - Exibe missão, CTA de acesso e link para "Conheça a Evlurn"
  - Opção "Não mostrar novamente" com persistência em `localStorage` (chave `evlurn_bv_seen_v1`)
  - Não exibido em `admin.html`
- Botão "✦ Seja Criador" na sidebar desktop (abaixo dos Mundos)
- Botão flutuante "Seja Criador" em mobile (acima da nav inferior)
- Links para `conheca.html` e `seja-criador.html` no rodapé de `login.html`
- Link para `conheca.html` no rodapé de `register.html`
- CSS: `.popup-boas-vindas`, `.btn-seja-criador`, `.sidebar-criador` em `style.css`

### Adicionado — Backend
- Coluna `beta_participante INTEGER NOT NULL DEFAULT 1` na tabela `usuarios`
  - Marca usuários do período beta para reconhecimento histórico futuro
- Coluna `invite_code TEXT UNIQUE` na tabela `usuarios`
  - Gerado automaticamente no cadastro: 8 chars alfanuméricos sem ambíguos (ex: `QX72LAF9`)
  - Função `gerarInviteCode()` com retry de unicidade em `src/routes/auth.js`
- Migração automática com backfill para bancos existentes em `src/db.js`
  - Gera `invite_code` para todos os usuários que ainda não têm

### Adicionado — Documentação
- `docs/Architecture/Decisions.md`: DEC-021 a DEC-026 registradas

### Também nesta versão — Correções de Segurança (Auditoria Pré-Lançamento)
- Credenciais `admin123` removidas de `README.md`, `ATA_PROJETO.md` e `docs/Project/ATA_PROJETO.md`
- `src/db.js`: senha admin via `ADMIN_PASSWORD` env var + aviso em produção
- `src/http.js`: security headers em todas as respostas + cookie `Secure` em produção
- `src/routes/auth.js`: rate limiting de login (10 tentativas / 15 min por IP)
- `.env.example` criado com todas as variáveis necessárias
- `SECURITY.md` criado com política pública de segurança
- `package.json`: `name` → `evlurn`, `version` → `0.8.0-beta`
- `docs/Architecture/Decisions.md`: DEC-016 a DEC-020 registradas

---

## [0.8.0-beta] — *Intelligence Update* — Julho 2026
**Foco:** Reposicionamento da Evlurn como plataforma de entretenimento inteligente voltada ao desenvolvimento humano. Marco arquitetural da plataforma.

> Esta versão não adiciona funcionalidades visíveis ao usuário imediatamente. Consolida toda a identidade, especificação e documentação da plataforma antes da continuidade do desenvolvimento.

### Adicionado — Estrutura de Pastas

Nova hierarquia da pasta `docs/`:

```
docs/
├── Bible/          Evlurn_Bible.md, Vision.md, Manifesto.md
├── Architecture/   Architecture.md, Decisions.md, Roadmap.md
├── Design/         Design_System.md, Brand_Guidelines.md,
│                   Color_System.md, Typography.md, Components.md
├── Economy/        Economy.md, Economy_Balance.md, Simulation.md
├── Editorial/      Editorial_Constitution.md, Knowledge_System.md
├── GameDesign/     Game_Design.md, Achievement_System.md, Progression_System.md
└── Project/        Backlog.md, CHANGELOG.md, ATA_PROJETO.md
```

Nova estrutura `assets/`:
- `medals/`, `trophies/`, `events/`, `themes/`, `backgrounds/`, `sounds/` criadas

Nova pasta `database/schema/` criada.

### Adicionado — Documentos Novos

| Arquivo | Descrição |
|---------|-----------|
| `Bible/Vision.md` | Filtro de decisão — "O que é a Evlurn?" em 1 página |
| `Bible/Manifesto.md` | Manifesto oficial da marca com frase fundadora |
| `Design/Design_System.md` | Documento mestre de design — índice e princípios |
| `Design/Brand_Guidelines.md` | Uso do logo, tom de comunicação, proibições |
| `Design/Color_System.md` | Paleta completa com tokens, usos e contraste WCAG |
| `Design/Typography.md` | Fontes, tamanhos, pesos e hierarquia tipográfica |
| `Design/Components.md` | Especificações de botões, cards, modais, nav |
| `Economy/Economy_Balance.md` | Todas as fórmulas econômicas documentadas |
| `Economy/Simulation.md` | Estrutura para simulações de equilíbrio econômico |
| `Editorial/Editorial_Constitution.md` | 7 capítulos: Missão, Direitos, Responsabilidades, Fontes, IA, Ética, Penalidades |
| `Editorial/Knowledge_System.md` | Centro de Conhecimento — categorias, recompensas, schema |
| `GameDesign/Achievement_System.md` | Banco de Conquistas — 6 raridades, 5 tipos, lista completa |
| `GameDesign/Progression_System.md` | 4 camadas de progressão com fórmulas e loop de engajamento |

### Atualizado — Documentos Existentes

| Arquivo | O que mudou |
|---------|-------------|
| `Bible/Evlurn_Bible.md` | Expandido para documento mestre com Missão, Visão, Valores, Propósito, Público-alvo, Posicionamento, Linguagem, Tom, História completa, Princípios, Equipe e Futuro |
| `GameDesign/Game_Design.md` | Reescrito com princípio oficial ("todo jogo deve desenvolver alguma habilidade"), categorias oficiais, linguagem de cassino removida |
| `Economy/Economy.md` | Reorganizado com referências a todos os sistemas |
| `Architecture/Decisions.md` | 5 novas decisões: DEC-011 (Knowledge Center), DEC-012 (Perfil LinkedIn), DEC-013 (Banco de Conquistas), DEC-014 (Roadmap por objetivos), DEC-015 (Reflexo adiado) |
| `Architecture/Roadmap.md` | Reestruturado por objetivos (não por datas), versões v0.8 a v2.0 |
| `Project/Backlog.md` | Estrutura Obrigatório/Recomendado/Futuro com IDs rastreáveis |
| `README.md` | Nova filosofia, nova estrutura de pastas |

### Decisões estratégicas desta versão

- **Frase fundadora oficial:** *"A Evlurn não existe para manter pessoas ocupadas. Ela existe para fazer com que cada minuto de entretenimento gere algum tipo de crescimento intelectual, profissional, cultural ou pessoal."*
- **Princípio dos jogos:** *"Todo jogo deve desenvolver alguma habilidade."*
- **Categorias oficiais da Arena:** Lógica, Matemática, Estratégia, Conhecimento, Sorte, Favoritos
- **Banco de Conquistas:** 6 raridades (Comum → Ultimate) × 5 tipos (Medalhas, Moedas, Troféus, Selos, Eventos)
- **Perfil:** filosofia LinkedIn — portfólio de evolução, não vitrine de pontuação
- **Roadmap:** orientado a objetivos, não a datas

---

## [0.7.0-beta] — *Foundation Update* — Julho 2026
**Foco:** Organização estrutural, documentação técnica e base para escalabilidade. Nenhuma mudança visível ao usuário final.

### Adicionado
- Pasta `docs/` com 8 arquivos de documentação
- Pasta `assets/` com 6 subpastas (logo, coins, badges, icons, mockups, banners)
- Pasta `database/` com migrations/, backup/, seed/
- `README.md` — seção "Estrutura do Projeto" adicionada

### Corrigido
- Nenhum bug nesta versão (versão documental)

---

## [0.6.0] — *MVP Fix* — Julho 2026
**Foco:** Consolidação técnica do MVP.

### Adicionado
- Identidade visual Evlurn (paleta `#00B4FF → #7B5CFF`, Exo 2, tagline "Learn · Earn · Evolve")
- Arquitetura de Mundos (Arena, Academia, Oficina, Explorar, Perfil)
- Header persistente (nível, XP, saldo EVC, notificações)
- Animações de suspense nos jogos instantâneos (2–3s)
- Botão flutuante 💡 de sugestão
- Sistema de notificações com badge
- Login diário com streak e bônus crescente
- Trivia diária com recompensa
- Configurações de conta (senha, perfil, exclusão LGPD)
- Edição de perfil (usuário + admin com abas)
- Campos demográficos no cadastro (LGPD)
- Conteúdo de demonstração nos Mundos
- Calculadoras funcionais na Oficina

### Corrigido
- **Bug crítico:** Roleta Primária dava vitória para todos (tipo `'rodada'` → `'escolha'`)
- Joga a Moeda e Tudo ou Nada não registravam na tabela `apostas`
- Botão de sair sem confirmação

---

## [0.5.0] — *Economy v1* — Junho/Julho 2026
**Foco:** Economia, multiplicadores e rebalanceamento dos jogos.

### Adicionado
- Tudo ou Nada com odds por faixa de ranking
- Sistema de multiplicadores (nível + patente + títulos + eventos)
- 10 patentes: Visitante → Mestre da Fortuna
- Eventos temporários com multiplicadores globais
- House edge rebalanceado (~6–7% em todos os jogos)

---

## [0.4.0] — *PWA Launch* — Junho 2026
**Foco:** Progressive Web App.

### Adicionado
- manifest.json + service worker
- Ícones em todos os tamanhos (16, 32, 192, 512px, apple-touch)
- Banner de instalação Android/iOS
- Correções mobile (zoom iOS, notch, bounce scroll)

---

## [0.3.0] — *Data Layer* — Junho 2026
**Foco:** Expansão do schema.

### Adicionado
- Tabelas: titulos_def, usuario_titulos, missoes_def, missao_progresso, videos_assistidos, sugestoes
- IP em logs via x-forwarded-for
- Campos demográficos no schema

---

## [0.2.0] — *Social Engine* — Junho 2026
**Foco:** Automação e social.

### Adicionado
- Scheduler automático de rodadas
- Contagem regressiva no front-end
- Polling de resultado
- Ranking por saldo

---

## [0.1.0] — *Genesis* — Junho 2026
**Foco:** Base do projeto.

### Adicionado
- Servidor HTTP nativo sem Express
- Schema SQLite com migrações automáticas
- Autenticação (scrypt nativo, cookie HttpOnly)
- 4 jogos + sistema de rodadas
- Painel administrativo

---

*v0.8.0-beta — Intelligence Update — Julho 2026*
