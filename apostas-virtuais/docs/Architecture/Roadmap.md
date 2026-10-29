# Roadmap — Evlurn
**v0.8.0-beta | Julho 2026**
**Modelo:** por objetivos, não por datas.

> O roadmap da Evlurn é orientado a objetivos alcançados, não a calendário. Cada versão só avança quando seus objetivos obrigatórios estiverem completos.

---

## Convenção de Versionamento

```
vMAJOR.MINOR.PATCH-stage

v0.x.x-beta  → Em desenvolvimento ativo
v0.x.x-rc    → Release candidate — estável para validação
v1.0.0       → Lançamento oficial
```

Cada versão tem um **codinome** que resume o foco da iteração.

---

## Histórico Encerrado

| Versão | Codinome | Foco principal |
|--------|----------|----------------|
| v0.1.0 | *Genesis* | Base do projeto, autenticação, 4 jogos |
| v0.2.0 | *Social Engine* | Scheduler, ranking, logs |
| v0.3.0 | *Data Layer* | Schema expandido, LGPD |
| v0.4.0 | *PWA Launch* | Progressive Web App instalável |
| v0.5.0 | *Economy v1* | Multiplicadores, patentes, Tudo ou Nada |
| v0.6.x | *MVP Fix* | Consolidação técnica do MVP |
| v0.7.0-beta | *Foundation Update* | Organização estrutural e documentação |

---

## v0.8.0-beta — *Intelligence Update*
**Status:** 🔄 Em andamento
**Objetivo:** Consolidar a identidade da Evlurn como plataforma de entretenimento inteligente voltada ao desenvolvimento humano.

### Obrigatório

**Identidade e Filosofia**
- [ ] Nova filosofia comunicada na interface (login, onboarding, Arena)
- [ ] Manifesto visível em área institucional da plataforma
- [ ] Remoção de toda linguagem de cassino da interface do usuário

**Arena Cognitiva**
- [ ] Arena reorganizada com categorias (Sorte, Lógica, Matemática, Conhecimento, Estratégia)
- [ ] Mínimo 1 jogo de lógica implementado e jogável
- [ ] Mínimo 1 jogo de conhecimento (Quiz expandido)

**Banco de Conquistas**
- [ ] Schema no banco de dados (tipos + raridades)
- [ ] Conquistas básicas por consistência implementadas
- [ ] Exibição no perfil (10 conquistas escolhidas)

**Progressão**
- [ ] XP concedido em todas as ações e visível no header
- [ ] Streak de login end-to-end (verificar → incrementar → resetar)
- [ ] Front-end de missões completo (progresso + reivindicação)
- [ ] Front-end de títulos (exibição + notificação ao conquistar)

**Centro de Conhecimento**
- [ ] Estrutura básica da Academia funcional
- [ ] Mínimo 4 artigos reais publicados com quiz
- [ ] Sistema de recompensa por leitura + quiz implementado

**Perfil Expandido**
- [ ] Campo de bio e especialidades
- [ ] Seção de Banco de Conquistas no perfil
- [ ] Estatísticas básicas (partidas, streak, artigos lidos)

### Recomendado
- [ ] Trivia expandida com categorias
- [ ] Mapa de habilidades no perfil
- [ ] Changelog público na plataforma
- [ ] Missão específica por categoria cognitiva

### Futuro (não bloqueia v0.8.0)
- [ ] Render 3D das moedas do Banco de Conquistas
- [ ] Torneios por categoria cognitiva

---

## v0.9.0-beta — *Stability Update*
**Status:** 🔮 Planejada
**Objetivo:** Beta público ampliado. Produto estável, escalável e pronto para crescimento orgânico.

### Obrigatório
- [ ] Deploy no Railway com volume persistente estável
- [ ] `evlurn.app` apontado com SSL ativo
- [ ] Beta público aberto (cadastro simplificado)
- [ ] Política de Privacidade e Termos de Uso publicados
- [ ] Limpeza automática de sessões expiradas
- [ ] Redirect pós-cadastro para `/login.html?novo=1`
- [ ] Ranking público sem login (`/ranking`)
- [ ] Analytics básico (DAU, MAU, retenção) no painel admin
- [ ] Monitoramento de uptime com alerta

### Recomendado
- [ ] Broadcast de evento raro (Preto na Roleta)
- [ ] Card de conquista compartilhável para WhatsApp
- [ ] Aplicação para conta AdSense ou Monetag
- [ ] Rankings múltiplos (Consistência, Atividade, Coleção)
- [ ] Indicação escalonada (200 → 300 → 500 EVC)
- [ ] Evento semanal automático (multiplicador dominical)

### Futuro
- [ ] Push notifications (Web Push / VAPID)
- [ ] Bot Telegram para notificações

---

## v1.0.0 — *Launch*
**Status:** 🎯 Objetivo final do ciclo beta
**Objetivo:** Produto completo, monetizado e estável para lançamento oficial.

### Obrigatório
- [ ] Todos os Mundos com conteúdo real e funcional
- [ ] Monetização ativa (display ads + vídeos recompensados)
- [ ] Sistema de amigos (buscar, adicionar, ver perfil)
- [ ] Banco de Conquistas completo (todas as categorias e raridades)
- [ ] Performance validada para 1.000+ usuários simultâneos
- [ ] CNPJ aberto e operacional para recebimento de receita
- [ ] Simulações econômicas executadas com dados reais do beta

### Recomendado
- [ ] Passe de temporada (feature premium opcional)
- [ ] Loja de itens cosméticos com EVC
- [ ] Temporadas mensais com reset e premiação simbólica

---

## v1.5.0 — *Community Update*
**Status:** 💡 Visão
**Objetivo:** Transformar a Evlurn em plataforma social completa.

- [ ] Desafios P2P (jogador desafia outro no Tudo ou Nada)
- [ ] Grupos e comunidades por interesse
- [ ] Perfil público com URL compartilhável
- [ ] Sistema de avaliações entre usuários
- [ ] Conteúdo gerado por usuários (Academia aberta)

---

## v2.0.0 — *Ecosystem*
**Status:** 💡 Visão de longo prazo
**Objetivo:** Ecossistema maduro com parcerias, API pública e expansão nativa.

- [ ] API pública documentada para integrações
- [ ] Aplicativo Android nativo (TWA)
- [ ] Parcerias com estabelecimentos locais (análise jurídica)
- [ ] Marketplace de conquistas entre usuários
- [ ] Infraestrutura horizontal (múltiplos servidores)
- [ ] SDK para desenvolvedores criarem conteúdo para a Academia

---

*v0.8.0-beta — Intelligence Update — Julho 2026*
