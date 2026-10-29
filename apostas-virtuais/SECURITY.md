# Política de Segurança — Evlurn

## Reportar uma Vulnerabilidade

Se você encontrou uma vulnerabilidade de segurança no projeto Evlurn, **não abra uma issue pública**.

Entre em contato diretamente com a equipe:
- Descreva a vulnerabilidade com detalhes suficientes para reprodução
- Aguarde resposta em até 72 horas
- Não divulgue publicamente antes de uma correção ser aplicada

## Versões com Suporte

| Versão | Suporte de Segurança |
|--------|---------------------|
| 0.8.0-beta | ✅ Ativa |
| < 0.8.0 | ❌ Sem suporte |

## Práticas de Segurança do Projeto

### Credenciais
- Nenhuma credencial real pode estar em código ou documentação pública
- Senhas de produção são gerenciadas via variáveis de ambiente
- O arquivo `.env` nunca é commitado (listado no `.gitignore`)
- Consulte `.env.example` para a lista de variáveis necessárias

### Autenticação
- Senhas armazenadas com `crypto.scrypt` nativo (Node.js) — sem bcrypt externo
- Sessões por token de 32 bytes gerado com `crypto.randomBytes`
- Cookie com flags `HttpOnly`, `SameSite=Strict` e `Secure` (em produção)
- Rate limiting de 10 tentativas por 15 minutos na rota de login

### Headers HTTP
Todas as respostas incluem:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` restrita ao próprio domínio + Google Fonts
- `Permissions-Policy` desabilitando geolocalização, microfone e câmera

### Banco de Dados
- SQLite em arquivo local — nunca exposto via rede
- Em produção: armazenado em volume persistente privado (Railway)
- Caminho configurado via `DATABASE_DIR` (variável de ambiente)
- Foreign keys habilitadas (`PRAGMA foreign_keys = ON`)
- WAL mode habilitado para integridade em escritas concorrentes

### Rotas Administrativas
- Todas as rotas `/api/admin/*` verificam `exigirAdmin()` antes de executar
- Admin é identificado pelo campo `admin = 1` na tabela `usuarios`
- Logs de auditoria registram IP, usuário e ação em todas as operações admin

### LGPD
- Dados pessoais (nome, data de nascimento, identidade de gênero) são opcionais
- Exclusão de conta anonimiza dados pessoais (`[conta excluída]`)
- Dados de apostas são mantidos anonimizados para integridade do sistema

## Auditoria de Segurança

Uma auditoria de segurança faz parte do processo oficial de Release da Evlurn.

Toda nova versão major deve ser precedida por revisão de:
- Credenciais e segredos expostos
- Headers de segurança HTTP
- Proteção das rotas administrativas
- Completude do `.gitignore`
- Informações sensíveis em documentação pública

---

*Política estabelecida em: v0.8.0-beta — Julho 2026*
