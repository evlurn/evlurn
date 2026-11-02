# Knowledge System — Centro de Conhecimento
**v0.8.0-beta | Julho 2026**

> Documentação completa do Centro de Conhecimento da Evlurn — a área principal da plataforma a partir da v0.8.0-beta.

---

## Conceito

O Centro de Conhecimento é a área da plataforma onde o aprendizado acontece de forma estruturada.

Não é um blog. Não é uma plataforma de cursos. É um ecossistema editorial gamificado onde cada conteúdo tem propósito, recompensa e impacto mensurável no desenvolvimento do usuário.

---

## Estrutura do Conteúdo

Cada artigo ou conteúdo publicado no Centro de Conhecimento possui:

| Elemento | Descrição |
|----------|-----------|
| **URL própria** | `/academia/[categoria]/[slug]` — indexável e compartilhável |
| **Categoria** | Classificação por área do conhecimento |
| **Nível de dificuldade** | Iniciante / Intermediário / Avançado |
| **Tempo estimado de leitura** | Calculado automaticamente pelo sistema |
| **Quiz** | 3–5 perguntas ao final — obrigatório para recompensa completa |
| **Avaliação** | Usuários avaliam de 1 a 5 estrelas |
| **Comentários** | Seção de discussão moderada |
| **Recompensas** | EVC e XP por leitura + bônus por acerto no quiz |
| **Data de publicação** | Visível ao usuário |
| **Data de atualização** | Visível quando relevante |
| **Fonte(s)** | Citação obrigatória para conteúdo factual |
| **Tag de IA** | Identificação `[IA + Revisão Humana]` quando aplicável |

---

## Categorias do Centro de Conhecimento

| Categoria | Ícone | Descrição |
|-----------|-------|-----------|
| **Finanças** | 💰 | Investimentos, orçamento, juros, planejamento financeiro |
| **Ciências** | 🔬 | Física, química, biologia, ciências da Terra |
| **Tecnologia** | 💻 | Programação, IA, internet, hardware, segurança digital |
| **História** | 📜 | História mundial, brasileira, cultural |
| **Cultura Geral** | 🌍 | Curiosidades, fatos relevantes, interdisciplinar |
| **Desenvolvimento Pessoal** | 🧠 | Produtividade, hábitos, mentalidade, soft skills |
| **Lógica e Raciocínio** | 🧩 | Puzzles, paradoxos, pensamento crítico |
| **Matemática** | 🔢 | Conceitos, aplicações práticas, cálculo mental |
| **Língua Portuguesa** | 📝 | Gramática, vocabulário, escrita |

---

## Sistema de Recompensas por Conteúdo

| Ação | EVC | XP |
|------|-----|-----|
| Ler artigo completo | 10 | 10 |
| Completar quiz (qualquer acerto) | 5 | 5 |
| Completar quiz com 100% de acerto | 25 | 15 |
| Avaliar conteúdo | 2 | 2 |
| Comentar conteúdo | 3 | 3 |
| Compartilhar conteúdo | 5 | — |

**Cap diário de leitura:** 5 artigos com recompensa por dia (evita farm de EVC por leitura rápida).

---

## Trilhas de Aprendizado

Trilhas são sequências curadas de conteúdos com objetivo claro.

| Elemento | Especificação |
|----------|--------------|
| Mínimo de conteúdos | 4 artigos |
| Máximo de conteúdos | 12 artigos |
| Quiz final da trilha | Obrigatório — 5–10 perguntas abrangentes |
| Recompensa de conclusão | 100 EVC + 50 XP + Selo de conquista |
| Certificado | Futuro — v1.0+ |

### Trilhas planejadas para v0.8.0-beta

- **Introdução às Finanças Pessoais** (5 artigos)
- **Fundamentos de Lógica** (4 artigos)
- **Como a Internet Funciona** (4 artigos)
- **Pensamento Crítico no Cotidiano** (6 artigos)

---

## Fluxo de Publicação

```
1. Ideia de conteúdo identificada (admin ou sugestão de usuário)
        ↓
2. Pesquisa e verificação de fontes
        ↓
3. Produção (humano e/ou IA auxiliar)
        ↓
4. Revisão humana obrigatória
        ↓
5. Criação do quiz (3–5 perguntas verificadas)
        ↓
6. Publicação no sistema
        ↓
7. Monitoramento: avaliações, comentários, reportes de erro
        ↓
8. Atualização quando necessário (registrar data)
```

---

## Sistema Editorial

Ver `docs/Editorial/Editorial_Constitution.md` para as regras que governam o conteúdo.

---

## Arquitetura Técnica

### Schema de banco necessário (v0.8.0-beta)

```sql
CREATE TABLE conteudos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nivel TEXT NOT NULL,          -- 'iniciante' | 'intermediario' | 'avancado'
  corpo TEXT NOT NULL,          -- Markdown
  fontes TEXT,                  -- JSON array de strings
  tempo_leitura INTEGER,        -- minutos estimados
  ia_assistida INTEGER DEFAULT 0,
  publicado INTEGER DEFAULT 0,
  autor_id INTEGER,
  data_publicacao TEXT,
  data_atualizacao TEXT,
  evc_recompensa INTEGER DEFAULT 10,
  xp_recompensa INTEGER DEFAULT 10,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

CREATE TABLE quizzes_conteudo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conteudo_id INTEGER NOT NULL,
  pergunta TEXT NOT NULL,
  opcoes TEXT NOT NULL,         -- JSON array
  correta INTEGER NOT NULL,
  explicacao TEXT,
  FOREIGN KEY (conteudo_id) REFERENCES conteudos(id)
);

CREATE TABLE conteudo_leituras (
  usuario_id INTEGER NOT NULL,
  conteudo_id INTEGER NOT NULL,
  data TEXT NOT NULL,
  quiz_concluido INTEGER DEFAULT 0,
  quiz_acertos INTEGER DEFAULT 0,
  avaliacao INTEGER,            -- 1 a 5
  PRIMARY KEY (usuario_id, conteudo_id)
);
```

**Nota:** este schema ainda não está implementado. É a especificação técnica para a v0.8.0-beta.

---

*v0.8.0-beta — Julho 2026*
