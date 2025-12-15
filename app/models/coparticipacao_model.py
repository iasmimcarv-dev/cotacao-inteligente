from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.db.database import Base
from sqlalchemy.orm import relationship

class Coparticipacao(Base):
    __tablename__ = "coparticipacoes"

    id = Column(Integer, primary_key=True, index=True)
    plano_id = Column(Integer, ForeignKey("planos.id"), nullable=False)
    
    # Nome/descrição da coparticipação (Ex: Consulta, Internação, Exame, etc)
    nome = Column(String, nullable=True)  # Nome descritivo
    tipo_plano = Column(String, nullable=True)  # Ex: PF, PJ, Adesão, etc (opcional)
    imagem_url = Column(String, nullable=True)  # URL da imagem de coparticipação
    
    # Dados da coparticipação
    tipo_servico = Column(String, nullable=True)  # Ex: Consulta, Internação, Exame
    percentual = Column(Float, nullable=True)  # Ex: 20 (para 20%)
    valor_minimo = Column(Float, nullable=True)  # Ex: 50.00
    valor_maximo = Column(Float, nullable=True)  # Ex: 500.00 (ou NULL para sem limite)

    # Relacionamento com Plano
    plano_rel = relationship("Plano", back_populates="coparticipacoes")
