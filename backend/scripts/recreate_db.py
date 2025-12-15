#!/usr/bin/env python
# Script para recriar o banco de dados com a nova coluna

from app.db.database import engine, Base
import app.models  # Importar todos os modelos

# Recriar todas as tabelas
Base.metadata.create_all(bind=engine)
print("✅ Banco de dados recriado com sucesso!")
