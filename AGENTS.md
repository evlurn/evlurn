# Evlurn — instruções para agentes

## Continuidade em 01/11/2026
- Ler `apostas-virtuais/docs/Project/AUDIT_2026_11_01.md` e `SPRINT_04.md` na mesma pasta antes de iniciar a sprint.
- Evlurn é uma plataforma de entretenimento, conhecimento e desenvolvimento. Jogos integram a experiência; não definem toda a identidade.
- Classificar funcionalidades como implementadas, parciais ou planejadas com evidência de código e fluxo testável. Schema, seed e elementos visuais não comprovam implementação.
- A entrega local 0.8.3 foi preservada sobre a recuperação 0.8.2; não retroceder para o ZIP ao continuar o desenvolvimento.

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
- A versão 0.8.3 remove fallback, exige credenciais fortes no bootstrap e respeita DATABASE_DIR. Consulte IMPLEMENTATION_083.md para validações e pendências; não considerar auditoria integral concluída.
- ADMIN_PASSWORD inicializa banco vazio; mudar a variável não troca senha de administrador existente. Planejar rotação explícita e invalidação de sessões.
- Manter backups fora do repositório e verificar integridade antes de migrações.

## Verificação e revisão
- Executar da raiz: `node scripts/audit-recovery.cjs`, ou npm test na aplicação. Os testes usam `.audit-work/`, ignorada pelo Git.
- O relatório de transição preserva a auditoria histórica. A suíte atual exige o comportamento corrigido. Não confundir testes passando com auditoria integral.
- A entrega original não tem npm test nem suíte automatizada. Adicionar testes de regressão para correções de autenticação, persistência e autorização.
- Antes de PR: revisar diff, segredos, arquivos ignorados, compatibilidade de dados, resultados de testes e limitações. PR inicial deve permanecer em rascunho até os bloqueios serem tratados.
- Não declarar jogos, responsividade, migração de dados reais ou segurança integral validados por testes de fumaça.
