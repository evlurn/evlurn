# Economy — Evlurn Coins (EVC)

> Documento de economia da plataforma. Define todas as fontes de ganho, drenos, multiplicadores e o equilíbrio econômico do ecossistema.

---

## O que é o EVC

**EVC (Evlurn Coins)** é a moeda oficial da plataforma Evlurn.

- Não tem valor monetário real
- Não pode ser convertido em dinheiro
- Não pode ser transferido entre usuários diretamente
- É ganho por engajamento positivo na plataforma
- É usado nos jogos da Arena e (futuro) em lojas e eventos especiais

---

## Saldo inicial

Todo usuário aprovado começa com **1.000 EVC**.

Usuários indicados por outro membro recebem um bônus adicional de **200 EVC** (configurável).

---

## Fontes de ganho de EVC

### Fontes garantidas (sem risco)

| Fonte | EVC | XP | Frequência | Condição |
|-------|-----|-----|-----------|----------|
| Login diário | 10 base + streak | 3 | Diária | Primeiro acesso do dia |
| Bônus de streak | +2 × dias (máx 50) | — | Por streak | Calculado com login diário |
| Missão diária (básica) | 10–50 | 5–20 | Diária | Conclusão da missão |
| Missão semanal | 120–200 | 40–80 | Semanal | Conclusão da missão |
| Trivia diária (acerto) | 25 | — | Diária | Resposta correta |
| Trivia diária (erro) | 5 | — | Diária | Participação |
| Vídeo recompensado | 30 | 5 | Até 10/dia | Assistir completamente |
| Indicação aprovada | 200 | — | Por indicado | Cadastro aprovado |
| Bônus de patente | 5–180/dia | — | Diária | Dependente da patente |

### Fontes variáveis (com risco)

| Fonte | Retorno médio | House Edge | Frequência |
|-------|--------------|------------|-----------|
| Roleta Primária (acerto) | ×2,8 | ~6,7% | Por rodada |
| Joga a Moeda (vitória) | +90% | ~5,95% | Ilimitada |
| Cofre Misterioso | ×0,929 médio | ~7,1% | Até 10/dia |
| Tudo ou Nada (vitória) | +20–30% | Variável | Ilimitada |

---

## Drenos de EVC

O sistema é projetado para que os jogos drenem suavemente o saldo ao longo do tempo, incentivando o uso das fontes garantidas de ganho.

| Fonte | Perda média esperada por sessão |
|-------|--------------------------------|
| Roleta Primária | ~6,7% por aposta |
| Joga a Moeda | ~6% por aposta |
| Cofre Misterioso | ~7,1% por abertura |
| Tudo ou Nada (Top 10) | 40% de chance de perder o valor apostado |

**Equilíbrio:** um usuário que complete todas as missões diárias e faça login por 7 dias seguidos ganha aproximadamente **350–500 EVC/semana** de fontes garantidas. Isso é suficiente para manter engajamento moderado nos jogos sem zerar o saldo.

---

## Sistema de multiplicadores

### Bônus de nível

| Nível | Bônus sobre ganhos nos jogos |
|-------|------------------------------|
| 1 | 0% |
| 10 | ~1,8% |
| 25 | ~4,6% |
| 50 | +10% |

### Bônus de patente

| Patente | Streak necessário | Fichas/dia | Bônus mult |
|---------|------------------|------------|------------|
| Visitante | 0 dias | 0 | 0% |
| Frequentador | 3 dias | 5 | +1% |
| Participante | 7 dias | 10 | +2% |
| Apostador | 14 dias | 20 | +3% |
| Competidor | 21 dias | 35 | +5% |
| Estrategista | 30 dias | 50 | +7% |
| Veterano | 60 dias | 70 | +9% |
| Magnata | 90 dias | 100 | +12% |
| Lenda Viva | 180 dias | 135 | +16% |
| Mestre da Fortuna | 365 dias | 180 | +22% |

### Bônus de títulos

Alguns títulos concedem bônus permanentes sobre ganhos:

| Título | Bônus |
|--------|-------|
| Lendário (acertou Preto) | +2% |
| Milionário (atingiu 10k EVC) | +2% |
| Conquistador (10 títulos) | +1% |
| Fênix (voltou do zero) | +1% |

### Multiplicadores de evento (admin)

O administrador pode criar eventos temporários com multiplicadores globais:
- Mínimo: ×1,0 (sem efeito)
- Máximo configurável: ×10,0 (usar com cautela)
- Podem ser aplicados a todos os jogos ou a um jogo específico

### Cap de multiplicadores

O bônus somado (nível + patente + títulos) é limitado a **50%** para evitar snowballing.

```
fator_final = (1 + min(bônus_somado, 0.50)) × mult_evento
```

---

## Banco de Conquistas (arquitetura futura)

O **Banco de Conquistas** é um sistema planejado onde cada conquista é representada por uma **moeda personalizada EVC**, que o usuário coleciona permanentemente.

### Classificações planejadas

| Rarity | Cor sugerida | Disponibilidade |
|--------|-------------|-----------------|
| Comum | Cinza | Frequente |
| Incomum | Verde | Moderada |
| Rara | Azul | Ocasional |
| Épica | Roxo | Rara |
| Lendária | Laranja/Dourado | Muito rara |
| Mítica | Vermelho | Extremamente rara |
| Única | Gradiente especial | Uma por evento/temporada |

As moedas serão colecionadas permanentemente no perfil do usuário, independentemente do saldo EVC atual. No futuro, serão renderizadas em 3D.

**Schema preparado em:** `src/db.js` (tabelas `titulos_def` e `usuario_titulos` são a base para este sistema)

---

## Projeção econômica por fase

### Beta (100 usuários)
- Saldo médio esperado: 800–2.000 EVC/usuário
- Circulação diária estimada: 5.000–15.000 EVC
- Fonte principal: jogos + login diário

### Beta Expandido (1.000 usuários)
- Necessidade de revisão do saldo inicial (pode precisar de redução)
- Considerar evento de lançamento com multiplicador especial
- Monitorar distribuição de saldo no ranking

### Soft Launch (10.000+ usuários)
- Introduzir temporadas mensais com reset de ranking
- Loja de itens cosméticos (gastar EVC sem impacto competitivo)
- Considerar passe de temporada (feature premium)

---

*Última atualização: Julho 2026*
