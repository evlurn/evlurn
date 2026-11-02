# Roadmap — Evlurn
### Versão 0.7.0-beta | Atualizado em: Julho 2026

> Plano de desenvolvimento por fase. Cada versão tem um codinome, foco principal e entregas classificadas como Obrigatório, Recomendado ou Futuro.

---

## Convenção de Versionamento

```
vMAJOR.MINOR.PATCH-stage

Exemplos:
  v0.7.0-beta   → versão beta, 7ª iteração menor
  v1.0.0        → lançamento oficial estável
  v1.2.3        → patch da 2ª iteração da v1
```

**Stages:** `alpha` → `beta` → `rc` (release candidate) → estável (sem sufixo)

---

## Histórico de Versões Encerradas

### v0.1.0 — *Genesis*
**Foco:** Base do projeto do zero.
- Servidor HTTP nativo sem Express
- Schema SQLite com migrações automáticas
- Autenticação com scrypt nativo
- 4 jogos básicos funcionais
- Sistema de rodadas manual

### v0.2.0 — *Social Engine*
**Foco:** Automação e social.
- Scheduler automático de rodadas
- Contagem regressiva no front-end
- Polling de resultado em tempo real
- Ranking por saldo

### v0.3.0 — *Data Layer*
**Foco:** Expansão do schema.
- Tabelas de títulos, missões, vídeos, sugestões
- IP em todos os logs
- Suporte a proxy reverso
- Campos demográficos (LGPD)

### v0.4.0 — *PWA Launch*
**Foco:** Progressive Web App.
- manifest.json + service worker
- Ícones em todos os tamanhos
- Banner de instalação (Android + iOS)
- Correções mobile (zoom, notch, bounce)

### v0.5.0 — *Economy v1*
**Foco:** Economia e multiplicadores.
- Sistema de multiplicadores (nível + patente + títulos + eventos)
- 10 patentes: Visitante → Mestre da Fortuna
- Jogo Tudo ou Nada com odds por ranking
- Joga a Moeda e Cofre como jogos instantâneos
- Rebalanceamento econômico (house edge ~6–7%)

---

## v0.6.x — *MVP Fix*
**Status:** ✅ Encerrada
**Foco:** Consolidação técnica do MVP

Esta versão consolidou o produto mínimo viável em todas as suas dimensões:

| Área | Entregue |
|------|---------|
| Sistema de Jogos | 4 jogos funcionais, animações de suspense, histórico unificado |
| Painel Administrativo | Usuários, rodadas, logs, eventos, edição de perfil com abas |
| PWA | Ícones Evlurn, manifest atualizado, instalação testada |
| Economia | EVC circulando, multiplicadores ativos, Banco de Conquistas arquitetado |
| Multiplataforma | Mobile-first, desktop responsivo, sidebar expansível |
| Missões | Schema e seeds prontos; front-end parcial |
| Deploy Preparado | railway.toml, DATABASE_DIR, volume persistente documentado |
| Identidade Evlurn | Paleta azul/roxo, tipografia Exo 2, tagline "Learn · Earn · Evolve" |
| Cadastro inclusivo | Data de nascimento + identidade de gênero (LGPD) |

**Bugs corrigidos nesta fase:**
- Roleta Primária dava vitória para todos (tipo `'rodada'` → `'escolha'`)
- Joga a Moeda e Tudo ou Nada não registravam na tabela `apostas`

---

## v0.7.0-beta — *Foundation Update*
**Status:** ✅ Concluída — Julho 2026
**Foco:** Organização estrutural e base para crescimento

Esta versão não adicionou funcionalidades visíveis ao usuário. Preparou o projeto para crescimento sustentável, trabalho em equipe e documentação profissional.

| Área | Entregue |
|------|---------|
| Estrutura de pastas | `docs/`, `assets/`, `database/` criadas |
| Documentação técnica | 8 arquivos especializados em `docs/` |
| Storytelling da marca | `Evlurn_Bible.md` com história completa |
| Game design | `Game_Design.md` com nova direção cognitiva |
| Economia documentada | `Economy.md` com todas as fontes e drenos |
| Decisões registradas | `Decisions.md` com 8 entradas |
| Roadmap estruturado | Este arquivo, com versionamento padronizado |
| Backlog organizado | Prioridades com IDs rastreáveis |
| Assets organizados | `assets/README.md` com guia de uso |
| Database organizada | `database/migrations/`, `backup/`, `seed/` |
| README atualizado | Seção "Estrutura do Projeto" adicionada |
| Identidade v0.8 definida | Nova filosofia cognitiva documentada |

**Equipe:** João Victor Freitas + Claude (Anthropic) + ChatGPT (OpenAI)

---

## v0.8.0-beta — *Intelligence Update*
**Status:** 🔜 Próxima versão
**Previsão:** Agosto 2026
**Foco:** Reposicionamento da plataforma como entretenimento inteligente

Esta versão será percebida tanto pelos desenvolvedores quanto pelos usuários. É a maior mudança filosófica desde a criação da plataforma.

### Obrigatório

- [ ] Nova filosofia da Evlurn documentada e comunicada na interface
- [ ] Arena reorganizada com categorias de jogos (Sorte, Lógica, Matemática...)
- [ ] Mínimo 1 jogo de lógica implementado e jogável
- [ ] Banco de Conquistas: coleção básica com 7 raridades implementada
- [ ] Conquistas ligadas a desenvolvimento (não só a jogos de sorte)
- [ ] Evlurn_Bible.md atualizada com nova identidade cognitiva
- [ ] Game_Design.md com detalhamento dos jogos cognitivos
- [ ] Nova comunicação da marca na tela de login e onboarding

### Recomendado

- [ ] Trivia diária expandida com categorias e dificuldades
- [ ] Academia: primeiro conteúdo real publicado (artigo ou trilha)
- [ ] Perfil: "Mapa de habilidades" — visualização das categorias em que o usuário mais joga
- [ ] Missões: missão específica para cada categoria de jogo cognitivo
- [ ] Changelog público acessível na plataforma

### Futuro (não bloqueia v0.8.0)

- [ ] 3D preview das moedas do Banco de Conquistas
- [ ] Sistema de torneios por categoria cognitiva
- [ ] Ranking separado por categoria de habilidade

---

## v0.9.0-beta — *Stability Update*
**Status:** 🔮 Planejada
**Previsão:** Setembro–Outubro 2026
**Foco:** Beta público ampliado, feedback real, estabilidade

### Obrigatório

- [ ] Deploy no Railway estável e monitorado
- [ ] Domínio `evlurn.app` apontado e SSL ativo
- [ ] Abertura para beta público (cadastro sem aprovação manual ou com aprovação simplificada)
- [ ] Sistema de missões completamente funcional no front-end
- [ ] XP e nível visíveis e funcionais na interface
- [ ] Streak de login implementado end-to-end
- [ ] Política de Privacidade e Termos de Uso publicados
- [ ] Limpeza automática de sessões expiradas

### Recomendado

- [ ] Analytics básico (DAU, MAU, retenção)
- [ ] Ranking público sem login (`/ranking`)
- [ ] Card de conquista compartilhável para WhatsApp
- [ ] Broadcast de evento raro (Preto na Roleta)
- [ ] Aplicação para AdSense ou Monetag

### Futuro

- [ ] Push notifications via Web Push API
- [ ] Bot Telegram para notificações de eventos

---

## v1.0.0 — *Launch*
**Status:** 🎯 Objetivo final do ciclo beta
**Previsão:** Q1 2027
**Foco:** Lançamento oficial — produto completo e estável

### Obrigatório

- [ ] Todos os Mundos com conteúdo real (Academia, Oficina, Explorar)
- [ ] Monetização ativa (anúncios display + vídeos recompensados)
- [ ] Sistema de amigos completo
- [ ] Banco de Conquistas completo
- [ ] Performance validada para 1.000+ usuários simultâneos
- [ ] CNPJ aberto e operacional para recebimento de receita

### Recomendado

- [ ] Passe de temporada (feature premium opcional)
- [ ] Loja de itens cosméticos
- [ ] Temporadas mensais com ranking reset

### Futuro (v2.0+)

- [ ] Aplicativo Android nativo (TWA)
- [ ] API pública documentada
- [ ] Parcerias com estabelecimentos locais
- [ ] Marketplace de conquistas

---

## Visão de Longo Prazo (v2.0+)

A Evlurn v2.0 é uma plataforma reconhecida no Brasil como referência em entretenimento inteligente e desenvolvimento cognitivo gamificado. Os usuários não apenas jogam — eles crescem, e conseguem medir esse crescimento.

---

*Última atualização: v0.7.0-beta — Foundation Update — Julho 2026*
