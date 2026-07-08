# ATA DO PROJETO — Evlurn

> **Documento vivo** — atualizado a cada sessão de desenvolvimento.
> Registra decisões tomadas, pendências abertas, tópicos para aprofundamento e histórico.

---

## 1. Identidade do Projeto

**Nome:** Evlurn
**Domínio:** evlurn.app (disponível, não comprado ainda)
**Slogan:** Entretenimento social com fichas virtuais
**Origem:** Revivals do "Projeto Fichas" (João Victor, UFRPE/BSI, 2019)
**Objetivo:** Plataforma autossustentável de entretenimento entre amigos — sem dinheiro real

**Stack:**
- Back-end: Node.js 22.5+ nativo, SQLite via node:sqlite, zero dependências npm
- Front-end: HTML + CSS + JavaScript puro, PWA instalável
- Banco: SQLite com 14 tabelas, WAL mode, migrações automáticas

---

## 2. Funcionalidades Implementadas ✅

### 2.1 Autenticação
- Cadastro → pendente → aprovação admin → saldo inicial + bônus indicação
- Login por apelido + senha (scrypt nativo), sessão por cookie (7 dias)
- Redirecionamento automático: jogador → app.html, admin → admin.html

### 2.2 Jogos

| Jogo | Tipo | House Edge | Mecânica |
|------|------|-----------|----------|
| Roleta Primal | Rodada social | ~6,7% | Azul/Verde/Vermelho (33,3% × 2.8) + Preto (0,1% × 10). Todos apostam antes do fechamento. |
| Joga a Moeda | Individual instantâneo | ~6% | Cara/Coroa (49,5% × 1.9) + Lado (1%, perde aposta). Resultado imediato. |
| Cofre Misterioso | Individual instantâneo | ~7,1% | Bronze→Lendário (45/30/15/8/2%, ×0,6→×4). Limite 10/dia. |
| Tudo ou Nada | Individual instantâneo | variável | Odds por faixa de ranking: Top10 (60%/+20%), 11-50 (65%/+25%), >50 (70%/+30%). Apostas de 10/25/50/100% do saldo. |

### 2.3 Sistema de Rodadas
- Scheduler automático para Roleta Primal: slots alinhados ao relógio (ex: 5min → 00:00, 00:05…)
- Sem apostas → cancela silenciosamente; com apostas → sorteia e distribui
- Contagem regressiva no front-end durante espera de rodada

### 2.4 Sistema de Multiplicadores
Fórmula: `ganho_final = ganho_base × (1 + bônus_nível + bônus_patente + bônus_títulos) × mult_evento`
Cap de 50% no bônus somado.

**Nível (1–50):** XP de todas as atividades → 0% a +10% de bônus
**Patente (10 tiers):** Baseada em streak de login consecutivo. Reseta ao quebrar.

| Patente | Streak | Fichas/dia | Bônus mult |
|---------|--------|-----------|------------|
| Visitante | 0 dias | 0 | 0% |
| Frequentador | 3 dias | 5 | 1% |
| Participante | 7 dias | 10 | 2% |
| Apostador | 14 dias | 20 | 3% |
| Competidor | 21 dias | 35 | 5% |
| Estrategista | 30 dias | 50 | 7% |
| Veterano | 60 dias | 70 | 9% |
| Magnata | 90 dias | 100 | 12% |
| Lenda Viva | 180 dias | 135 | 16% |
| Mestre da Fortuna | 365 dias | 180 | 22% |

**Títulos:** 17 definidos (Estreante → Conquistador). Alguns dão bônus permanente (+1-2%).
**Eventos:** Criados pelo admin com multiplicador temporário e período configurável.

### 2.5 Painel Administrativo
Dashboard, cadastros pendentes, usuários (busca + ajuste de saldo), rodadas, ranking, logs (com IP), configurações gerais, scheduler e eventos.

### 2.6 PWA
manifest.json, service worker, ícones 192/512px (logo CC), apple-touch-icon, banner de instalação (Android automático / iOS instrucional), viewport-fit=cover, correção de zoom iOS em inputs.

### 2.7 Sistema de Logs
Toda ação registrada com: data, usuário, admin responsável, tipo, descrição detalhada e IP de origem (com suporte a proxy via x-forwarded-for).

### 2.8 Schema preparado para expansão
Tabelas: atividades, videos_assistidos, sugestoes, titulos_def (17 seeds), usuario_titulos, missoes_def (9 seeds: 6 diárias + 3 semanais), missao_progresso, eventos.

---

## 3. Pendências Técnicas 🔧

### Alta prioridade (bloqueiam experiência de progressão)
| # | O que | Detalhe |
|---|-------|---------|
| P01 | Front-end de missões | Barra de progresso, botão de reivindicar, reset diário. Backend 100% pronto. |
| P02 | Front-end de títulos | Exibir no perfil, notificação ao conquistar, escolher título ativo. Backend pronto. |
| P03 | XP e Nível visíveis | Conceder XP em cada ação, exibir barra de nível na home. Schema e serviço prontos. |
| P04 | Streak de login | Verificar ao logar, incrementar/resetar streak, missão diária de login. |

### Média prioridade
| # | O que | Detalhe |
|---|-------|---------|
| P05 | Deploy | Railway ou DigitalOcean — arquivos de config a preparar |
| P06 | Rankings múltiplos | Mais Sortudo, Mais Ativo, Maior Assistidor, Maior Convidador |
| P07 | Redirect pós-cadastro | Após cadastro bem-sucedido, redirecionar para /login.html com mensagem |
| P08 | Botão de sugestão | Modal flutuante + POST /api/sugestoes + visualização no admin |
| P09 | Ranking público sem login | /ranking acessível sem autenticação para viralidade |
| P10 | Broadcast de evento raro | Notificação em tempo real quando alguém acerta o Preto |
| P11 | Card compartilhável | Imagem gerada ao conquistar título para compartilhar no WhatsApp |

### Baixa prioridade / Em Breve
| # | O que | Detalhe |
|---|-------|---------|
| P12 | Vídeos rewarded | Backend pronto (timer 28s server-side). Aguarda conta em Adinplay/Monetag. |
| P13 | Banners AdSense | Slots HTML prontos. Aguarda publisher ID e aprovação da conta. |
| P14 | Perfil público | Página /perfil/apelido compartilhável com títulos e ranking |

---

## 4. Decisões em Aberto 🤔

| # | Tema | Status |
|---|------|--------|
| D1 | Hospedagem | Railway (~R$30-50/mês) vs DigitalOcean Droplet (~R$30/mês) |
| D2 | Rede de anúncios | AdSense (mais lento) vs Monetag/Adinplay (voltadas para jogos) |
| D3 | Parcerias locais (cupons) | Requer estudo jurídico — Lei 5.768/71, SEAE |
| D4 | Temporadas | Reset mensal de ranking com premiação virtual para top 3 |
| D5 | Desafios entre jogadores | Aposta mútua direta entre dois jogadores |
| D6 | Notificações push | Web Push para "nova rodada aberta" (requer VAPID) |
| D7 | Indicação escalonada | 1 indicado = 200 fichas / 3+ = 300 cada / 5+ = 500 cada |

---

## 5. Funcionalidades "Em Breve" ⏳

| # | Feature | Motivo do adiamento |
|---|---------|---------------------|
| V01 | Anúncios rewarded video | Requer conta ativa (Adinplay, Airnow ou Monetag). Infraestrutura backend pronta. |
| V02 | Banners display | Requer conta AdSense aprovada e domínio próprio evlurn.app. Slots HTML prontos. |

---

## 6. Tópicos para Aprofundamento Futuro 📚

| # | Tópico |
|---|--------|
| T01 | Parcerias locais — enquadramento jurídico (Lei 5.768/71, promoção comercial vs. jogo de azar) |
| T02 | Migração para PostgreSQL quando escala exigir (>500 usuários simultâneos frequentes) |
| T03 | LGPD — Termos de Uso e Política de Privacidade antes de qualquer monetização real |
| T04 | Temporadas mensais — mecânica de reset e premiação virtual |
| T05 | TWA (Trusted Web Activity) — publicar na Google Play sem reescrever código |
| T06 | Notificações push — Web Push API + VAPID para engajamento fora do app |

---

## 7. Plano de Lançamento (a partir de 25/06/2026)

| Fase | Período | Objetivo | Entregas |
|------|---------|----------|---------|
| 01 Finalização | Jun 25 – Jul 8 | Produto completo para beta | Missões/Títulos/XP no front, deploy Railway, PWA testada em celular real |
| 02 Beta Fechado | Jul 9 – Jul 22 | Validação com amigos próximos (5-10 pessoas) | Feedback de UX e economia, bugs corrigidos |
| 03 Beta Ampliado | Jul 23 – Ago 23 | Crescimento controlado (20-50 usuários) | Ajuste econômico com dados reais, conta de anúncios solicitada |
| 04 Soft Launch | Ago 24 – Set 23 | Abertura pública | evlurn.app ativo, monetização display, campanhas de indicação |
| 05 Growth | Set 24+ | Escala e novas features | Broadcast de eventos, card compartilhável, ranking público, temporadas |

---

## 8. Histórico de Versões

| Versão | Data | O que foi feito |
|--------|------|----------------|
| 0.1 | Jun/2026 | Sistema base: auth, 4 jogos, rodadas manuais, ranking, logs, painel admin |
| 0.2 | Jun/2026 | Scheduler automático alinhado ao relógio, contagem regressiva |
| 0.3 | Jun/2026 | IP nos logs, schema expandido (títulos/missões/XP/eventos/sugestões), seeds completos |
| 0.4 | Jun/2026 | PWA completa: manifest, service worker, ícones Evlurn, banner instalação iOS/Android |
| 0.5 | Jun/2026 | Tudo ou Nada com odds por ranking; Joga a Moeda e Cofre como jogos instantâneos; sistema de patentes (10 tiers novos); multiplicadores por nível/patente/títulos/eventos; economia rebalanceada (house edge ~6-7% em todos os jogos) |

---

*Documento: Junho 2026 · evlurn.app · Sem dinheiro real · 100% entretenimento*
