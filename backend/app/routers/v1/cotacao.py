from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Optional
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from app.db import database
from app.models import operadora_model, plano_model, faixa_preco_model, hospital_model, carencia_model, coparticipacao_model
from app.schemas import cotacao_schema
from app.services.pdf_generator import gerar_pdf_cotacao
from datetime import datetime

router = APIRouter()

# --- OPERADORAS ---
@router.post("/operadoras/", response_model=cotacao_schema.OperadoraResponse, status_code=status.HTTP_201_CREATED)
def criar_operadora(
    operadora: cotacao_schema.OperadoraCreate, 
    db: Session = Depends(database.get_db)
):
    # Evitar duplicação por nome
    existente = db.query(operadora_model.Operadora).filter(operadora_model.Operadora.nome.ilike(operadora.nome)).first()
    if existente:
        raise HTTPException(status_code=409, detail="Operadora já existe")

    nova_op = operadora_model.Operadora(nome=operadora.nome, rede_credenciada_url=getattr(operadora, 'rede_credenciada_url', None))
    db.add(nova_op)
    try:
        db.commit()
        db.refresh(nova_op)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Operadora já existe")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return nova_op

@router.get("/operadoras/", response_model=list[cotacao_schema.OperadoraResponse])
def listar_operadoras(db: Session = Depends(database.get_db), nome: Optional[str] = None):
    query = db.query(operadora_model.Operadora)
    if nome:
        query = query.filter(operadora_model.Operadora.nome.ilike(f"%{nome}%"))
    return query.all()


@router.get("/operadoras/{operadora_id}", response_model=cotacao_schema.OperadoraResponse)
def buscar_operadora(operadora_id: int, db: Session = Depends(database.get_db)):
    op = db.query(operadora_model.Operadora).filter(operadora_model.Operadora.id == operadora_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operadora não encontrada")
    return op


@router.put("/operadoras/{operadora_id}", response_model=cotacao_schema.OperadoraResponse)
def atualizar_operadora(operadora_id: int, operadora: cotacao_schema.OperadoraCreate, db: Session = Depends(database.get_db)):
    op = db.query(operadora_model.Operadora).filter(operadora_model.Operadora.id == operadora_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operadora não encontrada")
    
    # Verificar se o novo nome já existe em outra operadora
    if op.nome != operadora.nome:
        existente = db.query(operadora_model.Operadora).filter(
            operadora_model.Operadora.nome.ilike(operadora.nome),
            operadora_model.Operadora.id != operadora_id
        ).first()
        if existente:
            raise HTTPException(status_code=409, detail="Operadora com esse nome já existe")
    
    op.nome = operadora.nome
    op.rede_credenciada_url = getattr(operadora, 'rede_credenciada_url', op.rede_credenciada_url)
    try:
        db.commit()
        db.refresh(op)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return op


@router.delete("/operadoras/{operadora_id}", status_code=status.HTTP_200_OK)
def deletar_operadora(operadora_id: int, db: Session = Depends(database.get_db)):
    op = db.query(operadora_model.Operadora).filter(operadora_model.Operadora.id == operadora_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operadora não encontrada")
    db.delete(op)
    db.commit()
    return {"mensagem": "Operadora removida"}

# --- PLANOS ---
@router.post("/planos/", response_model=cotacao_schema.PlanoResponse, status_code=status.HTTP_201_CREATED)
def criar_plano(plano: cotacao_schema.PlanoCreate, db: Session = Depends(database.get_db)):
    
    # 1. Verificar se a Operadora existe
    op = db.query(operadora_model.Operadora).filter(operadora_model.Operadora.id == plano.operadora_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operadora não encontrada")

    # 2. Separar as faixas de preço do resto dos dados do plano
    # O .dict() ou .model_dump() transforma o schema em dicionário
    # Use .model_dump() for Pydantic v2 compatibility (or .dict() on v1)
    try:
        plano_dados = plano.model_dump()
    except Exception:
        plano_dados = plano.dict()
    faixas_dados = plano_dados.pop("faixas_preco") # Remove a lista de preços para não dar erro na tabela de planos
    # Remover listas aninhadas para evitar passar dicts para SQLAlchemy
    hosp_dados = plano_dados.pop('hospitais', [])
    carencias_dados = plano_dados.pop('carencias', [])
    municipios_dados = plano_dados.pop('municipios', [])
    coparticipacoes_dados = plano_dados.pop('coparticipacoes', [])

    # 3. Criar o Plano (sem as faixas por enquanto)
    novo_plano = plano_model.Plano(**plano_dados)
    
    db.add(novo_plano)
    db.commit()
    db.refresh(novo_plano) # Aqui ganhamos o novo_plano.id

    # 4. Agora sim, criar as Faixas de Preço vinculadas ao ID do plano criado
    for faixa in faixas_dados:
        nova_faixa = faixa_preco_model.FaixaPreco(
            plano_id=novo_plano.id,  # Vinculando ao pai
            faixa_etaria=faixa['faixa_etaria'],
            valor=faixa['valor']
        )
        db.add(nova_faixa)
    # Hospitais (opcional)
    for hosp in hosp_dados:
        nova_h = hospital_model.Hospital(
            plano_id=novo_plano.id,
            nome=hosp.get('nome'),
            endereco=hosp.get('endereco')
        )
        db.add(nova_h)
    # Carencias (opcional)
    for car in carencias_dados:
        nova_c = carencia_model.Carencia(
            plano_id=novo_plano.id,
            descricao=car.get('descricao'),
            dias=car.get('dias')
        )
        db.add(nova_c)
    # Coparticipações (opcional)
    for coprt in coparticipacoes_dados:
        nova_coprt = coparticipacao_model.Coparticipacao(
            plano_id=novo_plano.id,
            nome=coprt.get('nome'),
            tipo_plano=coprt.get('tipo_plano'),
            imagem_url=coprt.get('imagem_url'),
            tipo_servico=coprt.get('tipo_servico'),
            percentual=coprt.get('percentual'),
            valor_minimo=coprt.get('valor_minimo'),
            valor_maximo=coprt.get('valor_maximo')
        )
        db.add(nova_coprt)
    # Municipios (opcional)
    for m in municipios_dados:
        novo_m = hospital_model.Municipio(
            plano_id=novo_plano.id,
            nome=m.get('nome')
        )
        db.add(novo_m)
    
    db.commit() # Salva todas as faixas
    db.refresh(novo_plano) # Atualiza o plano para retornar com as faixas dentro

    return novo_plano


@router.put("/planos/{plano_id}", response_model=cotacao_schema.PlanoResponse)
def atualizar_plano(plano_id: int, plano: cotacao_schema.PlanoCreate, db: Session = Depends(database.get_db)):
    pl = db.query(plano_model.Plano).filter(plano_model.Plano.id == plano_id).first()
    if not pl:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    pl.nome = plano.nome
    pl.tipo_contratacao = plano.tipo_contratacao
    pl.acomodacao = plano.acomodacao
    pl.abrangencia = plano.abrangencia
    pl.coparticipacao = plano.coparticipacao
    pl.elegibilidade = plano.elegibilidade
    pl.imagem_coparticipacao_url = plano.imagem_coparticipacao_url
    try:
        # Remove existing child records and recreate (EXCETO coparticipações)
        db.query(faixa_preco_model.FaixaPreco).filter(faixa_preco_model.FaixaPreco.plano_id == pl.id).delete()
        db.query(hospital_model.Hospital).filter(hospital_model.Hospital.plano_id == pl.id).delete()
        db.query(carencia_model.Carencia).filter(carencia_model.Carencia.plano_id == pl.id).delete()
        db.query(hospital_model.Municipio).filter(hospital_model.Municipio.plano_id == pl.id).delete()
        db.commit()
        for faixa in plano.faixas_preco:
            nova_faixa = faixa_preco_model.FaixaPreco(plano_id=pl.id, faixa_etaria=faixa.faixa_etaria, valor=faixa.valor)
            db.add(nova_faixa)
        for hosp in getattr(plano, 'hospitais', []):
            nova_h = hospital_model.Hospital(plano_id=pl.id, nome=getattr(hosp, 'nome', None), endereco=getattr(hosp, 'endereco', None))
            db.add(nova_h)
        for car in getattr(plano, 'carencias', []):
            nova_c = carencia_model.Carencia(plano_id=pl.id, descricao=getattr(car, 'descricao', None), dias=getattr(car, 'dias', None))
            db.add(nova_c)
        
        # Processar coparticipações: atualizar as com ID, criar as sem ID
        # Primeiramente, obter IDs das coparticipações enviadas no request
        coparticipacoes_request = getattr(plano, 'coparticipacoes', [])
        ids_request = [getattr(c, 'id', None) for c in coparticipacoes_request if getattr(c, 'id', None)]
        
        # Deletar coparticipações que não estão mais no request
        coprt_banco = db.query(coparticipacao_model.Coparticipacao).filter(
            coparticipacao_model.Coparticipacao.plano_id == pl.id
        ).all()
        
        ids_banco = [c.id for c in coprt_banco]
        ids_para_deletar = [id_banco for id_banco in ids_banco if id_banco not in ids_request]
        
        for id_deletar in ids_para_deletar:
            db.query(coparticipacao_model.Coparticipacao).filter(
                coparticipacao_model.Coparticipacao.id == id_deletar
            ).delete()
        
        db.commit()  # Confirma os deletes antes de processar as novas/atualizações
        
        # Processar cada coparticipação do request
        for coprt in coparticipacoes_request:
            coprt_id = getattr(coprt, 'id', None)
            
            if coprt_id:
                # Atualizar coparticipação existente
                coprt_existente = db.query(coparticipacao_model.Coparticipacao).filter(
                    coparticipacao_model.Coparticipacao.id == coprt_id,
                    coparticipacao_model.Coparticipacao.plano_id == pl.id
                ).first()
                
                if coprt_existente:
                    coprt_existente.nome = getattr(coprt, 'nome', None)
                    coprt_existente.tipo_servico = getattr(coprt, 'tipo_servico', None)
                    coprt_existente.percentual = getattr(coprt, 'percentual', None)
                    coprt_existente.valor_minimo = getattr(coprt, 'valor_minimo', None)
                    coprt_existente.valor_maximo = getattr(coprt, 'valor_maximo', None)
            else:
                # Criar nova coparticipação
                nova_coprt = coparticipacao_model.Coparticipacao(
                    plano_id=pl.id,
                    nome=getattr(coprt, 'nome', None),
                    tipo_plano=getattr(coprt, 'tipo_plano', None),
                    imagem_url=getattr(coprt, 'imagem_url', None),
                    tipo_servico=getattr(coprt, 'tipo_servico', None),
                    percentual=getattr(coprt, 'percentual', None),
                    valor_minimo=getattr(coprt, 'valor_minimo', None),
                    valor_maximo=getattr(coprt, 'valor_maximo', None)
                )
                db.add(nova_coprt)
        
        for m in getattr(plano, 'municipios', []):
            novo_m = hospital_model.Municipio(plano_id=pl.id, nome=getattr(m, 'nome', None))
            db.add(novo_m)
        db.commit()
        db.refresh(pl)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return pl

@router.delete("/planos/{plano_id}")
def excluir_plano(plano_id: int, db: Session = Depends(database.get_db)):
    pl = db.query(plano_model.Plano).filter(plano_model.Plano.id == plano_id).first()
    if not pl:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    
    try:
        # Excluir relacionamentos primeiro (ordem importa!)
        db.query(faixa_preco_model.FaixaPreco).filter(faixa_preco_model.FaixaPreco.plano_id == plano_id).delete()
        db.query(hospital_model.Hospital).filter(hospital_model.Hospital.plano_id == plano_id).delete()
        db.query(carencia_model.Carencia).filter(carencia_model.Carencia.plano_id == plano_id).delete()
        db.query(coparticipacao_model.Coparticipacao).filter(coparticipacao_model.Coparticipacao.plano_id == plano_id).delete()
        db.query(hospital_model.Municipio).filter(hospital_model.Municipio.plano_id == plano_id).delete()
        # Nota: guias_proposta não tem coluna plano_id no banco, então não deletamos
        
        # Excluir o plano
        db.delete(pl)
        db.commit()
        
        return {"message": "Plano excluído com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir plano: {str(e)}")

@router.delete("/planos/{plano_id}/coparticipacoes/{coparticipacao_id}")
def excluir_coparticipacao(plano_id: int, coparticipacao_id: int, db: Session = Depends(database.get_db)):
    """Exclui apenas uma coparticipação sem recriar todas as outras"""
    try:
        coprt = db.query(coparticipacao_model.Coparticipacao).filter(
            coparticipacao_model.Coparticipacao.id == coparticipacao_id,
            coparticipacao_model.Coparticipacao.plano_id == plano_id
        ).first()
        
        if not coprt:
            raise HTTPException(status_code=404, detail="Coparticipação não encontrada")
        
        db.delete(coprt)
        db.commit()
        
        return {"message": "Coparticipação excluída com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir: {str(e)}")

@router.get("/planos/", response_model=list[cotacao_schema.PlanoResponse])
def listar_planos(db: Session = Depends(database.get_db), nome: Optional[str] = None, operadora_id: Optional[int] = None):
    try:
        query = db.query(plano_model.Plano)
        if nome:
            query = query.filter(plano_model.Plano.nome.ilike(f"%{nome}%"))
        if operadora_id:
            query = query.filter(plano_model.Plano.operadora_id == operadora_id)
        
        planos = query.options(
            joinedload(plano_model.Plano.operadora_rel),
            joinedload(plano_model.Plano.faixas),
            joinedload(plano_model.Plano.hospitais),
            joinedload(plano_model.Plano.carencias),
            joinedload(plano_model.Plano.coparticipacoes),
            joinedload(plano_model.Plano.municipios),
        ).all()
        
        return planos
    except Exception as e:
        import traceback
        print("=== ERRO NO LISTAR_PLANOS ===")
        print(f"Erro: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar planos: {str(e)}")


# --- COTAÇÃO ---

def verificar_faixa(idade: int, faixa_string: str) -> bool:
    """
    Função auxiliar para checar se a idade cai na faixa "0-18", "19-23", etc.
    """
    try:
        # Remove espaços e quebra a string no hífen
        min_str, max_str = faixa_string.replace(" ", "").split("-")
        min_idade = int(min_str)
        
        # Se for "59+", o max seria algo como 999
        if "+" in max_str:
            max_idade = 999
        else:
            max_idade = int(max_str)
            
        return min_idade <= idade <= max_idade
    except:
        return False

@router.post("/cotacao/", response_model=list[cotacao_schema.CotacaoResultado])
def calcular_cotacao(dados: cotacao_schema.CotacaoRequest, db: Session = Depends(database.get_db)):
    if not dados.idades:
        raise HTTPException(status_code=400, detail="Lista de idades vazia")

    query = db.query(plano_model.Plano)
    if dados.operadora_id is not None:
        query = query.filter(plano_model.Plano.operadora_id == dados.operadora_id)
    if dados.tipo_contratacao:
        query = query.filter(plano_model.Plano.tipo_contratacao.ilike(f"{dados.tipo_contratacao}%"))
    if dados.acomodacao:
        query = query.filter(plano_model.Plano.acomodacao.ilike(f"{dados.acomodacao}%"))
    if dados.abrangencia:
        query = query.filter(plano_model.Plano.abrangencia.ilike(f"{dados.abrangencia}%"))
    if dados.elegibilidade is not None:
        query = query.filter(plano_model.Plano.elegibilidade == dados.elegibilidade)
    if dados.coparticipacao is not None:
        query = query.filter(plano_model.Plano.coparticipacao == dados.coparticipacao)

    planos_disponiveis = query.options(
        joinedload(plano_model.Plano.operadora_rel),
        joinedload(plano_model.Plano.faixas),
        joinedload(plano_model.Plano.hospitais),
        joinedload(plano_model.Plano.carencias),
        joinedload(plano_model.Plano.coparticipacoes),
        joinedload(plano_model.Plano.municipios),
    ).all()

    resultados = []
    for plano in planos_disponiveis:
        total_plano = 0.0
        detalhes_beneficiarios = []
        plano_valido = True

        for idade in dados.idades:
            preco_encontrado = None
            faixa_encontrada = ""
            for faixa in plano.faixas:
                if verificar_faixa(idade, faixa.faixa_etaria):
                    preco_encontrado = faixa.valor
                    faixa_encontrada = faixa.faixa_etaria
                    break

            if preco_encontrado is not None:
                total_plano += preco_encontrado
                detalhes_beneficiarios.append({
                    "idade": idade,
                    "faixa_etaria_usada": faixa_encontrada,
                    "valor": preco_encontrado
                })
            else:
                plano_valido = False
                break

        if plano_valido:
            # Verificar se operadora existe
            operadora_nome = plano.operadora_rel.nome if plano.operadora_rel else "N/A"
            rede_url = plano.operadora_rel.rede_credenciada_url if plano.operadora_rel else None
            
            resultados.append({
                "plano_id": plano.id,
                "operadora": operadora_nome,
                "plano": plano.nome,
                "preco_total": round(total_plano, 2),
                "beneficiarios": detalhes_beneficiarios,
                "imagem_coparticipacao_url": getattr(plano, 'imagem_coparticipacao_url', None),
                "hospitais": [ {"id": h.id, "nome": h.nome, "endereco": h.endereco} for h in plano.hospitais],
                "carencias": [ {"id": c.id, "descricao": c.descricao, "dias": c.dias} for c in plano.carencias],
                "coparticipacoes": [ {"id": cp.id, "nome": cp.nome, "tipo_plano": cp.tipo_plano, "imagem_url": cp.imagem_url, "tipo_servico": cp.tipo_servico, "percentual": cp.percentual, "valor_minimo": cp.valor_minimo, "valor_maximo": cp.valor_maximo} for cp in plano.coparticipacoes],
                "municipios": [ {"id": m.id, "nome": m.nome} for m in plano.municipios],
                "rede_credenciada_url": rede_url
            })

    return resultados


@router.post("/cotacao/pdf")
def gerar_pdf_cotacao_endpoint(dados: cotacao_schema.CotacaoRequest, db: Session = Depends(database.get_db)):
    """
    Endpoint para gerar PDF da cotação
    """
    if not dados.idades:
        raise HTTPException(status_code=400, detail="Lista de idades vazia")
    
    # Reutilizar a lógica de calcular_cotacao
    query = db.query(plano_model.Plano)
    if dados.operadora_id is not None:
        query = query.filter(plano_model.Plano.operadora_id == dados.operadora_id)
    if dados.tipo_contratacao:
        query = query.filter(plano_model.Plano.tipo_contratacao.ilike(f"{dados.tipo_contratacao}%"))
    if dados.acomodacao:
        query = query.filter(plano_model.Plano.acomodacao.ilike(f"{dados.acomodacao}%"))
    if dados.abrangencia:
        query = query.filter(plano_model.Plano.abrangencia.ilike(f"{dados.abrangencia}%"))
    if dados.elegibilidade is not None:
        query = query.filter(plano_model.Plano.elegibilidade == dados.elegibilidade)
    if dados.coparticipacao is not None:
        query = query.filter(plano_model.Plano.coparticipacao == dados.coparticipacao)

    planos_disponiveis = query.options(
        joinedload(plano_model.Plano.operadora_rel),
        joinedload(plano_model.Plano.faixas),
        joinedload(plano_model.Plano.hospitais),
        joinedload(plano_model.Plano.carencias),
        joinedload(plano_model.Plano.coparticipacoes),
        joinedload(plano_model.Plano.municipios),
    ).all()

    resultados = []
    for plano in planos_disponiveis:
        total_plano = 0.0
        detalhes_beneficiarios = []
        plano_valido = True

        for idade in dados.idades:
            preco_encontrado = None
            faixa_encontrada = ""
            for faixa in plano.faixas:
                if verificar_faixa(idade, faixa.faixa_etaria):
                    preco_encontrado = faixa.valor
                    faixa_encontrada = faixa.faixa_etaria
                    break

            if preco_encontrado is not None:
                total_plano += preco_encontrado
                detalhes_beneficiarios.append({
                    "idade": idade,
                    "faixa_etaria_usada": faixa_encontrada,
                    "valor": preco_encontrado
                })
            else:
                plano_valido = False
                break

        if plano_valido:
            operadora_nome = plano.operadora_rel.nome if plano.operadora_rel else "N/A"
            rede_url = plano.operadora_rel.rede_credenciada_url if plano.operadora_rel else None
            
            resultados.append({
                "plano_id": plano.id,
                "operadora": operadora_nome,
                "plano": plano.nome,
                "preco_total": round(total_plano, 2),
                "beneficiarios": detalhes_beneficiarios,
                "imagem_coparticipacao_url": getattr(plano, 'imagem_coparticipacao_url', None),
                "hospitais": [ {"id": h.id, "nome": h.nome, "endereco": h.endereco} for h in plano.hospitais],
                "carencias": [ {"id": c.id, "descricao": c.descricao, "dias": c.dias} for c in plano.carencias],
                "coparticipacoes": [ {"id": cp.id, "nome": cp.nome, "tipo_plano": cp.tipo_plano, "imagem_url": cp.imagem_url, "tipo_servico": cp.tipo_servico, "percentual": cp.percentual, "valor_minimo": cp.valor_minimo, "valor_maximo": cp.valor_maximo} for cp in plano.coparticipacoes],
                "municipios": [ {"id": m.id, "nome": m.nome} for m in plano.municipios],
                "rede_credenciada_url": rede_url
            })
    
    # Filtrar por plano específico se solicitado
    if dados.plano_id is not None:
        resultados = [r for r in resultados if r.get("plano_id") == dados.plano_id]
        if not resultados:
            raise HTTPException(status_code=404, detail="Plano não encontrado para gerar PDF")

    # Gerar PDF (inclui desconto_percentual, se enviado)
    payload_pdf = {"resultados": resultados}
    desconto_percentual = getattr(dados, 'desconto_percentual', None)
    if desconto_percentual is not None:
        try:
            payload_pdf["desconto_percentual"] = float(desconto_percentual)
        except Exception:
            payload_pdf["desconto_percentual"] = 0.0
    pdf_buffer = gerar_pdf_cotacao(payload_pdf, dados.idades)
    
    # Nome do arquivo com timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"cotacao_{timestamp}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )