# Decisions — Evlurn

> Log de decisões arquiteturais relevantes. Cada entrada registra o contexto, a decisão tomada, o motivo, a vantagem obtida e o impacto para o futuro.

---

## DEC-001 — Zero dependências npm em produção

**Data:** Junho 2026
**Status:** Ativo

**Contexto:** ao iniciar o projeto, a escolha padrão seria usar Express, Prisma, bcrypt e outras libs comuns.

**Decisão:** usar exclusivamente APIs nativas do Node.js 22.5+: `node:http`, `node:sqlite`, `node:crypto`, `node:fs`, `node:path`.

**Motivo:** o ambiente de desenvolvimento não permitia `npm install`. Isso forçou a construção de um roteador HTTP próprio (`src/http.js`) e uso do SQLite nativo.

**Vantagem:** deploy sem `npm install`, sem vulnerabilidades de supply chain, bundle zero, inicialização instantânea, sem breaking changes de dependências externas.

**Impacto futuro:** qualquer desenvolvedor que entre no projeto não precisa conhecer nenhuma biblioteca específica — só Node.js. A desvantagem é que funcionalidades que libs fariam em 1 linha exigem implementação manual.

---

## DEC-002 — SQLite como banco de dados principal

**Data:** Junho 2026
**Status:** Ativo

**Contexto:** a escolha padrão para um projeto web seria PostgreSQL ou MySQL.

**Decisão:** SQLite com WAL mode via `node:sqlite` (nativo no Node 22.5+).

**Motivo:** zero configuração de servidor de banco, backup é copiar um arquivo, deploy no Railway usa volume persistente para o arquivo `.sqlite`.

**Vantagem:** simplicidade operacional extrema. Para beta com centenas de usuários, SQLite é mais do que suficiente.

**Impacto futuro:** quando o projeto atingir ~5.000 usuários simultâneos com escritas intensas, a serialização de escritas do SQLite se tornará gargalo. A migração para PostgreSQL exige reescrever apenas `src/db.js` — o restante do código não muda. Documentar essa migração antes que seja urgente.

---

## DEC-003 — Sessões em memória (objeto JS)

**Data:** Junho 2026
**Status:** Ativo — revisar antes de 1.000 usuários

**Contexto:** sessões poderiam ser armazenadas no SQLite ou em Redis.

**Decisão:** armazenar sessões em um objeto JavaScript no processo Node.js.

**Motivo:** zero overhead de banco para operações de autenticação. Verificar sessão é O(1) em memória.

**Vantagem:** autenticação extremamente rápida.

**Impacto futuro:** ao reiniciar o servidor, todas as sessões ativas são perdidas — usuários precisam fazer login novamente. Com múltiplos processos Node (cluster), sessões não são compartilhadas entre workers. Quando necessário: migrar para tabela `sessoes` no SQLite ou Redis.

---

## DEC-004 — Jogos individuais com rotas dedicadas

**Data:** Junho 2026
**Status:** Ativo

**Contexto:** inicialmente todos os jogos usavam o sistema de rodadas compartilhadas.

**Decisão:** separar Joga a Moeda, Cofre Misterioso e Tudo ou Nada em rotas próprias (`jogamoeda.js`, `cofre.js`, `tudoounada.js`) com resultado instantâneo.

**Motivo:** esses jogos são individuais e instantâneos — forçá-los no sistema de rodadas criava latência e complexidade desnecessárias.

**Vantagem:** experiência mais fluida para o jogador, código mais limpo e isolado por responsabilidade.

**Impacto futuro:** ao adicionar novos jogos, o padrão está estabelecido: jogos sociais/coletivos usam o sistema de rodadas; jogos individuais ganham rota própria.

---

## DEC-005 — Tipo 'escolha' vs 'compartilhado' nos jogos

**Data:** Julho 2026
**Status:** Ativo — histórico de bug corrigido

**Contexto:** durante refator da arquitetura de Mundos, o tipo da Roleta Primária foi alterado de `'escolha'` para `'rodada'` acidentalmente.

**Bug gerado:** o serviço `rodadas.js` só verificava `jogo.tipo === 'escolha'` para comparar a escolha do jogador com o resultado. Com tipo `'rodada'`, caía no fallback que concedia ganho a todos.

**Correção:** tipo voltou para `'escolha'`. A propriedade `usaRodadas: true` foi adicionada para indicar que o jogo usa o scheduler, sem alterar a lógica de resolução.

**Impacto futuro:** ao adicionar novos jogos, documentar claramente o tipo e a lógica de resolução. Considerar um teste automatizado para esse fluxo.

---

## DEC-006 — SPA com hash routing

**Data:** Julho 2026
**Status:** Ativo

**Contexto:** a navegação entre Mundos poderia usar páginas HTML separadas ou um framework de roteamento.

**Decisão:** SPA (Single Page Application) com hash routing — `app.html#arena`, `app.html#academia`, etc.

**Motivo:** sem backend para servir rotas específicas de Mundos, e sem React/Vue. O hash não causa reload da página e é gerenciado inteiramente pelo `app.js`.

**Vantagem:** navegação instantânea entre Mundos, zero requisições ao servidor para trocar de seção, funciona offline via Service Worker.

**Impacto futuro:** URLs com hash não são indexáveis por motores de busca (SEO). Quando SEO for relevante, migrar para um servidor que sirva rotas específicas ou usar History API com fallback.

---

## DEC-007 — Campos demográficos opcionais no cadastro

**Data:** Julho 2026
**Status:** Ativo

**Contexto:** demanda por coleta de indicadores de diversidade (faixa etária, identidade de gênero).

**Decisão:** campos `data_nascimento`, `identidade_genero` e `identidade_genero_outro` adicionados como opcionais, com aviso explícito de LGPD no formulário.

**Motivo:** dados demográficos têm valor para análise de audiência e inclusão. A opcionalidade respeita a autonomia do usuário.

**Impacto futuro:** qualquer uso desses dados para segmentação ou exibição pública exige revisão da Política de Privacidade e possivelmente consentimento explícito adicional.

---

## DEC-008 — Paleta azul/roxo (substituindo verde)

**Data:** Julho 2026
**Status:** Ativo

**Contexto:** a paleta original usava verde `#1FAE63` como cor primária, típica de plataformas financeiras e de apostas.

**Decisão:** migrar para azul `#00B4FF` + roxo `#7B5CFF` seguindo a identidade visual oficial do brand Evlurn.

**Motivo:** o verde carregava conotação de dinheiro/apostas incompatível com a nova filosofia. Azul/roxo transmite tecnologia, progressão e comunidade.

**Impacto futuro:** aliases CSS (`--verde`, `--azul`) foram mantidos por compatibilidade com código existente, mas agora apontam para as novas cores. Futura refatoração pode renomear as variáveis para `--primario` e `--secundario`.

---

*Última atualização: Julho 2026*

---

## DEC-009 — Reposicionamento como plataforma de desenvolvimento cognitivo

**Data:** Julho 2026
**Status:** Ativo — em implementação a partir de v0.8.0-beta

**Contexto:** a Evlurn foi construída inicialmente como uma plataforma de entretenimento com jogos de sorte. A identidade de "apostas virtuais" persistiu mesmo após o rebranding para Evlurn.

**Decisão:** reposicionar a plataforma como **entretenimento inteligente voltado ao desenvolvimento cognitivo**. Os jogos de sorte continuam como uma das categorias, mas não como identidade da plataforma.

**Motivo:** a pergunta "o que diferencia a Evlurn de qualquer outra plataforma de entretenimento gamificado?" não tinha resposta satisfatória enquanto a identidade fosse baseada em jogos de sorte. Qualquer plataforma pode ter slots e roletas. Nenhuma plataforma popular combina desenvolvimento cognitivo real com gamificação leve e entretenimento casual.

**Vantagem:** diferenciação real de mercado, propósito mais nobre e comunicável, alinhamento com tendências de wellness digital e edtech gamificada, e potencial de parcerias com instituições educacionais no futuro.

**Impacto futuro:** novos jogos devem ter uma habilidade cognitiva explicitamente associada. O Banco de Conquistas deve refletir desenvolvimento, não apenas marcos de jogo. A Academia passa de "em construção" para pilar central da v1.0.

---

## DEC-010 — Padronização de versionamento com codinomes

**Data:** Julho 2026
**Status:** Ativo

**Contexto:** as versões anteriores (v0.1 a v0.6) foram nomeadas informalmente sem convenção de codinome.

**Decisão:** adotar codinomes descritivos para cada versão, registrados no `CHANGELOG.md` e no `Roadmap.md`.

**Codinomes estabelecidos:**
- v0.1.0 — *Genesis*
- v0.2.0 — *Social Engine*
- v0.3.0 — *Data Layer*
- v0.4.0 — *PWA Launch*
- v0.5.0 — *Economy v1*
- v0.6.x — *MVP Fix*
- v0.7.0-beta — *Foundation Update*
- v0.8.0-beta — *Intelligence Update*
- v0.9.0-beta — *Stability Update*
- v1.0.0 — *Launch*

**Motivo:** codinomes facilitam comunicação entre os membros da equipe (João, Claude, ChatGPT), especialmente em conversas longas onde "a versão de julho" é ambíguo mas "Foundation Update" é imediatamente reconhecível.

**Impacto futuro:** manter a convenção `[objetivo principal] + Update/Launch/Fix` para facilitar onboarding de novos colaboradores.

---

*Última atualização: v0.7.0-beta — Foundation Update — Julho 2026*
