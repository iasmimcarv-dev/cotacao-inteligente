# Scripts de Utilitários

Todos os scripts auxiliares estão organizados na pasta `backend/scripts/`.

## Scripts Disponíveis

### 📦 Database & Setup

#### `recreate_db.py`

Recria o banco de dados do zero.

```bash
python scripts/recreate_db.py
```

### 🔄 Migrações

#### `migrate_remote_db.py`

Migra para banco de dados remoto (Railway).

```bash
python scripts/migrate_remote_db.py
```

#### `migrate_add_columns.py`

Adiciona colunas necessárias ao banco.

```bash
python scripts/migrate_add_columns.py
```

#### `migrate_coparticipacao_table.py`

Cria tabela de coparticipação.

```bash
python scripts/migrate_coparticipacao_table.py
```

### 📥 Seed Data

#### `populate_operadoras.py`

Popula 8 operadoras padrão no banco.

```bash
python scripts/populate_operadoras.py
```

#### `populate_planos_exemplo.py`

Adiciona 2 planos de exemplo para teste.

```bash
python scripts/populate_planos_exemplo.py
```

### 🗑️ Limpeza

#### `delete_all_planos.py`

Deleta TODOS os planos, faixas, hospitais e demais dados.
⚠️ USE COM CUIDADO!

```bash
python scripts/delete_all_planos.py
```

## Como Usar

1. Entre na pasta backend:

```bash
cd backend
```

2. Ative o ambiente virtual:

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Execute o script desejado:

```bash
python scripts/recreate_db.py
python scripts/populate_operadoras.py
python scripts/populate_planos_exemplo.py
```

## Ordem Recomendada para Setup Inicial

1. `recreate_db.py` - Cria banco do zero
2. `migrate_remote_db.py` - (Se usar Railway)
3. `populate_operadoras.py` - Popula dados iniciais
4. `populate_planos_exemplo.py` - Adiciona exemplos

## Notas

- Todos os scripts usam as variáveis de `.env`
- Tenha cuidado ao executar `delete_all_planos.py`
- Migre sempre antes de popular dados
