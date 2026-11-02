# Backlog — Evlurn
### Versão 0.7.0-beta | Atualizado em: Julho 2026

> Lista centralizada de pendências organizadas por prioridade e versão alvo. Atualizar ao início e ao fim de cada sessão de desenvolvimento.

---

## 🔴 Alta Prioridade — v0.8.0-beta (Intelligence Update)

| ID | Item | Detalhe | Versão alvo |
|----|------|---------|-------------|
| P01 | Nova filosofia na interface | Comunicar o reposicionamento cognitivo na tela de login, onboarding e Arena | v0.8.0-beta |
| P02 | Arena por categorias | Reorganizar cards de jogos com categoria (Sorte, Lógica, Matemática...) | v0.8.0-beta |
| P03 | Primeiro jogo cognitivo | Implementar pelo menos 1 jogo de lógica/raciocínio jogável | v0.8.0-beta |
| P04 | Banco de Conquistas básico | Coleção com as 7 raridades, conquistas por desenvolvimento, exibição no perfil | v0.8.0-beta |
| P05 | XP e Nível funcionais | Conceder XP em cada ação, barra de nível funcional no header | v0.8.0-beta |
| P06 | Streak de login end-to-end | Verificar data ao logar, incrementar/resetar streak, missão diária acionada | v0.8.0-beta |
| P07 | Front-end de missões | Barra de progresso, botão de reivindicar, reset diário/semanal | v0.8.0-beta |
| P08 | Front-end de títulos | Exibir no perfil, notificação ao conquistar, escolher título ativo | v0.8.0-beta |

---

## 🟡 Média Prioridade — v0.9.0-beta (Stability Update)

| ID | Item | Detalhe | Versão alvo |
|----|------|---------|-------------|
| P09 | Deploy Railway | Volume `/data` + variável `DATABASE_DIR=/data` + domínio `evlurn.app` apontado | v0.9.0-beta |
| P10 | Limpeza de sessões | Job periódico (a cada hora) removendo sessões expiradas da memória | v0.9.0-beta |
| P11 | Redirect pós-cadastro | Após cadastro, redirecionar para `/login.html?novo=1` com mensagem de confirmação | v0.9.0-beta |
| P12 | Ranking público sem login | Página `/ranking` acessível sem autenticação para viralidade | v0.9.0-beta |
| P13 | Broadcast evento raro | Notificação em tempo real para todos online quando alguém acerta o Preto | v0.9.0-beta |
| P14 | Card compartilhável | Imagem gerada ao conquistar título para compartilhar no WhatsApp | v0.9.0-beta |
| P15 | Analytics básico | DAU, MAU, taxa de retenção — pode ser um painel simples no admin | v0.9.0-beta |
| P16 | Política de Privacidade | Exigida para AdSense e abertura pública | v0.9.0-beta |
| P17 | Termos de Uso | Exigidos para AdSense e abertura pública | v0.9.0-beta |

---

## 🟢 Baixa Prioridade — v1.0.0 (Launch)

| ID | Item | Detalhe | Versão alvo |
|----|------|---------|-------------|
| P18 | Vídeos recompensados | Backend pronto. Aguarda conta ativa em Adinplay/Monetag | v1.0.0 |
| P19 | Banners AdSense | Slots HTML prontos. Aguarda publisher ID e aprovação | v1.0.0 |
| P20 | Perfil público por URL | `/perfil/apelido` compartilhável com títulos, nível e ranking | v1.0.0 |
| P21 | Rankings múltiplos | Mais Ativo, Maior Consistência, Maior Coleção | v1.0.0 |
| P22 | Indicação escalonada | 1 indicado = 200 EVC / 3+ = 300 cada / 5+ = 500 cada | v1.0.0 |
| P23 | Sistema de amigos | Buscar, adicionar, ver perfil público de amigos | v1.0.0 |

---

## 💡 Ideias em Estudo (sem versão definida)

| Item | Conceito | Viabilidade |
|------|---------|-------------|
| Bot Telegram | Notificação de rodada aberta e resultado sorteado | Alta |
| Temporadas | Reset mensal de ranking com premiação simbólica para top 3 | Média |
| Desafios P2P | Jogador desafia outro diretamente no Tudo ou Nada | Média |
| Push Notifications | Web Push API — "nova rodada disponível" | Média |
| Evento semanal auto | Todo domingo, multiplicador configurável ativado automaticamente | Alta |
| Mapa de habilidades | Visualização no perfil das categorias cognitivas mais exploradas | Alta |
| Parcerias locais | Cupons de estabelecimentos (depende de análise jurídica) | Baixa |
| Conquistas 3D | Banco de Conquistas com renderização 3D das moedas | Baixa |
| Loja de itens | Cosméticos compráveis com EVC (avatares, bordas) | Média |
| Torneios cognitivos | Competição por categoria de habilidade com ranking próprio | Alta |

---

## ✅ Concluídas

| ID | Item | Versão |
|----|------|--------|
| — | Autenticação completa (login, sessão, scrypt) | v0.1.0 |
| — | 4 jogos funcionais com sistema de rodadas | v0.1.0 |
| — | Painel admin (usuários, rodadas, logs, eventos) | v0.2.0 |
| — | Scheduler automático de rodadas | v0.2.0 |
| — | Schema expandido (títulos, missões, vídeos, sugestões) | v0.3.0 |
| — | PWA instalável (manifest, SW, ícones, banner) | v0.4.0 |
| — | Sistema de multiplicadores (nível + patente + títulos + eventos) | v0.5.0 |
| — | 10 patentes: Visitante → Mestre da Fortuna | v0.5.0 |
| — | Tudo ou Nada com odds por ranking | v0.5.0 |
| — | Rebalanceamento econômico (house edge ~6–7%) | v0.5.0 |
| — | Identidade visual Evlurn (paleta, tipografia, ícone, tagline) | v0.6.0 |
| — | Arquitetura de Mundos com header persistente | v0.6.0 |
| — | Animação de suspense nos jogos instantâneos | v0.6.0 |
| — | Botão de sugestão flutuante + rota | v0.6.0 |
| — | Notificações com badge no header | v0.6.0 |
| — | Login diário com streak e bônus | v0.6.0 |
| — | Trivia diária com recompensa | v0.6.0 |
| — | Configurações de conta (senha, perfil, exclusão LGPD) | v0.6.0 |
| — | Edição de perfil por usuário e por admin | v0.6.0 |
| — | Campos demográficos no cadastro (LGPD) | v0.6.0 |
| — | Conteúdo de demonstração nos Mundos | v0.6.0 |
| — | Correção bug Roleta Primária (todos ganhavam) | v0.6.0 |
| — | Histórico de apostas unificado para todos os jogos | v0.6.0 |
| — | Confirmação de saída com modal | v0.6.0 |
| — | Estrutura de documentação em `docs/` | v0.7.0-beta |
| — | Estrutura de assets em `assets/` | v0.7.0-beta |
| — | Estrutura de database em `database/` | v0.7.0-beta |
| — | Storytelling completo na Evlurn Bible | v0.7.0-beta |
| — | Roadmap com codinomes e histórico completo | v0.7.0-beta |
| — | CHANGELOG com todas as versões documentadas | v0.7.0-beta |
| — | Direção cognitiva documentada no Game Design | v0.7.0-beta |

---

*Última atualização: v0.7.0-beta — Foundation Update — Julho 2026*
