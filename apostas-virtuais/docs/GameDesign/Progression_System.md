# Progression System — Sistema de Progressão
**v0.8.0-beta | Julho 2026**

---

## Visão Geral

Quatro camadas independentes com ritmos diferentes:

```
Nível      → progride lentamente (semanas/meses)
Patente    → progride por consistência diária (dias seguidos)
Títulos    → conquistados por marcos específicos (permanentes)
Conquistas → coleção crescente da história do usuário
```

---

## Camada 1 — Nível (1 a 50)

| Ação | XP |
|------|-----|
| Login diário | 3 XP |
| Missão diária | 5–20 XP |
| Missão semanal | 40–80 XP |
| Vídeo assistido | 5 XP |
| Artigo lido | 10 XP |
| Trilha concluída | 50 XP |
| Trivia respondida | 5 XP |

**Curva:** `XP para nível N = N × 100`

**Bônus:** `bônus_nível = (nivel - 1) / 49 × 0.10` → 0% (Nv.1) a +10% (Nv.50)

---

## Camada 2 — Patente

| Patente | Streak | EVC/dia | Bônus |
|---------|--------|---------|-------|
| 👤 Visitante | 0d | 0 | 0% |
| 🚶 Frequentador | 3d | 5 | +1% |
| 🎮 Participante | 7d | 10 | +2% |
| 🎲 Apostador | 14d | 20 | +3% |
| ⚡ Competidor | 21d | 35 | +5% |
| 🧠 Estrategista | 30d | 50 | +7% |
| 🔥 Veterano | 60d | 70 | +9% |
| 💎 Magnata | 90d | 100 | +12% |
| 👑 Lenda Viva | 180d | 135 | +16% |
| 🏆 Mestre da Fortuna | 365d | 180 | +22% |

Reseta para Visitante se o streak quebrar.

---

## Camada 3 — Títulos

Permanentes. Alguns concedem bônus: Lendário (+2%), Milionário (+2%), Conquistador (+1%), Fênix (+1%).

---

## Camada 4 — Banco de Conquistas

Ver `docs/GameDesign/Achievement_System.md`.

---

## Fórmula de Multiplicador

```
ganho_final = ganho_base × min(1 + bônus_nível + bônus_patente + bônus_títulos, 1.50) × mult_evento
```

Cap de 50% no bônus somado. Ver `docs/Economy/Economy_Balance.md`.

---

## Perfil v0.8.0+

Semelhante ao LinkedIn: foto, bio, especialidades, 10 conquistas escolhidas, estatísticas, avaliações, jogos favoritos, visitas.

---

*v0.8.0-beta — Julho 2026*
