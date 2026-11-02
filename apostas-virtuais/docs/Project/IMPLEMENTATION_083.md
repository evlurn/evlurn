# Evlurn 0.8.3-beta — implementação para revisão

29/10/2026. Branch local: `improvement/security-identity`, derivada da recuperação 0.8.2. Sem push, merge ou deploy.

## Como visualizar agora

Na raiz do repositório, execute `node scripts/preview.cjs` ou abra `ABRIR-PREVIA.cmd` no Windows. Requer Node 24+. Abra http://127.0.0.1:4173/preview. A conta visitante é criada automaticamente em banco descartável; não precisa digitar senha. Mantenha o processo aberto e encerre com Ctrl+C. Cada inicialização cria um novo banco, sem reutilizar dados reais. A porta 4173 precisa estar livre.

A prévia usa as páginas e APIs reais desta versão, com uma entrada automática exclusiva do script local. Não é imagem nem protótipo estático. O comando de produção continua `npm start` dentro de apostas-virtuais; ele não possui essa entrada automática. Nunca implantar scripts/preview.cjs em um host.

## Implementado

- Bootstrap administrativo sem senha padrão; mínimo de 12 caracteres. Em produção, a configuração é exigida e a credencial legada conhecida é bloqueada também em banco existente.
- DATABASE_DIR respeitada; sessão persistida no SQLite e invalidada quando a conta deixa de estar ativa.
- IP real do socket por padrão; proxies só são confiáveis se listados explicitamente em TRUSTED_PROXY_IPS. A cadeia é examinada da direita para a esquerda até o primeiro salto não confiável.
- Proteção de caminho estático por fronteira de diretório e caminho real; bloqueio de diretórios irmãos e symlinks externos.
- Troca de senha revoga todas as sessões da conta. Script administrativo de rotação separado, sem imprimir credenciais.
- Trivia valida questão do dia e alternativa, limita recompensa diária e grava saldo/histórico em transação. O dia segue UTC nesta versão; avaliar calendário America/Fortaleza antes do beta público.
- Dados pessoais interpolados nos templates de perfil, administração e cadastro passam por escape HTML nos pontos revisados. Isto não substitui auditoria completa de XSS.
- Node 24+, carregamento explícito de .env em npm start/dev, bind local por padrão e respostas de API sem cache.
- Ícones SVG próprios no menu, controle compacto/expandido com preferência salva, indicação da página atual, foco visível, zoom permitido e textos secundários mais legíveis.
- Início prioriza conhecimento; saldo deixa de dominar a página. Conhecimento passa a estar na navegação mobile.
- Catálogo pesquisável com três textos introdutórios originais e tela de leitura com pergunta/reflexão. Conteúdo inicial para revisão editorial, sem alegação de validação pedagógica.
- Remoção dos emojis estáticos nas páginas e controles revisados, incluindo administração; títulos de áreas atualizados. Cache PWA versionado para distribuir os novos assets.

## Decisões históricas aplicadas

Fontes revisadas: HANDOFF, CHANGELOG da série 0.8, decisões arquiteturais, manifesto, visão, documentos de marca/design e as mensagens disponíveis nesta conversa. Não foi presumido acesso a conversas antigas que não constam desses materiais.

Mantidos: nome Evlurn, paleta azul/violeta, home pública, navegação por função, jogos como parte da experiência, páginas institucionais e ausência de dinheiro real. Alteração mais recente solicitada pelo fundador substitui a sidebar sempre expandida de 0.8.2 por controle explícito compacto/expandido.

Inspirações Caveira/Google traduzidas em navegação, consistência de ícones e descoberta por assuntos. Não foram copiadas marcas, capas ou conteúdo das referências. Conquistas completas, streak por atividade e progressão foram discutidos, mas continuam pendentes; não foram simulados como funcionalidades prontas.

## Validação

Suíte: `npm test` dentro de apostas-virtuais ou `node scripts/audit-recovery.cjs` na raiz. Quinze testes aprovados no Node 24.20.0/Windows: bootstrap, diretório persistente, proteção de arquivos, anonimato, aprovação, separação admin/membro, recompensa única, reinício, revogação, proxy, cookie Secure, credencial legada e contas excluídas.

Verificação real em navegador Edge: desktop 1440 px e mobile 390 px; menu, filtro de catálogo, abertura/retorno de leitura, expansão da explicação e navegação mobile. Nenhum erro de JavaScript nem excesso horizontal nos fluxos verificados. Capturas salvas junto ao relatório de entrega. Não é certificação de acessibilidade.

## Configuração fora da prévia

1. Copiar .env.example para .env dentro de apostas-virtuais e definir ADMIN_PASSWORD longa e exclusiva. Não colocar esse arquivo no Git.
2. Definir DATABASE_DIR com caminho persistente. Em host, usar HOST=0.0.0.0 e NODE_ENV=production; no computador manter HOST=127.0.0.1.
3. Usar npm start. Não há dependências npm a instalar. Não confiar em cabeçalhos de proxy sem conhecer a topologia e os IPs efetivos.
4. Para rotacionar administrador existente: parar o servidor, fazer backup verificado, definir DATABASE_DIR e NEW_ADMIN_PASSWORD no ambiente e executar `node scripts/rotate-admin.cjs` da raiz. ADMIN_USERNAME é opcional; padrão admin. Remover NEW_ADMIN_PASSWORD do ambiente após executar. O script altera somente a senha escolhida e revoga suas sessões.

## Próximos passos e limites

Antes do beta público: revisar o conteúdo com o fundador, implementar progresso real das leituras e regras de XP/streak, concluir missões/conquistas, testar quatro jogos end-to-end e atualização de banco legado, verificar recuperação de backup, revisar limites de requisição/abuso, política de privacidade e termos. O rate limit continua em memória; não é uma solução distribuída. Configuração de CSP ainda permite scripts inline por compatibilidade e merece endurecimento posterior.

Esta entrega corrige os problemas identificados e permite avaliar o produto no computador; não equivale a uma auditoria integral ou autorização de lançamento. Nenhum banco de usuário real foi alterado.

## Ferramenta e hospedagem

Continuar nesta cópia do projeto no Codex evita outra migração agora. Cursor pode ser usado como editor da mesma pasta no futuro, sem exigir conversão da aplicação. Referência oficial sobre projetos locais: https://learn.chatgpt.com/docs/projects .

Para um primeiro beta de instância única, Railway continua sendo uma opção compatível com SQLite em volume persistente. A documentação oferece backup/restauração de volumes, incluindo SQLite: https://docs.railway.com/volumes e https://docs.railway.com/volumes/backups . Render é alternativa com disco persistente em serviço pago: https://render.com/docs/disks . A escolha final depende de custo atual, região, política de backup e topologia de proxy. Não foi contratado serviço nem estimado preço sem orçamento.

Não há motivo técnico identificado para migrar de host agora. Recomenda-se validar localmente, depois preparar homologação em instância única com volume e restauração testada. Só contratar após definir orçamento e revisar a configuração concreta. Não usar um filesystem efêmero para o banco SQLite.
