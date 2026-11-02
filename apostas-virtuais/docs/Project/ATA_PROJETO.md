# ATA do Projeto — Evlurn
**Resumo Executivo | v0.8.0-beta**

> Documento histórico e de referência rápida. Para documentação completa, consulte as respectivas pastas em `docs/`.

---

## Identidade
- **Nome:** Evlurn
- **Domínio:** evlurn.app
- **Tagline:** Learn · Earn · Evolve
- **Versão atual:** v0.8.0-beta — *Intelligence Update*

## Stack
Node.js 22.5+ nativo | SQLite (WAL) | HTML/CSS/JS puro | PWA | Zero dependências npm

## Acesso Admin
- **Apelido:** admin
- **Senha:** definida via variável de ambiente `ADMIN_PASSWORD` (nunca em texto claro em documentos públicos)

## Deploy Railway
- Volume: `/data` | Variáveis: consulte `.env.example`
- Start: `node --no-warnings server.js`
- Health check: `/login.html`

## Histórico de Versões
| Versão | Codinome | Foco |
|--------|----------|------|
| v0.1.0 | Genesis | Base, autenticação, 4 jogos |
| v0.2.0 | Social Engine | Scheduler, ranking |
| v0.3.0 | Data Layer | Schema, LGPD |
| v0.4.0 | PWA Launch | Progressive Web App |
| v0.5.0 | Economy v1 | Multiplicadores, patentes |
| v0.6.x | MVP Fix | Consolidação técnica |
| v0.7.0-beta | Foundation Update | Organização estrutural |
| v0.8.0-beta | Intelligence Update | Identidade cognitiva |

## Próxima Versão
v0.9.0-beta — *Stability Update* — Deploy público, beta ampliado, monetização.

## Documentação Completa
- Filosofia: `docs/Bible/`
- Arquitetura: `docs/Architecture/`
- Design: `docs/Design/`
- Economia: `docs/Economy/`
- Editorial: `docs/Editorial/`
- Jogos: `docs/GameDesign/`
- Projeto: `docs/Project/`

---
*v0.8.0-beta — Julho 2026*
