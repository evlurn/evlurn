# Economy Balance — Fórmulas e Equilíbrio
**v0.8.0-beta | Julho 2026**

> Documento técnico. Toda decisão econômica da Evlurn deve ser baseada nas fórmulas aqui registradas. Nada deve permanecer implícito.

---

## 1. Multiplicador Total de Ganho

```
ganho_final = ganho_base × fator_progressão × mult_evento

fator_progressão = 1 + min(bônus_nível + bônus_patente + bônus_títulos, 0.50)
```

**Cap de 50%:** o bônus somado nunca ultrapassa 50% para evitar snowballing.

---

## 2. Bônus de Nível

```
bônus_nível(N) = (N - 1) / 49 × 0.10

N=1  → 0%
N=25 → ~4,9%
N=50 → +10%
```

---

## 3. Bônus de Patente

| Patente | streakMin | bônus |
|---------|-----------|-------|
| Visitante | 0 | 0,00 |
| Frequentador | 3 | 0,01 |
| Participante | 7 | 0,02 |
| Apostador | 14 | 0,03 |
| Competidor | 21 | 0,05 |
| Estrategista | 30 | 0,07 |
| Veterano | 60 | 0,09 |
| Magnata | 90 | 0,12 |
| Lenda Viva | 180 | 0,16 |
| Mestre da Fortuna | 365 | 0,22 |

---

## 4. EVC do Login Diário

```
evc_login(streak) = 10 + min(streak × 2, 50)

streak=1  → 12 EVC
streak=10 → 30 EVC
streak=25 → 50 EVC (bônus máximo atingido)
streak=50 → 60 EVC
```

---

## 5. XP por Nível

```
xp_para_proximo_nivel(N) = N × 100

xp_acumulado_nivel(N) = Σ(i=1 até N-1) de (i × 100) = 50 × N × (N-1)

N=2  → 200 XP acumulados
N=10 → 4.500 XP acumulados
N=25 → 30.000 XP acumulados
N=50 → 122.500 XP acumulados
```

---

## 6. Expected Value (EV) por Jogo

### Roleta Primária (apostando em cor principal)
```
EV = 0.333 × 2.8 - 1 = -0.0676 → house edge 6,76%
```

### Joga a Moeda
```
EV = 0.495 × 1.9 - 1 = -0.0595 → house edge 5,95%
```

### Cofre Misterioso
```
EV = (0.45 × 0.60) + (0.30 × 0.90) + (0.15 × 1.10) + (0.08 × 1.80) + (0.02 × 4.00)
   = 0.270 + 0.270 + 0.165 + 0.144 + 0.080
   = 0.929 → house edge 7,1%
```

### Tudo ou Nada

| Faixa | EV vitória | EV derrota | EV total (apostar 100%) |
|-------|-----------|-----------|------------------------|
| Top 10 | +20% × 60% = +12% | −100% × 40% = −40% | **−28%** por rodada |
| 11–50 | +25% × 65% = +16,25% | −100% × 35% = −35% | **−18,75%** por rodada |
| >50 | +30% × 70% = +21% | −100% × 30% = −30% | **−9%** por rodada |

> Nota: o EV negativo alto do Tudo ou Nada é intencional — o jogo é o mecanismo de equilíbrio econômico da plataforma, não um jogo de alto volume.

---

## 7. Equilíbrio Semanal Estimado

Para usuário **ativo** (login diário + todas as missões + trivia):

```
Ganhos garantidos por semana:
  Login (streak 7) = 7 × 24 EVC       = 168 EVC
  Missões diárias  = 7 × 30 EVC médio = 210 EVC
  Missão semanal   = 1 × 160 EVC médio = 160 EVC
  Trivia diária    = 7 × 15 EVC médio  = 105 EVC
  Bônus patente (Participante) = 7 × 10 = 70 EVC
  ─────────────────────────────────────────────
  TOTAL GARANTIDO  ≈ 713 EVC/semana

Dreno estimado (jogando moderadamente):
  Joga a Moeda (5 partidas/dia × 50 EVC/partida):
    5 × 50 × 0.0595 = ~15 EVC de house edge/dia
    × 7 dias = ~105 EVC/semana

SALDO LÍQUIDO SEMANAL: ~608 EVC
```

---

## 8. Simulação de Saldo em 30 Dias

```
Usuário inicia com 1.000 EVC, streak cresce de 0 a 30.

Semana 1 (streak baixo):  +500 EVC → 1.500 EVC
Semana 2 (streak médio):  +600 EVC → 2.100 EVC
Semana 3 (streak bom):    +650 EVC → 2.750 EVC
Semana 4 (Estrategista):  +700 EVC → 3.450 EVC

Projeção conservadora (usuário moderado): ~3.000–4.000 EVC após 30 dias ativos.
```

---

## 9. Parâmetros Configuráveis (Admin)

| Parâmetro | Valor atual | Localização |
|-----------|------------|-------------|
| Saldo inicial | 1.000 EVC | `src/db.js` → seeds |
| Bônus de indicação | 200 EVC | `src/db.js` → config |
| Recompensa de vídeo | 30 EVC | `src/db.js` → config `video_recompensa_moedas` |
| XP por vídeo | 5 XP | `src/db.js` → config `video_recompensa_xp` |
| Limite de vídeos/dia | 10 | `src/db.js` → config `video_limite_diario` |
| Limite cofre/dia | 10 | `src/games-config.js` → `limiteDiario` |
| Mult. evento máximo | ×10 | `src/routes/admin.js` |

---

*v0.8.0-beta — Julho 2026*
