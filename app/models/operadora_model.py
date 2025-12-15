from sqlalchemy import Column, Integer, String
from app.db.database import Base  # <--- Importando do lugar certo agora!
from sqlalchemy.orm import relationship

class Operadora(Base):
    __tablename__ = "operadoras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    rede_credenciada_url = Column(String, nullable=True)
    
    #Relacionamento: uma operadora pode ter muitos planos
    planos = relationship("Plano", back_populates="operadora_rel")