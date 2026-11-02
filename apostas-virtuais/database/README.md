# Banco de Dados — Evlurn

> Organização da pasta `database/` e guia de trabalho com o SQLite da plataforma.

---

## Estrutura desta pasta

```
database/
├── migrations/   # Scripts de migração de schema (histórico de alterações)
├── backup/       # Backups manuais e scripts de backup automatizado
├── seed/         # Dados iniciais para desenvolvimento e testes
└── README.md     # Este arquivo
```

> **Importante:** o arquivo `data/database.sqlite` é gerado em runtime e **não é versionado** (listado no `.gitignore`). Esta pasta contém apenas scripts e documentação, nunca o banco em si.

---

## Localização do banco em produção

No Railway, o banco está montado em um Volume persistente:

```
Mount path: /data
Arquivo:    /data/database.sqlite
Variável:   DATABASE_DIR=/data
```

Em desenvolvimento local, o banco é criado automaticamente em:

```
./data/database.sqlite
```

---

## Como fazer backup manual

```bash
# Copiar o arquivo SQLite (servidor parado ou usando o modo WAL)
cp data/database.sqlite database/backup/backup_$(date +%Y%m%d_%H%M%S).sqlite

# Verificar integridade
sqlite3 database/backup/backup_*.sqlite "PRAGMA integrity_check;"
```

---

## Como resetar o banco em desenvolvimento

```bash
rm -f data/database.sqlite data/database.sqlite-shm data/database.sqlite-wal
node server.js   # O schema é recriado automaticamente no startup
```

---

## Convenção para scripts de migração

Quando uma migração for necessária (nova coluna, nova tabela), seguir o padrão:

```
database/migrations/
├── 0001_initial_schema.sql
├── 0002_add_eventos_table.sql
├── 0003_add_demographic_fields.sql
└── ...
```

> **Nota:** o projeto ainda não usa um sistema formal de migrações. As migrações atuais são executadas diretamente no startup via `src/db.js` com verificações `IF NOT EXISTS` e `PRAGMA table_info()`. Quando o volume de migrações crescer, considerar uma biblioteca leve de migrations ou implementar um runner próprio.

---

## Tabelas atuais

Ver `docs/Architecture.md` para a lista completa de tabelas e seus propósitos.

---

*Última atualização: Julho 2026*
