# Assets — Evlurn

> Recursos visuais da plataforma. Esta pasta organiza todos os arquivos de identidade visual, ícones e materiais de marketing.

---

## Estrutura

```
assets/
├── logo/       # Versões do logotipo oficial (SVG, PNG, variações)
├── coins/      # Ícones e ilustrações das moedas EVC e do Banco de Conquistas
├── badges/     # Emblemas de títulos e conquistas
├── icons/      # Ícones de interface (complementam os da pasta public/icons/)
├── mockups/    # Mockups de telas para apresentações e documentação
├── banners/    # Banners para redes sociais, campanhas e divulgação
└── README.md   # Este arquivo
```

---

## Subpastas em detalhe

### `logo/`
Versões oficiais do símbolo e logotipo Evlurn.

Arquivos esperados:
- `evlurn_symbol.svg` — símbolo E estilizado (gradiente azul→roxo)
- `evlurn_logo_horizontal.svg` — símbolo + wordmark "EVLURN"
- `evlurn_logo_dark.png` — versão para fundo escuro
- `evlurn_logo_light.png` — versão para fundo claro
- `evlurn_icon_512.png` — ícone quadrado para app stores

> Os ícones PWA (192, 512px) usados diretamente pela aplicação estão em `public/icons/`.

### `coins/`
Recursos visuais relacionados ao EVC e ao futuro Banco de Conquistas.

Arquivos esperados quando o sistema for implementado:
- `evc_coin.svg` — moeda EVC padrão
- `conquest_comum.svg` até `conquest_unica.svg` — moedas por rarity

### `badges/`
Emblemas visuais dos 17 títulos disponíveis na plataforma.

Nomenclatura sugerida: `badge_[slug_titulo].svg`
Exemplo: `badge_lendario.svg`, `badge_mestre_da_fortuna.svg`

### `icons/`
Ícones de interface não incluídos nos ícones PWA.

Uso: elementos visuais nos Mundos, categorias da Academia, tipos de missão.

### `mockups/`
Capturas de tela e mockups de alta fidelidade para apresentações, pitch e documentação.

Nomenclatura sugerida: `mockup_[tela]_[dispositivo]_[data].png`
Exemplo: `mockup_arena_mobile_202607.png`

### `banners/`
Materiais visuais para divulgação em redes sociais e campanhas.

Tamanhos sugeridos:
- Instagram feed: 1080×1080px
- Instagram stories: 1080×1920px
- WhatsApp: 800×600px
- Twitter/X: 1200×628px

---

## Paleta oficial

| Nome | Hex | Uso |
|------|-----|-----|
| Azul Evlurn | `#00B4FF` | Cor primária, CTAs, destaques |
| Roxo Evlurn | `#7B5CFF` | Cor secundária, gradiente |
| Teal | `#2BD4C5` | Acento complementar |
| Fundo | `#0D1117` | Background principal |
| Texto | `#FFFFFF` | Textos sobre fundo escuro |

**Gradiente da marca:** `linear-gradient(135deg, #00B4FF 0%, #7B5CFF 100%)`

---

*Última atualização: Julho 2026*
