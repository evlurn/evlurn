# Transição da Evlurn para Codex

## Proveniência e recuperação

Auditoria iniciada em 28/10/2026 (America/Fortaleza). Fonte: anexo `evlurn(8).zip`, entrega atribuída pelo usuário a 27/08/2026, e cópia idêntica `Downloads/evlurn.zip`. O conteúdo confirma v0.8.2-beta; a data atribuída não foi verificada independentemente.

SHA-256 dos dois ZIPs: `10337b1a59a1f06c2eaf907edcd2e1e0115cda8b1589daa8b80453de7ecb1a63`.

GitHub consultado por clone autenticado: https://github.com/evlurn/evlurn. A main encontrada aponta para `6c45abd2d0596406148ee5b200d443656b08af37`, commit de 08/07/2026. Branch local criada: `recovery/claude-v0.8.2-beta`.

O commit de recuperação `9baf8f0` preserva a entrega do ZIP na pasta histórica `apostas-virtuais/`: 92 arquivos, 47 adicionados, 15 modificados e 30 inalterados, nenhuma exclusão em relação ao GitHub. O diff soma 6.536 linhas adicionadas e 898 removidas. Home pública, páginas institucionais, navegação e documentação concentram a atualização.

Os ZIPs originais e um bundle completo do GitHub foram preservados fora do repositório. O bundle original passou em `git bundle verify`. A recuperação e a documentação ficam em commits distintos. Não houve push, PR remoto, merge ou deploy. Antes de push, verificar integrações Railway e gatilhos automáticos para preservar a instrução de não fazer deploy.

## Auditoria e bloqueios

| Prioridade | Evidência | Consequência / ação necessária |
|---|---|---|
| Alta | `src/db.js`, seed administrativo: sem ADMIN_PASSWORD, produção inicia e login com fallback é aceito; reproduzido em banco descartável. | Remover fallback de produção e falhar antes da criação da conta. Testar produção, Railway, variável vazia e banco existente. Não registrar o valor da senha. |
| Alta | `src/db.js`, DATA_DIR fixo; DATABASE_DIR é ignorada, confirmado em execução. | Implementar diretório configurável e testes de reinício/persistência antes de qualquer deploy. |
| Alta | `src/middleware.js` confia incondicionalmente em x-forwarded-for. Após bloqueio, trocar o cabeçalho resulta em 401 em vez de 429. | Configurar confiança no proxy e ignorar cabeçalho em acesso direto. A exposição atrás de proxy depende da configuração dele. |
| Média | ADMIN_PASSWORD só participa do seed quando não há usuários. | Alterar variável não rotaciona senha existente; planejar procedimento próprio e revogação de sessões. Nenhum banco real foi inspecionado. |
| Média | `src/sessions.js` persiste sessões em tabela SQLite. | Corrigir handoff: reinício não implica logout por perda de memória. |
| Média | `src/http.js` usa comparação startsWith de caminho sem fronteira de diretório. | Revisar proteção contra travessia para diretórios irmãos com prefixo igual; análise estática, sem exploração nesta rodada. |
| Média | Scripts start/dev não carregam .env; não há dotenv. | Documentar injeção de variáveis ou uso explícito do suporte do Node a env-file. Copiar .env.example sozinho não configura o processo. |

Não foram aplicadas correções de produto nesta fase: o commit recuperado permanece rastreável ao ZIP. Os problemas acima bloqueiam promoção para produção e devem ser resolvidos antes do merge proposto.

## Dependências e testes

`package.json` contém zero dependências npm e somente scripts start/dev; não há test nem lockfile na entrega. Imports do backend usam módulos locais e nativos. O frontend referencia Google Fonts pela política de conteúdo; zero dependências npm não significa ausência de recursos externos. Não foi realizada consulta a banco de CVEs nem certificação de segurança do runtime.

Executado com Node v24.20.0 em Windows, sem instalação de pacotes. O mínimo declarado >=22.5.0 não foi testado. SQLite é nativo e sua disponibilidade deve ser validada no runtime escolhido.

Resultados: **42 checks aprovados**: 27 arquivos JavaScript com sintaxe válida e 15 checks HTTP/autenticação. Incluem cinco páginas públicas; rejeição de anônimo em /auth/me e painel admin; login com senha configurada; cookies HttpOnly/SameSite e Secure em produção; painel autenticado; cadastro; bloqueio de conta pendente; logout; limitação de login. **Três achados de segurança/configuração reproduzidos**, separados dos checks aprovados.

A execução ocorreu em cópias isoladas, bancos novos, senha aleatória mantida apenas no processo e servidor vinculado a 127.0.0.1 em porta aleatória. Os processos foram encerrados. O teste em modo production também foi somente local.

Varredura de nomes de arquivos sensíveis e padrões comuns de tokens/chaves: nenhum .env real, banco, chave privada ou token dos padrões procurados encontrado no ZIP. Isso não prova ausência de todo tipo de segredo. Credencial padrão embutida identificada, sem reproduzir seu valor neste relatório.

Não validados: interface em navegador/mobile, partidas completas dos quatro jogos, economia, XP/missões, migração sobre banco antigo real, carga/concorrência, configuração de infraestrutura ou segurança integral. Não existia uma suíte original para executar.

## Plano de PR

Título proposto: **Recupera entrega Evlurn v0.8.2-beta e documenta transição para Codex**.

Base: main. Head: recovery/claude-v0.8.2-beta. Estado inicial: rascunho.

1. Revisar commit de importação, proveniência e comparação com o ZIP.
2. Revisar AGENTS.md, auditoria e script reproduzível adicionados em commit separado.
3. Corrigir os bloqueios de bootstrap administrativo, persistência e confiança no proxy em commits independentes; adicionar testes de regressão que exijam o comportamento seguro.
4. Testar atualização de banco antigo descartável, autorização de usuário não administrador e sessão após bloqueio/rotação. Exercitar jogos e interface em desktop/mobile.
5. Atualizar documentação contraditória e verificar diff por segredos, bancos, backups e arquivos inesperados.
6. Conferir gatilhos Railway antes de publicar a branch. Abrir PR em rascunho após garantir ausência de deploy automático; apresentar diff e resultados ao usuário. Merge somente após revisão explícita.

Descrição sugerida: A main ainda contém a entrega de julho. Esta recuperação importa o ZIP v0.8.2-beta de agosto, preservando a estrutura existente, e adiciona instruções e auditoria para continuar no Codex. Os checks de fumaça passam, mas há bloqueios administrativos, de persistência e limitação de login documentados. Não está aprovado para merge ou produção.

Rollback de desenvolvimento: recuperar o bundle original em outra pasta; não fazer reset destrutivo de um checkout com trabalho em andamento. Nenhum banco de produção foi alterado.
