# Components — Especificações de UI
**v0.8.0-beta | Julho 2026**

---

## Botões

| Variante | CSS class | Uso |
|----------|-----------|-----|
| Primário | `.btn-primario` | Ação principal — gradiente da marca |
| Sucesso | `.btn-sucesso` | Confirmação, ganho — azul `#00B4FF` |
| Perigo | `.btn-perigo` | Ações destrutivas — vermelho `#FF4D6A` |
| Fantasma | `.btn-fantasma` | Cancelar, secundário — fundo transparente |
| Bloco | `.btn-bloco` | Largura 100% do container |
| Pequeno | `.btn-pequeno` | Altura reduzida, padding compacto |

**Altura mínima:** 44px em mobile (Apple HIG + Material Design).
**Touch action:** `manipulation` em todos os botões (remove delay de 300ms).

---

## Cards

| Variante | CSS class | Uso |
|----------|-----------|-----|
| Card padrão | `.card` | Container de conteúdo principal |
| Card elevado | `.card-elevado` | Modal, overlay, painel destacado |
| Card de jogo | `.jogo-card-v2` | Cards da Arena com cor por categoria |

**Borda:** `1px solid var(--borda-sutil)`
**Raio:** `var(--raio-grande)` = 16px
**Padding:** 20px

---

## Badges e Tags

| Variante | Uso |
|----------|-----|
| `.badge-aberta` | Rodada ativa |
| `.badge-encerrada` | Rodada encerrada |
| `.badge-ativo` | Status ativo geral |
| `.badge-pendente` | Aguardando ação |

**Raio:** `999px` (pill)
**Padding:** `4px 10px`

---

## Header Global

Sempre visível. Contém:
1. Logo/símbolo Evlurn
2. Avatar + patente
3. Barra de XP com nível
4. Saldo EVC
5. Botão de notificações (badge)
6. Botão de sair

**Altura:** `56px` (`--header-h`)
**Background:** `var(--bg-elevado)` + `border-bottom: 1px solid var(--borda-sutil)`

---

## Navegação

### Desktop — Sidebar
- Largura colapsada: `72px` (`--sidebar-w`)
- Largura expandida (hover): `220px` (`--sidebar-w-expandida`)
- Ícone + label — label visível apenas no hover

### Mobile — Nav inferior
- Altura: `60px` (`--nav-mobile-h`)
- 5 itens: Arena, Academia, Oficina, Explorar, Perfil
- Ícone + label curta
- `padding-bottom: env(safe-area-inset-bottom)` para notch

---

## Modais

- **Overlay:** `rgba(0,0,0,0.7)` cobrindo toda a tela
- **Caixa:** max-width `360–480px`, centralizada vertical e horizontalmente
- **Fechar:** clique fora da caixa ou botão ✕
- **Animação:** `entrarToast` — slide + fade in 0.18s

---

## Animações Existentes

| Nome | Uso |
|------|-----|
| `entrarToast` | Entrada de toasts e modais |
| `suspenseGiro` | Ícone girando durante suspense de jogo |
| `suspenseShake` | Ícone chacoalhando (cofre) |
| `suspenseBalanca` | Balança oscilando (Tudo ou Nada) |
| `pulso` | Indicador de status ativo |

---

*v0.8.0-beta — Julho 2026*
