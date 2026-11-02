# Game Design — Evlurn Arena
### Versão 0.7.0-beta | Atualizado em: Julho 2026

> Este documento define a filosofia, mecânicas e economia dos jogos da Evlurn. Reflete a transição da plataforma de entretenimento por sorte para entretenimento inteligente com classificação por habilidades cognitivas.

---

## Filosofia de Design — A Evolução

### Como os jogos eram pensados (até v0.6.x)

Os jogos nasceram com foco em entretenimento e circulação de EVC. A lógica era simples:
- House edge baixo (6–7%) para não frustrar o usuário
- Momentos de tensão e surpresa para gerar engajamento
- Evento social coletivo (Roleta Primária) como âncora da Arena

Funcionava como entretenimento. Mas não diferenciava a Evlurn de nenhuma outra plataforma de jogos casuais.

### Como os jogos passam a ser pensados (a partir de v0.8.0-beta)

A Arena deixa de ser um conjunto de jogos de sorte e passa a ser um **ecossistema de jogos classificados por habilidade cognitiva**.

Os jogos de sorte continuam existindo — são divertidos, criam tensão e momentos sociais. Mas passam a ser apenas **uma das categorias**, não a identidade da plataforma.

A pergunta que orienta cada novo jogo:

> *"Que habilidade cognitiva este jogo desenvolve ou exercita?"*

Se a resposta for "nenhuma — é pura sorte", o jogo pertence à categoria **Sorte**. Se exercitar raciocínio, memória, estratégia ou linguagem, pertence a uma categoria cognitiva.

---

## Categorias de Jogos (Arquitetura Futura)

| Categoria | Ícone | Habilidade desenvolvida | Status |
|-----------|-------|------------------------|--------|
| **Sorte** | 🎲 | Entretenimento, gestão de risco | Implementado |
| **Lógica** | 🧩 | Raciocínio dedutivo e indutivo | Planejado v0.8 |
| **Matemática** | 🔢 | Cálculo mental, estimativa | Planejado v0.8 |
| **Memória** | 🧠 | Memória de trabalho, atenção | Planejado v0.8 |
| **Estratégia** | ♟️ | Planejamento, tomada de decisão | Planejado v0.9 |
| **Linguagem** | 📝 | Vocabulário, interpretação | Planejado v1.0 |

> **Decisão de design:** jogos de sorte não serão removidos. São âncoras de engajamento e geração de EVC. A mudança é de identidade e expansão — não de substituição.

---

## Jogos Atuais — Categoria: Sorte

### Jogo 1 — Roleta Primária
**Classificação:** Sorte — Social
**Tipo:** Rodada coletiva com resultado compartilhado

#### Propósito na plataforma
Evento social que cria momentos coletivos. Todos os usuários online apostam na mesma rodada e recebem o resultado simultaneamente. Gera senso de comunidade e narrativa compartilhada — especialmente quando o Preto é sorteado.

#### Mecânica
1. Rodada aberta pelo scheduler automático ou pelo admin
2. Jogadores escolhem uma cor e apostam EVC antes do fechamento
3. Uma cor é sorteada — apenas quem escolheu a cor correta ganha

#### Probabilidades e retornos

| Opção | Probabilidade | Multiplicador | EV por aposta |
|-------|--------------|---------------|---------------|
| Azul | 33,3% | ×2,8 | −6,76% |
| Verde | 33,3% | ×2,8 | −6,76% |
| Vermelho | 33,3% | ×2,8 | −6,76% |
| Preto ⭐ | 0,1% | ×10 | −90%* |

*O Preto tem house edge alto matematicamente, mas funciona como jackpot social — quando sai, é broadcast para todos os usuários online.

#### Animação
Roda girando por 2 segundos antes de revelar a cor sorteada.

---

### Jogo 2 — Joga a Moeda
**Classificação:** Sorte — Casual
**Tipo:** Individual instantâneo

#### Propósito na plataforma
Jogo de alta frequência para sessões rápidas. Baixa fricção, resultado imediato, ideal para quem tem 30 segundos entre uma atividade e outra.

#### Mecânica
1. Jogador escolhe Cara ou Coroa e define o valor
2. Sistema sorteia entre três resultados: Cara (49,5%), Coroa (49,5%), Lado (1%)
3. Acerto ganha +90% da aposta; erro ou Lado perde a aposta

#### Probabilidades

| Resultado | Probabilidade | Retorno sobre aposta |
|-----------|--------------|---------------------|
| Cara (escolheu Cara) | 49,5% | +90% |
| Coroa (escolheu Coroa) | 49,5% | +90% |
| Lado | 1% | −100% |

```
EV = 0.495 × 0.9 − 0.505 = −0.0595 → house edge 5,95%
```

#### Animação
Moeda girando por 2,2 segundos antes de revelar o resultado.

---

### Jogo 3 — Cofre Misterioso
**Classificação:** Sorte — Surpresa
**Tipo:** Individual instantâneo com limite diário

#### Propósito na plataforma
Apelo de descoberta e surpresa. O limite de 10 aberturas por dia cria o ciclo "volte amanhã" — uma das ferramentas mais eficazes de retenção diária.

#### Mecânica
1. Jogador define o valor e abre o cofre
2. Um dos 5 tiers é sorteado
3. Retorno calculado pelo multiplicador do tier
4. **Limite:** 10 aberturas por dia por usuário

#### Tiers

| Tier | Probabilidade | Multiplicador | Tipo |
|------|--------------|---------------|------|
| 🥉 Bronze | 45% | ×0,60 | Perda parcial |
| 🥈 Prata | 30% | ×0,90 | Quase neutro |
| 🥇 Ouro | 15% | ×1,10 | Leve ganho |
| 💎 Diamante | 8% | ×1,80 | Bom ganho |
| ✨ Lendário | 2% | ×4,00 | Jackpot |

```
EV = 0.45×0.60 + 0.30×0.90 + 0.15×1.10 + 0.08×1.80 + 0.02×4.00 = 0.929
House edge: 7,1%
```

#### Animação
Cofre chacoalhando por 2,5 segundos antes de abrir.

---

### Jogo 4 — Tudo ou Nada
**Classificação:** Sorte — Estratégia de Risco
**Tipo:** Individual instantâneo com odds dinâmicas por ranking

#### Propósito na plataforma
Mecanismo de equilíbrio econômico. Impede que líderes do ranking acumulem vantagem infinita, dando a jogadores atrás no ranking odds melhores de recuperação.

#### Mecânica
1. Jogador escolhe o percentual do saldo a arriscar: 10%, 25%, 50% ou 100%
2. Sistema consulta a posição no ranking no momento da aposta
3. Odds determinadas pela faixa de ranking

#### Odds por faixa de ranking

| Faixa | Chance de vitória | Retorno | Lógica de design |
|-------|-------------------|---------|-----------------|
| Top 10 | 60% | +20% | Líderes têm odds mais duras |
| Posições 11–50 | 65% | +25% | Zona intermediária |
| Abaixo do Top 50 | 70% | +30% | Cauda tem oportunidade real |

> Ao perder, o jogador perde apenas o valor apostado — não o saldo total.

#### Animação
Balança oscilando por 2,8 segundos antes de revelar o resultado.

---

## Banco de Conquistas — Direção v0.8.0-beta

O Banco de Conquistas foi inicialmente pensado como coleção de moedas simbólicas por marcos nos jogos. A nova visão expande significativamente o conceito:

### Nova visão

Conquistas deixam de ser apenas troféus de jogos e passam a representar **marcos de desenvolvimento real do usuário**.

| Categoria de conquista | Exemplos |
|----------------------|---------|
| Consistência | "7 dias seguidos", "30 dias no mês", "1 ano de streak" |
| Cognição | "Acertou 10 trivias seguidas", "Completou trilha de Lógica" |
| Aprendizado | "Leu 5 artigos da Academia", "Concluiu trilha de Finanças" |
| Social | "Indicou 3 amigos", "Participou de 10 rodadas coletivas" |
| Arena | "Acertou o Preto", "Ganhou 100 partidas", "Virada épica no Tudo ou Nada" |

### Classificações de raridade

| Rarity | Disponibilidade | Cor |
|--------|----------------|-----|
| Comum | Frequente — hábitos básicos | Cinza `#8B949E` |
| Incomum | Moderada — consistência | Verde `#3FB950` |
| Rara | Ocasional — feitos notáveis | Azul `#00B4FF` |
| Épica | Rara — marcos de longo prazo | Roxo `#7B5CFF` |
| Lendária | Muito rara — feitos excepcionais | Dourado `#F0C040` |
| Mítica | Extremamente rara — elite | Vermelho `#FF4D6A` |
| Única | Uma por evento ou temporada | Gradiente especial |

> A arquitetura de banco está preparada nas tabelas `titulos_def` e `usuario_titulos`. A expansão para o Banco de Conquistas completo está prevista para v0.8.0-beta.

---

## Multiplicadores e Progressão

Todos os ganhos nos jogos são multiplicados pelo bônus acumulado do jogador:

```
ganho_final = ganho_base × (1 + bônus_nível + bônus_patente + bônus_títulos) × mult_evento
```

| Componente | Faixa | Cap |
|-----------|-------|-----|
| Bônus de nível (1–50) | 0% a +10% | — |
| Bônus de patente | 0% a +22% | — |
| Bônus de títulos | 0% a ~10% | — |
| **Bônus somado** | — | **50% máximo** |
| Multiplicador de evento | ×1,0 a ×10,0 | Definido pelo admin |

---

## Jogos Planejados — v0.8.0-beta (Categoria: Lógica)

> Detalhamento completo será adicionado durante o desenvolvimento da v0.8.0-beta.

**Sequências Lógicas** — identificar o padrão e completar a sequência. Exercita raciocínio indutivo.

**Matriz de Padrões** — encontrar o elemento que quebra o padrão em uma grade. Exercita raciocínio espacial.

**Dedução em Cadeia** — dado um conjunto de premissas, chegar à conclusão correta. Exercita lógica formal.

---

*Última atualização: v0.7.0-beta — Foundation Update — Julho 2026*
