
---

## DEC-011 — Centro de Conhecimento como área principal da plataforma

**Data:** Julho 2026 | **Status:** Ativo — implementação em v0.8.0-beta

**Contexto:** a Academia existia como "Em construção" com conteúdo de demonstração. A nova filosofia da plataforma exige que o conhecimento seja o centro, não os jogos.

**Decisão:** transformar a Academia em "Centro de Conhecimento" — área principal com artigos reais, quizzes, trilhas, avaliações e recompensas integradas à economia EVC.

**Motivo:** sem conteúdo real, a plataforma não consegue sustentar a promessa de "entretenimento inteligente voltado ao desenvolvimento humano".

**Impacto futuro:** requer schema novo no banco de dados (`conteudos`, `quizzes_conteudo`, `conteudo_leituras`). Ver `docs/Editorial/Knowledge_System.md`.

---

## DEC-012 — Perfil com filosofia LinkedIn

**Data:** Julho 2026 | **Status:** Planejado para v0.8.0-beta

**Contexto:** o perfil atual exibe saldo, ranking e histórico de apostas — identidade de app de jogos.

**Decisão:** expandir o perfil para conter foto, bio, especialidades, 10 conquistas escolhidas, estatísticas, avaliações, visitas e jogos favoritos — semelhante ao LinkedIn em filosofia.

**Motivo:** o perfil deve contar quem o usuário se tornou na plataforma, não apenas quanto EVC tem.

**Impacto futuro:** novos campos em `usuarios`: `foto_url`, `bio`, `especialidades` (JSON), `conquistas_perfil` (JSON array com 10 IDs).

---

## DEC-013 — Banco de Conquistas com 6 raridades e 5 tipos

**Data:** Julho 2026 | **Status:** Especificado — implementação em v0.8.0-beta

**Contexto:** o sistema de títulos existente era unidimensional — apenas um tipo de conquista sem raridade.

**Decisão:** 6 raridades (Comum, Incomum, Rara, Épica, Lendária, Ultimate) × 5 tipos (Medalhas, Moedas, Troféus, Selos, Eventos). Perfil exibe apenas 10 conquistas escolhidas pelo usuário.

**Motivo:** conquistas devem representar a história de desenvolvimento do usuário, não apenas troféus de jogos de sorte.

**Impacto futuro:** alteração de schema em `titulos_def` (novos campos `tipo` e `raridade`) e novo campo `conquistas_perfil` em `usuarios`.

---

## DEC-014 — Roadmap orientado a objetivos, não a datas

**Data:** Julho 2026 | **Status:** Ativo

**Contexto:** o roadmap anterior usava períodos estimados ("Agosto 2026", "Q1 2027") como referência.

**Decisão:** migrar para roadmap por objetivos — cada versão avança quando seus itens obrigatórios estiverem concluídos, independente de data.

**Motivo:** o projeto é desenvolvido por um time pequeno (João + IAs) com velocidade variável. Datas criam pressão artificial e podem comprometer qualidade. Objetivos criam clareza de prioridade.

**Impacto futuro:** comunicação interna e externa passa a usar codinomes e status ("Em andamento", "Planejada", "Visão") em vez de datas.

---

## DEC-015 — Categoria "Reflexo" adiada para v1.5+

**Data:** Julho 2026 | **Status:** Adiada

**Contexto:** a categoria de jogos de Reflexo (tempo de reação) foi considerada para v0.8.0-beta.

**Decisão:** adiar para v1.5+.

**Motivo:** jogos de reflexo precisam de latência ultra-baixa para funcionar corretamente — WebSocket ou Server-Sent Events. A arquitetura atual usa polling, o que seria inadequado para medir reação em milissegundos com precisão.

**Impacto futuro:** quando implementada, a categoria Reflexo exigirá mudança arquitetural no servidor (conexões persistentes) e redesign do scheduler.

---

---

## DEC-016 — Credential Management via Variáveis de Ambiente

**Data:** Julho 2026 | **Origem:** Auditoria de Segurança Pré-Lançamento v0.8.0-beta
**Status:** Ativo

**Contexto:** a senha do admin padrão `admin123` estava hardcoded no `src/db.js` e exposta via `console.log`, além de aparecer em `README.md` e `ATA_PROJETO.md`.

**Decisão:** toda credencial de produção passa a ser gerenciada via variável de ambiente. O `db.js` agora usa `process.env.ADMIN_PASSWORD || 'admin123'` — o fallback só ocorre em desenvolvimento local; em produção, a ausência da variável gera erro explícito no console.

**Arquivos alterados:** `src/db.js`, `README.md`, `docs/Project/ATA_PROJETO.md`, `ATA_PROJETO.md`

**Arquivo criado:** `.env.example` com documentação de todas as variáveis necessárias.

**Impacto futuro:** ao adicionar qualquer novo segredo (API key de anúncios, chave VAPID para push, etc.), seguir o mesmo padrão: variável de ambiente + entrada no `.env.example`.

---

## DEC-017 — Security Headers HTTP em Todas as Respostas

**Data:** Julho 2026 | **Origem:** Auditoria de Segurança Pré-Lançamento v0.8.0-beta
**Status:** Ativo

**Contexto:** o servidor não enviava headers de segurança HTTP, deixando a aplicação vulnerável a clickjacking, MIME sniffing, XSS e information leakage.

**Decisão:** headers de segurança adicionados na função `montarResposta()` em `src/http.js`, garantindo que todas as respostas incluam: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` e `Content-Security-Policy`.

**CSP configurada para:** próprio domínio + Google Fonts (tipografia) + data URIs (ícones inline). Bloqueia iframes, eval e recursos externos não autorizados.

**Impacto futuro:** ao integrar CDNs externas, vídeos ou embeds, atualizar a CSP explicitamente em `src/http.js` com o domínio necessário.

---

## DEC-018 — Cookie Secure Condicional por Ambiente

**Data:** Julho 2026 | **Origem:** Auditoria de Segurança Pré-Lançamento v0.8.0-beta
**Status:** Ativo

**Contexto:** o cookie de sessão não tinha a flag `Secure`, permitindo transmissão em conexões não-HTTPS.

**Decisão:** a flag `Secure` é adicionada condicionalmente — apenas quando `NODE_ENV=production` ou `RAILWAY_ENVIRONMENT` está definido. Em desenvolvimento local (HTTP), o cookie funciona normalmente sem a flag.

**Raciocínio:** domínios `.app` exigem HTTPS por especificação do Google, então em produção o cookie sempre será transmitido via HTTPS. A flag Secure reforça isso no nível do browser.

**Impacto futuro:** ao adicionar outros cookies, seguir o mesmo padrão condicional.

---

## DEC-019 — Rate Limiting de Login (In-Memory)

**Data:** Julho 2026 | **Origem:** Auditoria de Segurança Pré-Lançamento v0.8.0-beta
**Status:** Ativo — revisar para Redis em escala

**Contexto:** a rota `/api/auth/login` não tinha proteção contra ataques de força bruta.

**Decisão:** rate limiting simples implementado em `src/routes/auth.js` usando um `Map` em memória. Bloqueia um IP após 10 tentativas falhas em uma janela de 15 minutos. O contador é resetado após login bem-sucedido.

**Limitação conhecida:** o Map em memória não persiste entre reinicializações do servidor e não é compartilhado entre múltiplos processos (cluster). Aceitável para beta com servidor single-process.

**Impacto futuro:** ao escalar para múltiplos processos ou ao atingir ~1.000 usuários simultâneos, migrar o rate limiting para Redis ou tabela SQLite com TTL.

---

## DEC-020 — Auditoria de Segurança como Processo Oficial de Release

**Data:** Julho 2026 | **Origem:** Auditoria de Segurança Pré-Lançamento v0.8.0-beta
**Status:** Ativo — política permanente

**Decisão:** toda versão com impacto público (deploy, abertura de beta, soft launch) deve ser precedida por auditoria de segurança cobrindo: credenciais expostas, headers HTTP, proteção de rotas, completude do `.gitignore` e informações sensíveis em documentação pública.

**Documentos criados:** `SECURITY.md` (política pública), seção "Segurança e Governança" na `Evlurn_Bible.md`.

---

*v0.8.0-beta — Auditoria de Segurança Pré-Lançamento — Julho 2026*

---

## DEC-021 — Pop-up Institucional de Boas-vindas com localStorage

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Contexto:** novos usuários chegavam à plataforma sem contexto sobre o que é a Evlurn, sua filosofia ou propósito.

**Decisão:** pop-up de boas-vindas exibido na primeira visita, com apresentação da missão, link para "Conheça a Evlurn" e opção "Não mostrar novamente". A preferência é salva em `localStorage` com a chave `evlurn_bv_seen_v1`.

**Motivo:** `localStorage` é a solução mais simples e sem sobrecarga de banco para preferências puramente visuais e locais. Não requer autenticação — funciona antes mesmo do login.

**Impacto futuro:** ao mudar o conteúdo do pop-up significativamente (nova versão da filosofia, rebranding), atualizar a chave para `evlurn_bv_seen_v2` para garantir que todos vejam a nova versão.

---

## DEC-022 — Páginas Institucionais Estáticas (/conheca.html e /seja-criador.html)

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Contexto:** a plataforma não tinha ponto de entrada institucional público — quem recebia um link ia direto para o login sem contexto.

**Decisão:** duas páginas estáticas HTML criadas em `public/`: `conheca.html` (história, missão, Mundos, filosofia) e `seja-criador.html` (Programa de Criadores, benefícios, princípios editoriais). Ambas usam o Design System da Evlurn e são acessíveis sem autenticação.

**Impacto futuro:** quando o Programa de Criadores for aberto (v0.9.0-beta), `seja-criador.html` ganhará formulário de interesse. Por enquanto, é puramente institucional.

---

## DEC-023 — Campo beta_participante em usuarios

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Contexto:** necessidade de identificar quais usuários participaram do Beta Privado da Evlurn para reconhecimento histórico e possíveis benefícios futuros.

**Decisão:** coluna `beta_participante INTEGER NOT NULL DEFAULT 1` adicionada à tabela `usuarios`. Todos os usuários cadastrados durante o beta têm esse campo como `1` automaticamente.

**Impacto futuro:** quando a plataforma abrir para o público (v0.9.0-beta+), novos usuários pós-beta terão `beta_participante = 0`. O campo pode ser usado para exibir uma conquista exclusiva "Participante do Beta" no Banco de Conquistas.

---

## DEC-024 — Campo invite_code em usuarios

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Contexto:** necessidade de um identificador público único e amigável para cada usuário, independente do `id` numérico interno.

**Decisão:** coluna `invite_code TEXT UNIQUE` adicionada à tabela `usuarios`. Gerado automaticamente no cadastro: 8 caracteres alfanuméricos maiúsculos, sem caracteres ambíguos (sem `0`, `O`, `I`, `1`), ex: `QX72LAF9`. Função `gerarInviteCode()` em `src/routes/auth.js` garante unicidade com retry em caso de colisão.

**Motivo:** o `invite_code` é mais amigável para compartilhamento e URL pública do que o `id` numérico interno.

**Impacto futuro:** será usado como identificador em URLs de perfil público (`/perfil/QX72LAF9`), sistemas de indicação e QR codes de convite.

---

## DEC-025 — Migração com Backfill Automático para Bancos Existentes

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Decisão:** ao adicionar `beta_participante` e `invite_code`, a migração em `src/db.js` gera automaticamente `invite_code` para todos os usuários existentes que ainda não têm o campo. Isso evita valores `NULL` em registros antigos e garante consistência sem intervenção manual.

**Motivo:** o SQLite não suporta `NOT NULL` sem `DEFAULT` em `ALTER TABLE`. A abordagem de backfill pós-migração resolve isso de forma segura.

**Impacto futuro:** toda nova coluna sem `DEFAULT` simples deve seguir esse padrão: adicionar coluna nullable → backfill → eventualmente tornar NOT NULL em versão futura.

---

## DEC-026 — Botão "Seja Criador" na Navegação Principal

**Data:** Julho 2026 | **Origem:** Sprint 01 — v0.8.1-beta
**Status:** Ativo

**Decisão:** link "Seja Criador" adicionado à sidebar desktop (abaixo dos Mundos, como elemento separado visualmente) e como botão flutuante em mobile. Não é um Mundo — é um destino institucional externo ao app.

**Motivo:** o Programa de Criadores é uma proposta de valor secundária mas importante. Deve estar acessível de dentro da plataforma sem competir com os Mundos principais.

**Impacto futuro:** quando o Programa for aberto oficialmente, o link pode ser convertido em modal de inscrição ou redirecionado para uma área interna.

---

*v0.8.1-beta — Sprint 01 — Julho 2026*


## DEC-027 — Refinamento 0.8.3, revisão local e segurança

29/10/2026. As decisões desta conversa substituem a sidebar sempre expandida da Sprint 03: botão explícito para alternar modo compacto/expandido, preferência salva, ícones SVG locais e acesso a Conhecimento no mobile. Mantidos nome, paleta azul/violeta, home pública e jogos como seção secundária. Textos secundários passam a #b5bfcd e #99a6b8 para melhorar legibilidade.

Runtime mínimo declarado Node 24; .env carregado pelo runtime via npm start. Servidor local por padrão, HOST=0.0.0.0 explícito no host. Proxy confiável por IP exato, nenhuma confiança automática em cabeçalhos. ADMIN_PASSWORD obrigatória no bootstrap e em produção; senha legada bloqueada em produção e rotação explícita.

Prévia separada em scripts/preview.cjs, restrita ao loopback e a banco descartável; nunca usar esse comando em produção. Leituras iniciais sem registro de progresso ou concessão de XP, comunicadas como tal.
