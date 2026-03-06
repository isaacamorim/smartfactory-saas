from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class RoleEnum(str, enum.Enum):
    admin = "admin"
    gerente = "gerente"
    operador = "operador"


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cnpj = Column(String, unique=True, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    linhas = relationship("Linha", back_populates="empresa", cascade="all, delete")
    maquinas = relationship("Maquina", back_populates="empresa", cascade="all, delete")
    usuarios = relationship("Usuario", back_populates="empresa", cascade="all, delete")


class Linha(Base):
    __tablename__ = "linhas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nome = Column(String, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    empresa = relationship("Empresa", back_populates="linhas")
    maquinas = relationship("Maquina", back_populates="linha")


class Maquina(Base):
    __tablename__ = "maquinas"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    linha_id = Column(Integer, ForeignKey("linhas.id"), nullable=True)
    serial_number = Column(String, unique=True, nullable=False)
    modelo = Column(String, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    empresa = relationship("Empresa", back_populates="maquinas")
    linha = relationship("Linha", back_populates="maquinas")
    meta = relationship("MetaOEE", back_populates="maquina", uselist=False)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.operador)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    empresa = relationship("Empresa", back_populates="usuarios")


class MetaOEE(Base):
    __tablename__ = "metas_oee"

    id = Column(Integer, primary_key=True, index=True)
    maquina_id = Column(Integer, ForeignKey("maquinas.id"), nullable=False, unique=True)
    meta_producao_hora = Column(Float, nullable=False, default=0)
    meta_disponibilidade = Column(Float, nullable=False, default=85.0)
    meta_performance = Column(Float, nullable=False, default=85.0)
    meta_qualidade = Column(Float, nullable=False, default=98.0)
    atualizado_em = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    maquina = relationship("Maquina", back_populates="meta")
