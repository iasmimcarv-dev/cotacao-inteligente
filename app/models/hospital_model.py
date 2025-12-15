from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class Hospital(Base):
    __tablename__ = "hospitais"

    id = Column(Integer, primary_key=True, index=True)
    plano_id = Column(Integer, ForeignKey("planos.id"))
    nome = Column(String)
    endereco = Column(String, nullable=True)
    
    plano_rel = relationship("Plano", back_populates="hospitais")

class Municipio(Base):
    __tablename__ = "municipios_abrangidos"

    id = Column(Integer, primary_key=True, index=True)
    plano_id = Column(Integer, ForeignKey("planos.id"))
    nome = Column(String, index=True)
    
    plano_rel = relationship("Plano", back_populates="municipios")