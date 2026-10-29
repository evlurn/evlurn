# Typography — Evlurn
**v0.8.0-beta | Julho 2026**

---

## Famílias Tipográficas

| Família | Uso | Import |
|---------|-----|--------|
| **Exo 2** | Títulos, display, logo | Google Fonts |
| **Inter** | UI, corpo de texto | Google Fonts |
| **Courier New / SF Mono** | Código, números monospace | Sistema |

```css
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
```

---

## Hierarquia de Texto

| Nível | Fonte | Peso | Tamanho (mobile) | Tamanho (desktop) | Uso |
|-------|-------|------|-------------------|-------------------|-----|
| Display | Exo 2 | 900 | 28px | 36px | Logo, nome da plataforma |
| H1 | Exo 2 | 800 | 22px | 28px | Títulos de Mundo |
| H2 | Exo 2 | 700 | 18px | 22px | Seções principais |
| H3 | Inter | 700 | 15px | 17px | Subsecções, cards |
| Body | Inter | 400 | 14px | 15px | Texto de conteúdo |
| Small | Inter | 400 | 12px | 13px | Labels, metadados |
| Mono | Courier New | 400 | 13px | 14px | Números, código |

---

## Variáveis CSS

```css
--fonte-display: 'Exo 2', 'Montserrat', sans-serif;
--fonte-ui:      'Inter', -apple-system, 'Segoe UI', sans-serif;
--fonte-mono:    'SF Mono', 'Consolas', 'Courier New', monospace;
```

---

## Regras de Uso

- **Exo 2** apenas para títulos, logo e elementos de destaque. Nunca para parágrafos longos.
- **Inter** para todo o resto — labels, parágrafos, botões, inputs.
- **Monospace** para números que precisam alinhar (saldo EVC, rankings, timestamps).
- Tamanho mínimo de texto: **12px** (acessibilidade).
- Inputs e formulários: mínimo **16px** em mobile (evita zoom automático no iOS).

---

*v0.8.0-beta — Julho 2026*
