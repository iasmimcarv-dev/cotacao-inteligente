from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class Plano(Base):
    __tablename__ = "planos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True) # Ex: Essencial, Master PJ
    
    # RELACIONAMENTOS (FKs)
    operadora_id = Column(Integer, ForeignKey("operadoras.id")) 
    
    # FILTROS PRINCIPAIS (DO SEU EXCEL)
    tipo_contratacao = Column(String, index=True) # Ex: PF, PJ, Adesão
    acomodacao = Column(String, index=True)      # Ex: Enfermaria, Apartamento
    abrangencia = Column(String, index=True)     # Ex: Local, Regional, Nacional
    coparticipacao = Column(Boolean)             # Sim/Não
    elegibilidade = Column(Boolean, default=False, nullable=True) # Possui elegibilidade
    imagem_coparticipacao_url = Column(String, nullable=True)  # URL da imagem de coparticipação (ex: para Adesão "Fácil")
    
    # Relacionamentos com o restante das tabelas
    operadora_rel = relationship("Operadora", back_populates="planos")
    faixas = relationship("FaixaPreco", back_populates="plano_rel")
    hospitais = relationship("Hospital", back_populates="plano_rel")
    carencias = relationship("Carencia", back_populates="plano_rel")
    coparticipacoes = relationship("Coparticipacao", back_populates="plano_rel")
    municipios = relationship("Municipio", back_populates="plano_rel")
    # guias = relationship("GuiaProposta", back_populates="plano_rel")  # Desabilitado: plano_id não existe no banco