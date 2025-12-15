from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class FaixaPreco(Base):
    __tablename__ = "faixas_preco"

    id = Column(Integer, primary_key=True, index=True)
    plano_id = Column(Integer, ForeignKey("planos.id"))
    
    faixa_etaria = Column(String, index=True) # Ex: 00-18, 19-23
    valor = Column(Float)
    
    plano_rel = relationship("Plano", back_populates="faixas")