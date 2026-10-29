# Economy — Economia da Evlurn
**v0.8.0-beta | Julho 2026**

---

## A Moeda: EVC (Evlurn Coins)

EVC é a moeda oficial da plataforma Evlurn.

- Sem valor monetário real
- Não convertível em dinheiro
- Não transferível diretamente entre usuários
- Ganha por engajamento positivo
- Usada em jogos, loja (futuro) e eventos especiais

**Saldo inicial:** 1.000 EVC ao criar conta.
**Bônus de indicação:** +200 EVC ao indicar usuário aprovado.

---

## Fontes de Ganho

### Fontes garantidas (sem risco)

| Fonte | EVC | XP | Frequência |
|-------|-----|----|-----------|
| Login diário | 10 base + bônus streak | 3 | Diária |
| Bônus de streak | +2 × dias (máx. 50) | — | Com login |
| Missão diária | 10–50 | 5–20 | Diária |
| Missão semanal | 120–200 | 40–80 | Semanal |
| Trivia (acerto) | 25 | — | Diária |
| Trivia (participação) | 5 | — | Diária |
| Vídeo recompensado | 30 | 5 | Até 10/dia |
| Artigo lido (Academia) | 10 | 10 | Por artigo |
| Trilha concluída | 100 | 50 | Por trilha |
| Indicação aprovada | 200 | — | Por indicado |
| Bônus de patente | 5–180 | — | Diária |

### Fontes variáveis (com risco)

| Fonte | EV médio | House Edge |
|-------|----------|------------|
| Roleta Primária | −6,76% | ~6,76% |
| Joga a Moeda | −5,95% | ~5,95% |
| Cofre Misterioso | −7,1% | ~7,1% |
| Tudo ou Nada | Variável por faixa | Variável |

---

## Drenos de EVC

Os jogos drenam suavemente o saldo ao longo do tempo, incentivando o uso das fontes garantidas de ganho.

**Equilíbrio projetado:** usuário ativo completa ~350–500 EVC/semana por fontes garantidas. Isso sustenta engajamento moderado nos jogos sem zerar o saldo.

---

## Sistemas Relacionados

| Sistema | Documento |
|---------|-----------|
| Banco de Conquistas | `docs/GameDesign/Achievement_System.md` |
| XP e Nível | `docs/GameDesign/Progression_System.md` |
| Missões | `docs/Project/Backlog.md` (P07) |
| Fórmulas completas | `docs/Economy/Economy_Balance.md` |
| Simulações | `docs/Economy/Simulation.md` |
| Eventos | Admin → Criar Evento |

---

## Ranking

O ranking principal ordena usuários por **saldo EVC atual**.

Rankings futuros (v0.9.0+):
- Mais Ativo (por missões concluídas)
- Maior Consistência (por streak)
- Maior Coleção (por conquistas)
- Por categoria cognitiva

---

## Loja (Futuro — v1.0+)

Itens cosméticos adquiríveis com EVC:
- Avatares e bordas de perfil
- Temas visuais da interface
- Molduras especiais de conquistas

**Princípio:** a loja nunca vende vantagem competitiva. Apenas estética.

---

## Rewarded Ads

Vídeos opcionais de ~30 segundos que concedem EVC e XP.

**Estado atual:** infraestrutura server-side pronta (timer 28s). Aguarda conta ativa em Adinplay ou Monetag.

**Limite:** 10 vídeos por dia por usuário.

---

*v0.8.0-beta — Julho 2026*
