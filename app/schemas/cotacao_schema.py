from pydantic import BaseModel
from typing import List, Optional

# --- OPERADORA ---
class OperadoraBase(BaseModel):
    nome: str
    rede_credenciada_url: Optional[str] = None

class OperadoraCreate(OperadoraBase):
    pass

class OperadoraResponse(OperadoraBase):
    id: int
    class Config:
        from_attributes = True

class HospitalResponse(BaseModel):
    id: int
    nome: str
    endereco: Optional[str] = None
    class Config:
        from_attributes = True

class CarenciaResponse(BaseModel):
    id: int
    descricao: str
    dias: int
    class Config:
        from_attributes = True

class CoparticipacaoResponse(BaseModel):
    id: int
    nome: Optional[str] = None
    tipo_plano: Optional[str] = None
    imagem_url: Optional[str] = None
    tipo_servico: Optional[str] = None
    percentual: Optional[float] = None
    valor_minimo: Optional[float] = None
    valor_maximo: Optional[float] = None
    class Config:
        from_attributes = True

class CoparticipacaoCreate(BaseModel):
    id: Optional[int] = None  # Adicionado para poder receber ID ao atualizar
    nome: Optional[str] = None
    tipo_plano: Optional[str] = None
    imagem_url: Optional[str] = None
    tipo_servico: Optional[str] = None
    percentual: Optional[float] = None
    valor_minimo: Optional[float] = None
    valor_maximo: Optional[float] = None

class MunicipioResponse(BaseModel):
    id: int
    nome: str
    class Config:
        from_attributes = True

class HospitalCreate(BaseModel):
    nome: str
    endereco: Optional[str] = None

class CarenciaCreate(BaseModel):
    descricao: str
    dias: int

class MunicipioCreate(BaseModel):
    nome: str

# --- PREÇOS ---
class FaixaPrecoBase(BaseModel):
    faixa_etaria: str  # Ex: "00-18"
    valor: float

class FaixaPrecoCreate(FaixaPrecoBase):
    pass

# --- PLANO ---
class PlanoBase(BaseModel):
    nome: str
    tipo_contratacao: str  # PF, PJ, Adesão
    acomodacao: str        # Enfermaria, Apartamento
    abrangencia: str       # Nacional, Regional
    coparticipacao: bool
    elegibilidade: Optional[bool] = False
    imagem_coparticipacao_url: Optional[str] = None  # URL da imagem de coparticipação

class PlanoCreate(PlanoBase):
    operadora_id: int
    nome: str
    tipo_contratacao: str
    acomodacao: str
    abrangencia: str
    coparticipacao: bool
    elegibilidade: Optional[bool] = False
    imagem_coparticipacao_url: Optional[str] = None
   
    faixas_preco: List[FaixaPrecoCreate] = []
    hospitais: List[HospitalCreate] = []
    carencias: List[CarenciaCreate] = []
    coparticipacoes: List[CoparticipacaoCreate] = []
    municipios: List[MunicipioCreate] = []

class PlanoResponse(PlanoBase):
    id: int
    nome: str
    operadora_id: Optional[int] = None
    tipo_contratacao: str
    acomodacao: str
    abrangencia: str
    coparticipacao: bool
    imagem_coparticipacao_url: Optional[str] = None
    faixas: List[FaixaPrecoBase] = []
    hospitais: List[HospitalResponse] = []
    carencias: List[CarenciaResponse] = []
    coparticipacoes: List[CoparticipacaoResponse] = []
    municipios: List[MunicipioResponse] = []
    
    class Config:
        from_attributes = True

# --- SCHEMAS DE CÁLCULO/COTAÇÃO ---

class CotacaoRequest(BaseModel):
    idades: list[int]
    operadora_id: int | None = None
    tipo_contratacao: Optional[str] = None
    acomodacao: Optional[str] = None
    abrangencia: Optional[str] = None
    elegibilidade: Optional[bool] = None
    coparticipacao: Optional[bool] = None
    plano_id: Optional[int] = None
    desconto_percentual: Optional[float] = None

class DetalheBeneficiario(BaseModel):
    idade: int
    faixa_etaria_usada: str
    valor: float

class CotacaoResultado(BaseModel):
    plano_id: Optional[int] = None
    operadora: str
    plano: str
    preco_total: float
    beneficiarios: list[DetalheBeneficiario]
    imagem_coparticipacao_url: Optional[str] = None
    hospitais: list[HospitalResponse] = []
    carencias: list[CarenciaResponse] = []
    coparticipacoes: list[CoparticipacaoResponse] = []
    municipios: list[MunicipioResponse] = []
    rede_credenciada_url: Optional[str] = None
