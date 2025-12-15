#!/usr/bin/env python
# Script para migrar banco remoto - adicionar coluna imagem_coparticipacao_url

from sqlalchemy import text
from app.db.database import engine

try:
    with engine.connect() as connection:
        # Verificar se a coluna já existe
        result = connection.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'planos' 
                    AND column_name = 'imagem_coparticipacao_url'
                )
            """)
        )
        
        coluna_existe = result.scalar()
        
        if coluna_existe:
            print("✅ Coluna 'imagem_coparticipacao_url' já existe!")
        else:
            print("➕ Adicionando coluna 'imagem_coparticipacao_url' ao banco remoto...")
            connection.execute(
                text("""
                    ALTER TABLE planos 
                    ADD COLUMN imagem_coparticipacao_url VARCHAR(255) NULL
                """)
            )
            connection.commit()
            print("✅ Coluna adicionada com sucesso!")
        
        # Verificar se a tabela coparticipacoes existe
        result = connection.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_name = 'coparticipacoes'
                )
            """)
        )
        
        tabela_existe = result.scalar()
        
        if not tabela_existe:
            print("➕ Criando tabela 'coparticipacoes'...")
            connection.execute(
                text("""
                    CREATE TABLE coparticipacoes (
                        id SERIAL PRIMARY KEY,
                        plano_id INTEGER NOT NULL,
                        tipo_plano VARCHAR(100),
                        imagem_url VARCHAR(255),
                        FOREIGN KEY (plano_id) REFERENCES planos(id)
                    )
                """)
            )
            connection.commit()
            print("✅ Tabela 'coparticipacoes' criada com sucesso!")
        else:
            print("✅ Tabela 'coparticipacoes' já existe!")
        
        print("\n✅ Migração concluída com sucesso!")
        
except Exception as e:
    print(f"❌ Erro na migração: {e}")
    import traceback
    traceback.print_exc()
