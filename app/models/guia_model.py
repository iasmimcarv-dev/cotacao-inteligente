from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

# <--- Importando do lugar certo agora!

class GuiaProposta(Base):
    __tablename__ = "guias_proposta"

    id = Column(Integer, primary_key=True, index=True)
    operadora = Column(String, index=True)
    tipo_plano = Column(String, index=True)
    titulo = Column(String)
    conteudo = Column(Text)
    data_atualizacao = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    plano_id = Column(Integer, ForeignKey("planos.id"))
    # plano_rel = relationship("Plano", back_populates="guias")  # Desabilitado: plano_id não existe no banco