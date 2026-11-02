# Sprint 04 — base recuperada e progressão verificável

Plano atualizado em 01/11/2026. Base: 0.8.3-beta local, preservando o ZIP 0.8.2 e main histórica. Não confundir este plano com funcionalidades entregues.

## Ordem de execução e aceite

1. **Integridade e segurança:** revisar PR de recuperação, manter testes atuais verdes, testar migração de banco legado descartável e restauração de backup em outra pasta. Aceite: contas, saldos e histórico preservados; credencial legada bloqueada; sessões revogadas na rotação; evidências registradas. Nenhum banco real nos testes.
2. **Contrato de progressão:** definir eventos elegíveis, valores de XP/EVC, curva de nível e calendário America/Fortaleza em decisão arquitetural. Presença diária manual existente não deve ser confundida com streak por aprendizado. Aceite: regras únicas no servidor e exemplos de fronteira de dia; nenhuma alteração econômica silenciosa.
3. **Primeiro fluxo vertical:** leitura → pergunta → conclusão persistida → concessão única → XP/nível no perfil e dashboard. Corrigir resposta de presença diária que anuncia XP sem gravá-lo. Aceite: repetição, concorrência e reinício não duplicam prêmio; falha reverte todas as gravações; outro usuário não consegue conceder progresso em nome alheio.
4. **Missões e streak:** derivar progresso de atividades reais, incluir uma missão de conhecimento; resgate atômico e calendário centralizado. Aceite: mesmo dia, dia consecutivo, intervalo e virada local; missão concluída/resgatada persiste e não concede prêmio duas vezes.
5. **Títulos e conquistas:** implementar concessão por critérios verificáveis e escolha do título ativo pertencente à conta. Aceite: primeiro desbloqueio, repetição, ausência de requisito e seleção não autorizada testados.
6. **Regressão de produto:** executar os quatro jogos em banco descartável e conferir saldo/histórico, valores inválidos, autorização e repetição. Revisar home pública, login, Início, Conhecimento, missões e perfil em desktop/mobile; registrar evidências e limitações.
7. **Preparação de homologação:** somente após etapas anteriores, propor host, custo, Node compatível, volume SQLite, topologia de proxy e backup/restauração. Contratação, deploy e merge dependem de confirmação explícita. Prévia local não deve ser implantada como serviço.

## Definição de concluído

Cada item exige código, fluxo completo observável, teste de comportamento relevante e documentação atualizada. Schema, seeds, contadores fixos ou telas demonstrativas não bastam. A suíte de segurança deve continuar passando. Registrar o que permanece parcial e os riscos; não declarar lançamento aprovado por testes de fumaça.
