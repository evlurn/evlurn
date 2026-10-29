# Achievement System — Banco de Conquistas
**v0.8.0-beta | Julho 2026**

---

## Conceito
O Banco de Conquistas é a memória permanente do usuário na Evlurn — registro visual da história de desenvolvimento de cada pessoa.

> **O Banco de Conquistas conta quem você se tornou enquanto usava a Evlurn.**

---

## Tipos
| Tipo | Ícone | Descrição |
|------|-------|-----------|
| **Medalhas** | 🏅 | Consistência e participação |
| **Moedas** | 🪙 | Marcos econômicos e de progressão |
| **Troféus** | 🏆 | Conquistas de elite |
| **Selos** | 🔖 | Certificações de habilidades |
| **Eventos** | 🎪 | Conquistas temporárias de eventos |

---

## Raridades
| Raridade | Cor | Disponibilidade |
|----------|-----|----------------|
| Comum | `#8B949E` | Frequente |
| Incomum | `#3FB950` | Moderada |
| Rara | `#00B4FF` | Ocasional |
| Épica | `#7B5CFF` | Rara |
| Lendária | `#F0C040` | Muito rara |
| Ultimate | gradiente | Uma por evento |

---

## Exibição no Perfil
O perfil exibe **apenas 10 conquistas escolhidas** pelo usuário.
O Banco completo fica em seção separada.

---

## Arquitetura
Base atual: tabelas `titulos_def` e `usuario_titulos`.
Expansão v0.8.0-beta: campos `tipo`, `raridade`, `icone_url` em `titulos_def` + campo `conquistas_perfil` (JSON) em `usuarios`.

---
*v0.8.0-beta — Julho 2026*
