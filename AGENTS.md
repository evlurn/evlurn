# Evlurn — instruções para agentes

## Escopo e fonte de verdade
- Aplicação em `apostas-virtuais/`; executar comandos nessa pasta quando indicado.
- Recuperação v0.8.2-beta baseada no ZIP de agosto de 2026. Ler `apostas-virtuais/docs/Project/CODEX_TRANSITION.md` antes de alterar o produto.
- Consultar `docs/Project/HANDOFF.md`, Bible e Architecture dentro da aplicação, mas conferir alegações contra o código. O handoff contém divergências documentadas na auditoria.
- Manter alterações em branch de trabalho. Não sobrescrever main, fazer force-push, merge ou deploy sem instrução explícita do usuário. Confirmar gatilhos de deploy antes de publicar alterações remotas.

## Arquitetura
- Node.js, HTTP nativo, SQLite nativo e HTML/CSS/JavaScript sem framework. Não adicionar dependências sem necessidade e decisão arquitetural registrada.
- Não renomear tabelas, slugs ou alterar economia sem migração e análise de compatibilidade.
- Preservar home pública, dashboard após login e acesso às páginas institucionais.
- Sessões estão no SQLite (`src/sessions.js`), apesar do handoff dizer que ficam em memória.

## Segurança e dados
- Nunca publicar valores de senhas, cookies, tokens, arquivos .env reais ou bancos de dados. .env.example é somente modelo.
- Nunca executar testes sobre banco real. Usar cópia isolada e senha efêmera, com servidor limitado a 127.0.0.1.
- O código recuperado ainda possui fallback de senha administrativa em produção e ignora DATABASE_DIR. Não considerar pronto para produção.
- ADMIN_PASSWORD inicializa banco vazio; mudar a variável não troca senha de administrador existente. Planejar rotação explícita e invalidação de sessões.
- Manter backups fora do repositório e verificar integridade antes de migrações.

## Verificação e revisão
- Executar da raiz: `node scripts/audit-recovery.cjs`. Os testes usam `.audit-work/`, ignorada pelo Git, e geram relatório sem credenciais.
- A auditoria caracteriza vulnerabilidades existentes; checks funcionais passando não significam segurança aprovada. Examinar também `findings` no JSON.
- A entrega original não tem npm test nem suíte automatizada. Adicionar testes de regressão para correções de autenticação, persistência e autorização.
- Antes de PR: revisar diff, segredos, arquivos ignorados, compatibilidade de dados, resultados de testes e limitações. PR inicial deve permanecer em rascunho até os bloqueios serem tratados.
- Não declarar jogos, responsividade, migração de dados reais ou segurança integral validados por testes de fumaça.
