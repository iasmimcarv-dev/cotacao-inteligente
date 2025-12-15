#!/usr/bin/env python
# Script para popular planos de exemplo no banco de dados

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models import operadora_model, plano_model, faixa_preco_model, hospital_model, carencia_model, coparticipacao_model

db: Session = SessionLocal()

try:
    # Buscar operadora Unimed
    unimed = db.query(operadora_model.Operadora).filter(
        operadora_model.Operadora.nome == "Unimed"
    ).first()
    
    if not unimed:
        print("❌ Operadora Unimed não encontrada. Execute populate_operadoras.py primeiro.")
        exit(1)
    
    print("✓ Operadora Unimed encontrada")
    
    # ==================== PLANO 1: Unimed Master PF ====================
    plano_pf = plano_model.Plano(
        operadora_id=unimed.id,
        nome="Unimed Master PF",
        tipo_contratacao="PF",
        acomodacao="Apartamento",
        abrangencia="Nacional",
        coparticipacao=True,
        elegibilidade=False,
        imagem_coparticipacao_url="https://placeholder.com/600x400?text=Coparticipacao+PF"
    )
    db.add(plano_pf)
    db.flush()  # Pega o ID
    
    # Faixas de preço para PF
    faixas_pf = [
        {"faixa_etaria": "0-18", "valor": 150.00},
        {"faixa_etaria": "19-30", "valor": 180.00},
        {"faixa_etaria": "31-59", "valor": 250.00},
        {"faixa_etaria": "59+", "valor": 400.00}
    ]
    for f in faixas_pf:
        db.add(faixa_preco_model.FaixaPreco(
            plano_id=plano_pf.id,
            faixa_etaria=f["faixa_etaria"],
            valor=f["valor"]
        ))
    
    # Hospitais para PF
    hospitais_pf = [
        {"nome": "Hospital Sírio-Libanês", "endereco": "São Paulo, SP"},
        {"nome": "Hospital Albert Einstein", "endereco": "São Paulo, SP"},
        {"nome": "Hospital das Clínicas", "endereco": "São Paulo, SP"}
    ]
    for h in hospitais_pf:
        db.add(hospital_model.Hospital(
            plano_id=plano_pf.id,
            nome=h["nome"],
            endereco=h["endereco"]
        ))
    
    # Carências para PF
    carencias_pf = [
        {"descricao": "Urgência e Emergência", "dias": 0},
        {"descricao": "Consultas", "dias": 30},
        {"descricao": "Exames Complementares", "dias": 60},
        {"descricao": "Internação", "dias": 180}
    ]
    for c in carencias_pf:
        db.add(carencia_model.Carencia(
            plano_id=plano_pf.id,
            descricao=c["descricao"],
            dias=c["dias"]
        ))
    
    # Coparticipação para PF (com dados tabelados)
    coparticipacoes_pf = [
        {"tipo_servico": "Consulta", "percentual": 20, "valor_minimo": 50.00, "valor_maximo": 200.00},
        {"tipo_servico": "Exame", "percentual": 20, "valor_minimo": 50.00, "valor_maximo": 500.00},
        {"tipo_servico": "Internação", "percentual": 10, "valor_minimo": 100.00, "valor_maximo": None},
        {"tipo_servico": "Urgência/Emergência", "percentual": 0, "valor_minimo": 0.00, "valor_maximo": 0.00},
    ]
    for coprt in coparticipacoes_pf:
        db.add(coparticipacao_model.Coparticipacao(
            plano_id=plano_pf.id,
            tipo_plano="PF",
            imagem_url="https://placeholder.com/600x400?text=Coparticipacao+PF",
            tipo_servico=coprt["tipo_servico"],
            percentual=coprt["percentual"],
            valor_minimo=coprt["valor_minimo"],
            valor_maximo=coprt["valor_maximo"]
        ))
    
    # Municípios para PF
    municipios_pf = ["São Paulo", "Guarulhos", "Osasco", "Santos"]
    for m in municipios_pf:
        db.add(hospital_model.Municipio(
            plano_id=plano_pf.id,
            nome=m
        ))
    
    db.commit()
    print("✓ Plano PF criado com sucesso (ID: {})".format(plano_pf.id))
    
    # ==================== PLANO 2: Unimed Fácil Adesão ====================
    plano_adesao = plano_model.Plano(
        operadora_id=unimed.id,
        nome="Unimed Fácil Adesão",
        tipo_contratacao="Adesão",
        acomodacao="Enfermaria",
        abrangencia="Regional",
        coparticipacao=True,
        elegibilidade=True,
        imagem_coparticipacao_url="https://placeholder.com/600x400?text=Coparticipacao+Adesao"
    )
    db.add(plano_adesao)
    db.flush()  # Pega o ID
    
    # Faixas de preço para Adesão
    faixas_adesao = [
        {"faixa_etaria": "0-18", "valor": 100.00},
        {"faixa_etaria": "19-30", "valor": 130.00},
        {"faixa_etaria": "31-59", "valor": 170.00},
        {"faixa_etaria": "59+", "valor": 300.00}
    ]
    for f in faixas_adesao:
        db.add(faixa_preco_model.FaixaPreco(
            plano_id=plano_adesao.id,
            faixa_etaria=f["faixa_etaria"],
            valor=f["valor"]
        ))
    
    # Carências para Adesão (diferentes do PF)
    carencias_adesao = [
        {"descricao": "Urgência e Emergência", "dias": 24},
        {"descricao": "Consultas e Exames", "dias": 60},
        {"descricao": "Internação", "dias": 240}
    ]
    for c in carencias_adesao:
        db.add(carencia_model.Carencia(
            plano_id=plano_adesao.id,
            descricao=c["descricao"],
            dias=c["dias"]
        ))
    
    # Coparticipação para Adesão (com dados tabelados - diferentes do PF)
    coparticipacoes_adesao = [
        {"tipo_servico": "Consulta", "percentual": 30, "valor_minimo": 30.00, "valor_maximo": 150.00},
        {"tipo_servico": "Exame", "percentual": 30, "valor_minimo": 30.00, "valor_maximo": 300.00},
        {"tipo_servico": "Internação", "percentual": 15, "valor_minimo": 150.00, "valor_maximo": None},
    ]
    for coprt in coparticipacoes_adesao:
        db.add(coparticipacao_model.Coparticipacao(
            plano_id=plano_adesao.id,
            tipo_plano="Adesão",
            imagem_url="https://placeholder.com/600x400?text=Coparticipacao+Adesao",
            tipo_servico=coprt["tipo_servico"],
            percentual=coprt["percentual"],
            valor_minimo=coprt["valor_minimo"],
            valor_maximo=coprt["valor_maximo"]
        ))
    
    # Municípios para Adesão (regional, apenas 2)
    municipios_adesao = ["São Paulo", "Guarulhos"]
    for m in municipios_adesao:
        db.add(hospital_model.Municipio(
            plano_id=plano_adesao.id,
            nome=m
        ))
    
    db.commit()
    print("✓ Plano Adesão criado com sucesso (ID: {})".format(plano_adesao.id))
    
    print("\n✅ Banco populado com planos de exemplo!")
    
except Exception as e:
    db.rollback()
    print(f"❌ Erro ao popular planos: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
