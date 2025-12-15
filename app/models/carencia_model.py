from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class Carencia(Base):
    __tablename__ = "carencias"

    id = Column(Integer, primary_key=True, index=True)
    plano_id = Column(Integer, ForeignKey("planos.id"))
    
    descricao = Column(String) # Ex: Urgência e Emergência
    dias = Column(Integer)     # Ex: 24h, 30, 180
    
    plano_rel = relationship("Plano", back_populates="carencias")