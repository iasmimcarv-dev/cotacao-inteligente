from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db import database

# ----------------- NOVOS IMPORTS -----------------
from app.models import guia_model
from app.models import operadora_model
from app.models import plano_model
from app.models import faixa_preco_model
from app.models import hospital_model
from app.models import carencia_model
from app.routers.v1 import cotacao
from app.routers.v1.cotacao import calcular_cotacao as calcular_cotacao_v1
from app.schemas import cotacao_schema as cotacao_schema_module
from sqlalchemy.orm import Session as SQLAlchemySession
# -------------------------------------------------

from fastapi.middleware.cors import CORSMiddleware

# Esta linha vai criar TODAS as tabelas se elas não existirem
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Cotador Assistente API")
# Configuração do CORS (Permitir que o Frontend converse com o Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AQUI CONECTAMOS SUA ROTA ---
# O "router" é a variável que você criou dentro do arquivo cotacao.py
# Registramos apenas uma instância do app mais abaixo (com título/prefixo)

# O restante do seu código (app = FastAPI(...), @app.get('/'), etc.)

app.include_router(cotacao.router, prefix="/api/v1", tags=["Cotação"])

@app.get("/")
def read_root():
    return {"message": "API do Cotador online e Profissional! 🚀"}

# Endpoint de teste rápido - Mantenha este para garantir que o banco funciona
@app.post("/guias/")
def criar_guia_teste(db: Session = Depends(database.get_db)):
    # ... código de criação de guia (pode deixar como está)
    novo_guia = guia_model.GuiaProposta(
        operadora="Unimed",
        tipo_plano="Adesão",
        titulo="Teste de Estrutura",
        conteudo="Se você está lendo isso, o banco conectou!"
    )
    db.add(novo_guia)
    db.commit()
    return {"status": "Sucesso total!"}


# Rota legacy sem /v1 para compatibilidade com versões antigas do frontend
@app.post("/api/cotacao/", response_model=list[cotacao_schema_module.CotacaoResultado])
def calcular_cotacao_alias(dados: cotacao_schema_module.CotacaoRequest, db: SQLAlchemySession = Depends(database.get_db)):
    return calcular_cotacao_v1(dados, db)

# Remove model definitions from main.py; models must live under app/models