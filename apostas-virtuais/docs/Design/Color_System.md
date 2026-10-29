# Color System — Evlurn
**v0.8.0-beta | Julho 2026**

---

## Paleta Principal

| Token CSS | Hex | RGB | Uso |
|-----------|-----|-----|-----|
| `--primario` | `#00B4FF` | 0, 180, 255 | Ações primárias, links, destaques |
| `--secundario` | `#7B5CFF` | 123, 92, 255 | Elementos secundários, gradiente |
| `--teal` | `#2BD4C5` | 43, 212, 197 | Acento complementar, sucesso alternativo |

## Fundo e Superfícies

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--bg` | `#0D1117` | Fundo da página |
| `--bg-elevado` | `#161B22` | Header, sidebar, modais |
| `--bg-card` | `#1C2128` | Cards e painéis |
| `--borda` | `#30363D` | Bordas visíveis |
| `--borda-sutil` | `#21262D` | Bordas suaves, divisores |

## Texto

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--texto` | `#FFFFFF` | Texto principal |
| `--texto-secundario` | `#8B949E` | Texto de suporte |
| `--texto-terciario` | `#484F58` | Texto desabilitado, placeholders |

## Estado

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--sucesso` / `--verde` | `#00B4FF`* | Vitória, confirmação, sucesso |
| `--erro` / `--vermelho` | `#FF4D6A` | Erro, perda, alerta crítico |
| `--aviso` / `--amarelo` | `#2BD4C5` | Aviso, atenção, informação |

*Nota: `--verde` aponta para `--primario` (#00B4FF) após o rebranding. A variável CSS foi mantida por compatibilidade com código existente.

## Gradiente Principal

```css
--gradiente: linear-gradient(135deg, #00B4FF 0%, #7B5CFF 100%);
--gradiente-sutil: linear-gradient(135deg, rgba(0,180,255,0.15) 0%, rgba(123,92,255,0.15) 100%);
```

## Raridades do Banco de Conquistas

| Raridade | Hex | Token sugerido |
|----------|-----|---------------|
| Comum | `#8B949E` | `--rarity-comum` |
| Incomum | `#3FB950` | `--rarity-incomum` |
| Rara | `#00B4FF` | `--rarity-rara` |
| Épica | `#7B5CFF` | `--rarity-epica` |
| Lendária | `#F0C040` | `--rarity-lendaria` |
| Ultimate | gradiente especial | `--rarity-ultimate` |

## Contraste e Acessibilidade

Todos os textos sobre fundo escuro devem respeitar WCAG AA (mínimo 4,5:1 para texto normal, 3:1 para texto grande).

| Combinação | Contraste | Status |
|-----------|-----------|--------|
| `#FFFFFF` sobre `#0D1117` | 16,1:1 | ✅ AAA |
| `#8B949E` sobre `#0D1117` | 5,2:1 | ✅ AA |
| `#00B4FF` sobre `#0D1117` | 8,3:1 | ✅ AAA |
| `#7B5CFF` sobre `#0D1117` | 4,8:1 | ✅ AA |
| `#484F58` sobre `#0D1117` | 2,1:1 | ⚠️ Não usar para texto longo |

---

*v0.8.0-beta — Julho 2026*
