#!/usr/bin/env python
# Script para adicionar colunas de coparticipação ao banco remoto

from sqlalchemy import text
from app.db.database import engine

try:
    with engine.connect() as connection:
        print("Verificando e adicionando colunas na tabela coparticipacoes...")
        
        # Lista de colunas a adicionar
        colunas = [
            ("tipo_servico", "VARCHAR(100)"),
            ("percentual", "FLOAT"),
            ("valor_minimo", "FLOAT"),
            ("valor_maximo", "FLOAT"),
        ]
        
        for col_name, col_type in colunas:
            # Verificar se coluna já existe
            result = connection.execute(
                text(f"""
                    SELECT EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_name = 'coparticipacoes' 
                        AND column_name = '{col_name}'
                    )
                """)
            )
            
            coluna_existe = result.scalar()
            
            if not coluna_existe:
                print(f"  ➕ Adicionando coluna '{col_name}'...")
                connection.execute(
                    text(f"""
                        ALTER TABLE coparticipacoes 
                        ADD COLUMN {col_name} {col_type} NULL
                    """)
                )
                connection.commit()
                print(f"  ✅ Coluna '{col_name}' adicionada!")
            else:
                print(f"  ✓ Coluna '{col_name}' já existe")
        
        print("\n✅ Migração concluída com sucesso!")
        
except Exception as e:
    print(f"❌ Erro na migração: {e}")
    import traceback
    traceback.print_exc()
