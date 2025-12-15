#!/usr/bin/env python3
"""
Script para limpar coparticipações vazias/duplicadas do banco de dados
"""

import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv(r'C:\Users\mimid\Desktop\cotacao-assistente\backend\.env')

# Add backend to path
sys.path.insert(0, r'C:\Users\mimid\Desktop\cotacao-assistente\backend')

from sqlalchemy import text
from app.db.database import engine

def limpar_coparticipacoes_vazias():
    """Remove todas as coparticipações com nome NULL ou vazio"""
    try:
        with engine.connect() as connection:
            # Contar antes
            result_antes = connection.execute(
                text("SELECT COUNT(*) FROM coparticipacoes")
            ).fetchone()
            
            total_antes = result_antes[0]
            print(f"[INFO] Total de coparticipacoes ANTES: {total_antes}")
            
            # Listar as vazias
            vazias = connection.execute(
                text("SELECT id, plano_id, nome, tipo_servico FROM coparticipacoes WHERE nome IS NULL OR nome = ''")
            ).fetchall()
            
            if vazias:
                print(f"\n[AVISO] Encontradas {len(vazias)} coparticipacoes VAZIAS:")
                for c in vazias[:10]:  # Mostrar primeiro 10
                    print(f"  ID: {c[0]}, Plano: {c[1]}, Nome: '{c[2]}', Tipo: '{c[3]}'")
                if len(vazias) > 10:
                    print(f"  ... e mais {len(vazias) - 10}")
            
            # Deletar as vazias
            print(f"\n[DELETANDO] Removendo {len(vazias)} coparticipacoes vazias...")
            connection.execute(
                text("DELETE FROM coparticipacoes WHERE nome IS NULL OR nome = ''")
            )
            connection.commit()
            print("[OK] Deletadas com sucesso!")
            
            # Contar depois
            result_depois = connection.execute(
                text("SELECT COUNT(*) FROM coparticipacoes")
            ).fetchone()
            
            total_depois = result_depois[0]
            removidas = total_antes - total_depois
            
            print(f"\n[RESULTADO]")
            print(f"  Antes: {total_antes}")
            print(f"  Depois: {total_depois}")
            print(f"  Removidas: {removidas}")
            
    except Exception as e:
        print(f"[ERRO] {str(e)}")
        sys.exit(1)

def limpar_tudo():
    """Remove TODAS as coparticipações (nuclear option)"""
    try:
        with engine.connect() as connection:
            # Contar antes
            result_antes = connection.execute(
                text("SELECT COUNT(*) FROM coparticipacoes")
            ).fetchone()
            
            total_antes = result_antes[0]
            print(f"[AVISO] Deletando TODAS as {total_antes} coparticipacoes!")
            
            if not input("\nConfirma? (sim/nao): ").lower().startswith('s'):
                print("[CANCELADO]")
                return
            
            # Deletar TODAS
            connection.execute(text("DELETE FROM coparticipacoes"))
            connection.commit()
            
            print("[OK] Todas as coparticipacoes removidas!")
            
    except Exception as e:
        print(f"[ERRO] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("[INICIANDO] Limpeza de coparticipacoes...\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == '--tudo':
        limpar_tudo()
    else:
        limpar_coparticipacoes_vazias()
    
    print("\n[CONCLUIDO]")
