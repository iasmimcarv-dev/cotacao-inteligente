#!/usr/bin/env python
# Script para popular operadoras no banco de dados

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models import operadora_model

# Criar tabelas se não existirem
Base.metadata.create_all(bind=engine)

# Operadoras brasileiras
operadoras_lista = [
    {"nome": "Unimed", "rede_credenciada_url": "https://www.unimed.com.br/rede"},
    {"nome": "Bradesco Saúde", "rede_credenciada_url": "https://www.bradescosaude.com.br"},
    {"nome": "Amil", "rede_credenciada_url": "https://www.amil.com.br"},
    {"nome": "SulAmérica", "rede_credenciada_url": "https://www.sulamerica.com.br"},
    {"nome": "Medial Saúde", "rede_credenciada_url": "https://www.medialsaude.com.br"},
    {"nome": "Hapvida", "rede_credenciada_url": "https://www.hapvida.com.br"},
    {"nome": "Notre Dame", "rede_credenciada_url": "https://www.notredame.com.br"},
    {"nome": "Intermédica", "rede_credenciada_url": "https://www.intermedica.com.br"},
]

db: Session = SessionLocal()

try:
    for op_dados in operadoras_lista:
        # Verificar se já existe
        existente = db.query(operadora_model.Operadora).filter(
            operadora_model.Operadora.nome == op_dados["nome"]
        ).first()
        
        if not existente:
            nova_op = operadora_model.Operadora(
                nome=op_dados["nome"],
                rede_credenciada_url=op_dados["rede_credenciada_url"]
            )
            db.add(nova_op)
            print(f"✓ Adicionada operadora: {op_dados['nome']}")
        else:
            print(f"⊘ Operadora já existe: {op_dados['nome']}")
    
    db.commit()
    print("\n✅ Banco de dados populado com sucesso!")
    
except Exception as e:
    db.rollback()
    print(f"❌ Erro ao popular banco: {e}")
finally:
    db.close()
