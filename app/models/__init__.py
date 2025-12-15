# Importar todos os modelos para assegurar que as relações são registradas
from app.models.operadora_model import Operadora
from app.models.plano_model import Plano
from app.models.faixa_preco_model import FaixaPreco
from app.models.hospital_model import Hospital, Municipio
from app.models.carencia_model import Carencia
from app.models.coparticipacao_model import Coparticipacao
from app.models.guia_model import GuiaProposta

__all__ = [
    "Operadora",
    "Plano",
    "FaixaPreco",
    "Hospital",
    "Municipio",
    "Carencia",
    "Coparticipacao",
    "GuiaProposta",
]
