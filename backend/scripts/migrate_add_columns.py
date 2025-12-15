from app.db import database
from sqlalchemy import text

engine = database.engine

try:
    with engine.begin() as conn:
        print('Applying migrations...')
        conn.execute(text("ALTER TABLE operadoras ADD COLUMN IF NOT EXISTS rede_credenciada_url VARCHAR;"))
        conn.execute(text("ALTER TABLE planos ADD COLUMN IF NOT EXISTS elegibilidade BOOLEAN;"))
        print('Migration applied')
except Exception as e:
    print('Migration failed:', e)
