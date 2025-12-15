#!/usr/bin/env python3
"""
Script de migração para adicionar coluna 'nome' na tabela coparticipacoes
"""

import os
import sys
from sqlalchemy import text
from app.db.database import engine
from app.db.base import Base
from app.models import coparticipacao_model

def migrate():
    """Adiciona coluna 'nome' à tabela coparticipacoes se não existir"""
    try:
        with engine.connect() as connection:
            # Verificar se a coluna 'nome' já existe
            result = connection.execute(
                text("SELECT column_name FROM information_schema.columns WHERE table_name='coparticipacoes' AND column_name='nome'")
            ).fetchall()
            
            if not result:
                print("[INFO] Adicionando coluna 'nome' na tabela 'coparticipacoes'...")
                connection.execute(text("ALTER TABLE coparticipacoes ADD COLUMN nome VARCHAR NULL"))
                connection.commit()
                print("[OK] Coluna 'nome' adicionada com sucesso!")
            else:
                print("[INFO] Coluna 'nome' já existe na tabela 'coparticipacoes'")
                
    except Exception as e:
        print(f"[ERRO] Erro ao migrar: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("[INICIANDO] Migração de coparticipacoes...")
    migrate()
    print("[CONCLUÍDO] Migração finalizada!")
