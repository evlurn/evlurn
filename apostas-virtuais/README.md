# Evlurn

Plataforma social de apostas fictícias com moeda virtual — sem dinheiro real, sem integração financeira. Feita para um grupo fechado de colegas, com cadastro mediado por aprovação de administrador.

## Como rodar

Requisito: **Node.js 22.5 ou mais recente** (o projeto usa o módulo nativo `node:sqlite`, ainda experimental no Node 22, mas estável o suficiente para este uso). Verifique sua versão com `node -v`.

```bash
cd apostas-virtuais
npm start
```

Isso inicia o servidor em `http://localhost:3000`. Não é necessário rodar `npm install` — o projeto não tem nenhuma dependência de terceiros (veja "Por que sem Express?" abaixo).

Acesse `http://localhost:3000/login.html` para entrar, ou `/register.html` para criar uma conta nova.

### Conta de administrador padrão

Na primeira execução, uma conta admin é criada automaticamente:

- **Apelido:** `admin`
- **Senha:** `admin123`

**Troque essa senha assim que possível.** Hoje não existe uma tela de "alterar minha própria senha" — para trocar, o jeito mais simples é o próprio admin se cadastrar como usuário comum com a senha desejada e promovê-lo a admin diretamente no banco (`UPDATE usuarios SET admin = 1 WHERE apelido = '...'`), ou pedir para eu adicionar essa tela, se for útil para você.

## Estrutura do projeto

```
apostas-virtuais/
├── server.js              # ponto de entrada HTTP
├── src/
│   ├── db.js               # schema SQLite + seed inicial
│   ├── games-config.js     # probabilidades e multiplicadores dos 4 jogos
│   ├── http.js              # mini-framework HTTP (roteador, estáticos)
│   ├── middleware.js        # autenticação / verificação de admin
│   ├── sessions.js          # sessões por token (cookie)
│   ├── routes/               # auth, player, games, admin
│   ├── services/rodadas.js   # abrir/encerrar rodada e resolver apostas
│   └── utils/                 # hash de senha, sorteio ponderado, logs
├── public/                  # front-end (HTML/CSS/JS puro, sem framework)
└── data/database.sqlite     # criado automaticamente na primeira execução
```

## Por que sem Express / bcrypt / sqlite3 (npm)?

O ambiente onde construí este projeto não tinha acesso à internet para `npm install`. Em vez de simular ou deixar pela metade, optei por usar **só módulos nativos do Node**:

- **Banco de dados:** `node:sqlite` (nativo desde o Node 22.5, ainda marcado como experimental pelo próprio Node, mas funcional e testado aqui).
- **Hash de senha:** `crypto.scrypt`, nativo, em vez de `bcrypt`.
- **Servidor HTTP:** um roteador minimalista escrito à mão (`src/http.js`) com uma API parecida com Express (`router.get`, `req.params`, `res.json`...), em vez do Express de verdade.

Vantagem real, e não só contorno de limitação: o projeto roda com `node server.js` sem **nenhum** `npm install`. Se você preferir migrar para Express/bcrypt/melhor-sqlite3 no seu ambiente (que tem internet), a estrutura de rotas foi pensada para isso ser uma adaptação direta — me peça se quiser que eu já entregue essa versão.

## Decisões de design que assumi (a especificação não deixava 100% explícito)

Sendo direto sobre onde interpretei algo em vez de só seguir o texto ao pé da letra:

1. **Escolha individual vs. resultado compartilhado.** A especificação lista probabilidade e multiplicador para os 4 jogos no mesmo formato, mas só fala explicitamente em "escolha" como conceito geral. Eu segui dois modelos diferentes:
   - **Roleta Primal** e **Joga a Moeda**: o jogador escolhe uma opção (cor / lado) antes do sorteio — o modelo clássico de roleta.
   - **Cofre Misterioso** e **Sobreviveu ou Não**: não há escolha individual. Todo mundo que apostou na rodada recebe o mesmo resultado sorteado (todos abrem "o mesmo cofre", todos enfrentam "o mesmo evento de sobrevivência").
   Se a intenção era ter escolha em todos os 4 jogos, é uma mudança pequena de fazer — me avise.

2. **"Perde tudo" em Sobreviveu ou Não.** Interpretei literalmente: ao cair em "Eliminado", o saldo do jogador vai a **zero** (não só a aposta), diferente de "Joga a Moeda → Lado", onde só a aposta é perdida. Isso está registrado em log e na movimentação como `perda_total`, então é rastreável e reversível manualmente pelo admin se um teste sair "caro" demais.

3. **Uma aposta por jogador por rodada.** Não havia menção a permitir múltiplas apostas na mesma rodada, então bloqueei isso para manter o resultado simples de auditar. Se quiser permitir várias apostas por rodada, é uma validação a menos.

4. **Configurações de saldo inicial e bônus de indicação editáveis.** O documento menciona que o bônus de indicação é "configurável, inicialmente 200" — adicionei um painel simples em Dashboard para o admin editar esses dois valores (saldo inicial e bônus) sem precisar tocar no código.

## Limitações conhecidas

- **Sessões em SQLite, sem expiração ativa por logout em todos os dispositivos** — um token de sessão dura 7 dias ou até logout manual.
- **Sem upload de avatar, sem 2FA, sem recuperação de senha por e-mail** (não havia e-mail no cadastro). Recuperação de senha hoje depende do admin.
- **Concorrência:** o SQLite lida bem com a escala de "grupo de colegas", mas não foi pensado para centenas de apostas simultâneas no mesmo segundo.
- **node:sqlite é experimental** na documentação do próprio Node. Funcionou de forma estável em todos os testes que fiz, mas é bom saber que não é uma API "congelada" — se uma versão futura do Node mudar a API, pode exigir ajuste.

## O que foi testado

Testei o fluxo inteiro de ponta a ponta (cadastro → aprovação com bônus de indicação → abrir rodada → apostar → encerrar rodada → resultado → ranking → histórico → logs → ajuste manual de saldo) tanto por chamadas diretas à API quanto navegando de fato pela interface em mobile (390px) e desktop (1280px) com Chromium headless, sem erros de JavaScript no console.
