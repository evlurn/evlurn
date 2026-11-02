# Simulation — Estrutura para Simulações Econômicas
**v0.8.0-beta | Julho 2026**

> Este documento estrutura as simulações econômicas da Evlurn. Os cálculos reais serão desenvolvidos conforme a plataforma acumular dados reais de uso.

---

## Objetivo

Simular o comportamento econômico da plataforma sob diferentes cenários de uso, garantindo que o ecossistema EVC permaneça saudável em qualquer fase de crescimento.

---

## Cenários a Simular

### Cenário A — Beta Fechado (10–50 usuários)
**Hipóteses:**
- Usuários altamente engajados (testers)
- Streak médio esperado: 15–20 dias
- Partidas por usuário/dia: 5–10
- Uso da Academia: baixo (conteúdo ainda limitado)

**Métricas a monitorar:**
- Saldo médio por usuário após 30 dias
- Concentração de saldo (top 10% vs. base)
- Volume total de EVC em circulação
- Taxa de depleção (usuários que chegaram a saldo zero)

---

### Cenário B — Beta Expandido (100–500 usuários)
**Hipóteses:**
- Mix de usuários: 20% altamente ativos, 50% moderados, 30% casuais
- Streak médio: 8–12 dias
- Partidas por usuário/dia: 2–5

**Métricas adicionais:**
- Distribuição de patentes na base
- Proporção de EVC gerado por fonte (jogos vs. missões vs. indicações)
- Impacto dos multiplicadores de evento no volume total

---

### Cenário C — Lançamento Público (1.000–10.000 usuários)
**Hipóteses:**
- Maioria de usuários casuais (30–60% com streak < 7 dias)
- Picos de atividade em finais de semana
- Eventos semanais como alavanca principal de engajamento

**Métricas críticas:**
- Inflação de EVC: taxa de geração vs. taxa de consumo
- Necessidade de drenos adicionais (loja, eventos pagos em EVC)
- Impacto do Tudo ou Nada como redistribuidor de riqueza

---

## Variáveis de Entrada

Para cada simulação, documentar:

```
usuários_ativos: int
dias_simulados: int
streak_médio: float
partidas_por_dia: float
uso_academia: float (0.0 a 1.0)
taxa_trivia: float (0.0 a 1.0)
eventos_no_período: int
mult_evento_médio: float
```

---

## Outputs Esperados

```
saldo_médio_final: float
saldo_mediano_final: float
gini_coeficiente: float  (concentração de riqueza)
evc_total_gerado: int
evc_total_drenado: int
inflação_líquida: float  (positivo = inflação, negativo = deflação)
usuários_saldo_zero: int
usuários_top10pct_saldo: float (% do total de EVC)
```

---

## Alertas de Desequilíbrio

| Condição | Sinal de alerta | Ação recomendada |
|----------|----------------|-----------------|
| Inflação líquida > 15%/mês | Excesso de EVC em circulação | Reduzir fontes garantidas ou aumentar house edge |
| Deflação líquida > 10%/mês | Usuários perdendo EVC rápido demais | Reduzir house edge ou adicionar fonte de ganho |
| Gini > 0,70 | Concentração excessiva no topo | Revisar Tudo ou Nada e eventos redistributivos |
| Taxa saldo zero > 5% | Muitos usuários deplecionados | Saldo mínimo garantido ou missão de recuperação |

---

## Status

**Implementação:** pendente — aguardando dados reais do beta.

**Prioridade:** baixa para v0.8.0-beta, média para v0.9.0-beta.

---

*v0.8.0-beta — Julho 2026*
