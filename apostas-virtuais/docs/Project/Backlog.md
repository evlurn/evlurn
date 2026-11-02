# Backlog — Evlurn
**v0.8.0-beta | Julho 2026**

> Todas as pendências da plataforma organizadas por prioridade. Atualizar ao início e fim de cada sessão de desenvolvimento.

---

## 🔴 Obrigatório — v0.8.0-beta (Intelligence Update)

| ID | Item | Detalhe |
|----|------|---------|
| B01 | Nova filosofia na interface | Comunicar reposicionamento cognitivo no login, onboarding e Arena |
| B02 | Arena por categorias | Cards reorganizados: Sorte, Lógica, Matemática, Conhecimento, Estratégia |
| B03 | Jogo cognitivo (Lógica) | Mínimo 1 jogo de lógica/raciocínio jogável |
| B04 | Jogo de Conhecimento | Quiz expandido com categorias e dificuldades |
| B05 | Schema Banco de Conquistas | Novos campos em `titulos_def` (tipo, raridade) e `conquistas_perfil` em `usuarios` |
| B06 | Conquistas por consistência | Medalhas de streak implementadas no sistema |
| B07 | Exibição de Conquistas no Perfil | Grid de 10 conquistas escolhidas pelo usuário |
| B08 | XP funcional end-to-end | XP concedido em todas as ações, barra de nível funcional no header |
| B09 | Streak de login | Verificar data → incrementar/resetar streak → notificação |
| B10 | Front-end de Missões | Barra de progresso, reivindicação, reset automático diário/semanal |
| B11 | Front-end de Títulos | Exibição no perfil, notificação ao conquistar, título ativo |
| B12 | Centro de Conhecimento (base) | Estrutura da Academia funcional com pelo menos 4 artigos reais + quiz |
| B13 | Recompensa por leitura | EVC e XP por artigo lido e quiz respondido |
| B14 | Perfil expandido | Bio, especialidades, estatísticas básicas, Banco de Conquistas |

---

## 🟡 Recomendado — v0.8.0-beta

| ID | Item | Detalhe |
|----|------|---------|
| B15 | Trivia expandida | Categorias e dificuldades configuráveis |
| B16 | Mapa de habilidades | Visualização no perfil das categorias mais exploradas |
| B17 | Missão por categoria cognitiva | "Jogar 3 partidas de Lógica hoje" |
| B18 | Changelog público | Seção na plataforma mostrando as últimas atualizações |

---

## 🔴 Obrigatório — v0.9.0-beta (Stability Update)

| ID | Item | Detalhe |
|----|------|---------|
| B19 | Deploy Railway | Volume `/data` + `DATABASE_DIR=/data` + `evlurn.app` apontado |
| B20 | Abertura pública | Cadastro simplificado para beta público |
| B21 | Política de Privacidade | Página pública — exigida para AdSense e abertura pública |
| B22 | Termos de Uso | Página pública — exigida para AdSense e abertura pública |
| B23 | Limpeza de sessões | Job periódico removendo sessões expiradas da memória |
| B24 | Redirect pós-cadastro | Para `/login.html?novo=1` com mensagem de confirmação |
| B25 | Ranking público sem login | `/ranking` acessível sem autenticação |
| B26 | Analytics básico | DAU, MAU, retenção no painel admin |
| B27 | Monitoramento de uptime | Alerta externo ao Railway health check |

---

## 🟡 Recomendado — v0.9.0-beta

| ID | Item | Detalhe |
|----|------|---------|
| B28 | Broadcast evento raro | Notificação em tempo real quando alguém acerta o Preto |
| B29 | Card compartilhável | Imagem de conquista para WhatsApp |
| B30 | Conta AdSense/Monetag | Iniciar processo de aprovação |
| B31 | Rankings múltiplos | Consistência, Atividade, Coleção |
| B32 | Indicação escalonada | 200 → 300 → 500 EVC por indicado |
| B33 | Evento semanal auto | Multiplicador dominical automático |

---

## 🔴 Obrigatório — v1.0.0 (Launch)

| ID | Item | Detalhe |
|----|------|---------|
| B34 | Mundos funcionais | Academia, Oficina e Explorar com conteúdo real |
| B35 | Monetização ativa | Display ads + vídeos recompensados integrados |
| B36 | Sistema de amigos | Buscar, adicionar, ver perfil |
| B37 | Banco de Conquistas completo | Todas as categorias, raridades e tipos |
| B38 | Performance 1k usuários | Validada com dados reais |
| B39 | CNPJ aberto | Para recebimento de receita publicitária |
| B40 | Simulação econômica | Com dados reais do beta — antes do lançamento |

---

## 💡 Futuro (sem versão definida)

| ID | Item | Conceito |
|----|------|---------|
| F01 | Bot Telegram | Notificação de rodada aberta e resultado |
| F02 | Temporadas | Reset mensal de ranking com premiação |
| F03 | Desafios P2P | Tudo ou Nada head-to-head entre jogadores |
| F04 | Push Notifications | Web Push API com VAPID |
| F05 | Torneios cognitivos | Competição por categoria com ranking próprio |
| F06 | Parcerias locais | Cupons — depende de análise jurídica (Lei 5.768/71) |
| F07 | Conquistas 3D | Banco de Conquistas com renderização 3D |
| F08 | Loja cosmética | Avatares, bordas, temas — compra com EVC |
| F09 | Aplicativo Android | Via Trusted Web Activity (TWA) |
| F10 | API pública | Para integrações de terceiros |
| F11 | Categoria Reflexo | Jogos de tempo de reação — requer WebSocket |
| F12 | Conteúdo de usuário | Academia aberta para contribuição da comunidade |

---

## ✅ Concluídas

| ID | Item | Versão |
|----|------|--------|
| — | Autenticação completa (login, sessão, scrypt nativo) | v0.1.0 |
| — | 4 jogos: Roleta, Moeda, Cofre, Tudo ou Nada | v0.1.0–v0.5.0 |
| — | Painel admin (usuários, rodadas, logs, eventos) | v0.2.0 |
| — | Scheduler automático de rodadas | v0.2.0 |
| — | Schema expandido (títulos, missões, vídeos, sugestões) | v0.3.0 |
| — | PWA instalável (manifest, SW, ícones, banner) | v0.4.0 |
| — | Sistema de multiplicadores (nível + patente + títulos + eventos) | v0.5.0 |
| — | 10 patentes: Visitante → Mestre da Fortuna | v0.5.0 |
| — | Tudo ou Nada com odds por ranking | v0.5.0 |
| — | Identidade visual Evlurn (paleta, tipografia, ícone, tagline) | v0.6.0 |
| — | Arquitetura de Mundos com header persistente | v0.6.0 |
| — | Animação de suspense nos jogos | v0.6.0 |
| — | Sugestões, notificações, login diário, trivia, configurações | v0.6.0 |
| — | Edição de perfil (usuário + admin), exclusão de conta (LGPD) | v0.6.0 |
| — | Correção bug Roleta, histórico unificado de apostas | v0.6.0 |
| — | Estrutura docs/, assets/, database/ | v0.7.0-beta |
| — | Evlurn Bible, Roadmap, CHANGELOG, Decisions documentados | v0.7.0-beta |
| — | Direção cognitiva definida em Game Design | v0.7.0-beta |
| — | v0.8.0-beta: toda documentação consolidada | v0.8.0-beta |
| — | Nova estrutura hierárquica docs/ (Bible, Architecture, Design, Economy, Editorial, GameDesign, Project) | v0.8.0-beta |
| — | Design System completo (5 documentos) | v0.8.0-beta |
| — | Constituição Editorial criada | v0.8.0-beta |
| — | Knowledge System documentado | v0.8.0-beta |
| — | Economy Balance com todas as fórmulas | v0.8.0-beta |
| — | Banco de Conquistas especificado (6 raridades, 5 tipos) | v0.8.0-beta |
| — | Perfil LinkedIn-style especificado | v0.8.0-beta |

---

*v0.8.0-beta — Intelligence Update — Julho 2026*
