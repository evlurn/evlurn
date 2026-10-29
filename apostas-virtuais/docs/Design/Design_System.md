# Design System — Evlurn
**v0.8.0-beta | Julho 2026**

> Documento mestre da identidade visual da Evlurn. Define todas as especificações de design para garantir consistência entre telas, plataformas e colaboradores. Não contém artes — apenas especificações.

---

## Princípios de Design

| Princípio | Aplicação |
|-----------|-----------|
| **Clareza** | O usuário nunca deve se perguntar o que fazer a seguir |
| **Consistência** | Mesmos elementos, mesmos comportamentos em toda a plataforma |
| **Progresso visível** | O usuário deve sempre sentir que avançou |
| **Mobile first** | Todo componente é projetado primeiro para 390px, depois para desktop |
| **Acessibilidade** | Contraste mínimo WCAG AA em todos os textos |

---

## Documentos desta pasta

| Arquivo | Conteúdo |
|---------|---------|
| `Design_System.md` | Este arquivo — índice e princípios |
| `Brand_Guidelines.md` | Uso do logo, símbolo e marca |
| `Color_System.md` | Paleta completa com tokens e usos |
| `Typography.md` | Fontes, tamanhos, pesos e hierarquia |
| `Components.md` | Especificações de componentes de UI |

---

## Resumo de Tokens Principais

### Cores
```
--primario:    #00B4FF   (azul Evlurn)
--secundario:  #7B5CFF   (roxo Evlurn)
--teal:        #2BD4C5   (acento)
--bg:          #0D1117   (fundo principal)
--bg-elevado:  #161B22   (cards e superfícies elevadas)
--texto:       #FFFFFF
--texto-sec:   #8B949E
```

### Tipografia
```
Display:  Exo 2 — 700/800/900
UI:       Inter — 400/600/700
Mono:     Courier New / SF Mono
```

### Espaçamento (base 4px)
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Raios de borda
```
sm:   6px   (elementos pequenos)
md:   10px  (cards e inputs)
lg:   16px  (modais e cards grandes)
full: 999px (pills e badges)
```

---

## Responsividade

| Breakpoint | Largura | Layout |
|------------|---------|--------|
| Mobile | < 861px | Nav inferior, sidebar oculta, 1 coluna |
| Desktop | ≥ 861px | Sidebar lateral, multi-coluna |

---

*v0.8.0-beta — Julho 2026*
