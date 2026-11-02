# CHANGELOG — Evlurn
> Histórico completo de versões. Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
> Cada versão tem um **codinome** que resume o foco principal da iteração.

---

## [0.7.0-beta] — *Foundation Update* — Julho 2026
**Foco:** Organização estrutural, documentação técnica e base para escalabilidade.
**Impacto:** Desenvolvedores e equipe. Nenhuma mudança visível para o usuário final.

### Adicionado — Estrutura
- Pasta `docs/` com 8 arquivos de documentação especializados
- Pasta `assets/` com 6 subpastas organizadas (logo, coins, badges, icons, mockups, banners)
- Pasta `database/` com subpastas `migrations/`, `backup/`, `seed/` e README
- Arquivo `assets/README.md` com guia de uso da identidade visual
- Arquivo `database/README.md` com convenções de backup e migração
- `.gitkeep` em todas as subpastas vazias para preservação no Git

### Adicionado — Documentação
- `docs/Evlurn_Bible.md` — storytelling completo: Projeto Fichas (2019) → Evlurn (2026), filosofia, identidade, equipe, impacto esperado e histórico de visão
- `docs/Architecture.md` — arquitetura técnica, estrutura de diretórios, fluxo de requisição, análise de escalabilidade (100 → 100k usuários)
- `docs/Game_Design.md` — design dos 4 jogos com mecânicas, probabilidades, house edge e nova direção de jogos cognitivos
- `docs/Economy.md` — sistema EVC, fontes de ganho, drenos, multiplicadores, Banco de Conquistas
- `docs/Roadmap.md` — 5 fases (v0.6.x → v1.0.0) com codinomes, foco e classificação Obrigatório/Recomendado/Futuro
- `docs/Backlog.md` — pendências com IDs rastreáveis, histórico de concluídas e ideias em estudo
- `docs/Decisions.md` — 8 decisões arquiteturais com motivo, vantagem e impacto futuro
- `docs/CHANGELOG.md` — este arquivo, com histórico completo das versões

### Alterado
- `README.md` — adicionada seção "Estrutura do Projeto" com árvore de diretórios comentada
- `docs/Evlurn_Bible.md` — identidade atualizada para refletir nova filosofia cognitiva (v0.8.0-beta previewed)
- `docs/Game_Design.md` — categorias de jogos por habilidade cognitiva documentadas como direção futura
- `docs/Roadmap.md` — versionamento padronizado com codinomes em todas as fases

### Não alterado (confirmado)
- Nenhum arquivo em `src/` foi modificado
- Nenhum arquivo em `public/` foi modificado
- `server.js`, `package.json`, `railway.toml` intocados
- Banco de dados, rotas, endpoints e lógica preservados integralmente

---

## [0.6.0] — *MVP Fix* — Julho 2026
**Foco:** Consolidação técnica do MVP. Última versão pré-organização estrutural.

### Adicionado
- Identidade visual Evlurn completa: paleta `#00B4FF → #7B5CFF`, tipografia Exo 2, tagline "Learn · Earn · Evolve"
- Ícone E estilizado com gradiente em todos os tamanhos PWA (16, 32, 192, 512px)
- Arquitetura de Mundos: Arena, Academia, Oficina, Explorar, Perfil
- Navegação por hash routing (`app.html#arena`, `app.html#academia`, etc.)
- Header global persistente: ícone, patente, barra XP/nível, saldo EVC, notificações, sair
- Sidebar expansível no desktop (hover) + navegação inferior no mobile
- Animação de suspense (2–3s) antes de revelar resultado nos jogos instantâneos
- Botão flutuante 💡 de sugestão com modal e rota `POST /api/sugestoes`
- Sistema de notificações com badge no header (`GET /api/notificacoes`)
- Login diário com streak, bônus crescente e rota `POST /api/login-diario/confirmar`
- Trivia diária com 10 perguntas rotativas e recompensa diferenciada
- Configurações de conta: alterar senha, editar perfil, excluir conta (anonimização LGPD)
- Edição de perfil pelo usuário (`PUT /api/conta/perfil`)
- Edição de perfil pelo admin com modal em abas (`PUT /api/admin/usuarios/:id/perfil`)
- Exclusão de conta pelo usuário com confirmação de senha (`DELETE /api/conta`)
- Exclusão de conta pelo admin (`DELETE /api/admin/usuarios/:id`)
- Campos demográficos no cadastro: data de nascimento e identidade de gênero (LGPD)
- Conteúdo de demonstração nos Mundos Academia, Oficina e Explorar
- Calculadoras funcionais na Oficina (porcentagem e juros compostos)
- Fato do Dia rotativo no Explorar
- Confirmação de saída "Deseja sair?" com modal
- Telas "Em construção" com módulos previstos para cada Mundo

### Corrigido
- **Bug crítico:** Roleta Primária dava vitória para todos os apostadores. Causa: tipo `'rodada'` pulava verificação de escolha. Correção: tipo voltou para `'escolha'`, adicionada propriedade `usaRodadas: true`
- Joga a Moeda não registrava na tabela `apostas` (histórico incompleto)
- Tudo ou Nada não registrava na tabela `apostas`
- Botão de sair sem confirmação causava saídas acidentais

### Alterado
- Paleta: verde `#1FAE63` → azul `#00B4FF` como cor primária
- Fundo: `#0B0B0B` → `#0D1117` (paleta oficial do brand)
- Tagline: "Entretenimento social gamificado" → "Learn · Earn · Evolve"
- Botão primário: branco sólido → gradiente `#00B4FF → #7B5CFF`
- "Roleta Primal" → "Roleta Primária"
- Modal de detalhes de usuário no admin: expandido com abas (Saldo, Perfil, Histórico)

---

## [0.5.0] — *Economy v1* — Junho/Julho 2026
**Foco:** Economia EVC, multiplicadores e rebalanceamento dos jogos.

### Adicionado
- Tudo ou Nada com odds dinâmicas por faixa de ranking (Top 10 / 11–50 / abaixo de 50)
- Joga a Moeda e Cofre convertidos para jogos instantâneos individuais com rotas dedicadas
- Sistema de patentes com 10 tiers: Visitante → Mestre da Fortuna
- Sistema de multiplicadores: nível (0–10%) + patente (0–22%) + títulos + eventos
- Cap de multiplicadores em 50%
- Eventos temporários criados pelo admin (`POST /api/admin/eventos`)
- Limite diário de 10 aberturas no Cofre Misterioso
- Log detalhado para Tudo ou Nada (posição ranking, odds, multiplicadores aplicados)
- Tabela `eventos` no banco de dados

### Alterado
- Cofre Misterioso: remoção do tier "Vazio", novos multiplicadores (×0,60 a ×4,00) — house edge 7,1%
- Roleta Primária: Preto de 0,01% para 0,1% (mais frequente como evento social)
- Joga a Moeda: multiplicador de ×2,0 para ×1,9 — house edge 5,95%

---

## [0.4.0] — *PWA Launch* — Junho 2026
**Foco:** Progressive Web App instalável em Android e iOS.

### Adicionado
- `manifest.json` com nome, ícones, cores e `start_url`
- Service Worker (`sw.js`): cache de assets, offline fallback, network-first para páginas
- Ícones PWA em todos os tamanhos obrigatórios
- Banner de instalação inteligente (Android: prompt nativo / iOS: instrução contextual)
- Meta tags Apple para standalone mode e status bar
- `viewport-fit=cover` para suporte a notch em iPhones
- Correção de bug iOS: inputs com `font-size: 16px` para evitar zoom automático
- `overscroll-behavior: none` para remover bounce scroll no iOS

---

## [0.3.0] — *Data Layer* — Junho 2026
**Foco:** Expansão do schema e logs de auditoria.

### Adicionado
- Tabelas: `titulos_def` (17 títulos), `usuario_titulos`, `missoes_def` (9 seeds), `missao_progresso`, `videos_assistidos`, `sugestoes`
- IP em todos os logs via `x-forwarded-for` (suporte a proxy)
- Campos demográficos no schema: `data_nascimento`, `identidade_genero`, `identidade_genero_outro`
- Base de login diário e trivia (sem front-end ainda)

---

## [0.2.0] — *Social Engine* — Junho 2026
**Foco:** Automação de rodadas e features sociais.

### Adicionado
- Scheduler automático de rodadas alinhado ao relógio
- Contagem regressiva no front-end
- Polling automático de resultado
- Dashboard admin com configuração do scheduler
- Ranking de usuários por saldo EVC
- Logs de ação com tipo, descrição e admin responsável

---

## [0.1.0] — *Genesis* — Junho 2026
**Foco:** Base do projeto do zero.

### Adicionado
- Servidor HTTP nativo sem Express (`src/http.js`)
- Schema SQLite com migrações automáticas no startup
- Autenticação: cadastro, aprovação admin, login, sessão (cookie HttpOnly), logout
- Hash de senha com `crypto.scrypt` nativo
- 4 jogos: Roleta Primária, Joga a Moeda, Cofre Misterioso, Tudo ou Nada
- Sistema de rodadas: abertura, apostas, encerramento, distribuição de ganhos
- Painel administrativo: pendentes, usuários, rodadas, logs, configurações
- Frontend: HTML + CSS + JS puro, responsivo, sem frameworks

---

*Última atualização: v0.7.0-beta — Foundation Update — Julho 2026*
