from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    gerente = "gerente"
    operador = "operador"


# ─── EMPRESA ─────────────────────────────────────────────────────────────────

class EmpresaCreate(BaseModel):
    nome: str
    cnpj: str

class EmpresaOut(BaseModel):
    id: int
    nome: str
    cnpj: str
    criado_em: datetime

    class Config:
        from_attributes = True


# ─── LINHA ────────────────────────────────────────────────────────────────────

class LinhaCreate(BaseModel):
    nome: str
    empresa_id: int

class LinhaOut(BaseModel):
    id: int
    nome: str
    empresa_id: int
    criado_em: datetime

    class Config:
        from_attributes = True


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

class MaquinaCreate(BaseModel):
    empresa_id: int
    linha_id: Optional[int] = None
    serial_number: str
    modelo: str

class MaquinaOut(BaseModel):
    id: int
    empresa_id: int
    linha_id: Optional[int]
    serial_number: str
    modelo: str
    criado_em: datetime

    class Config:
        from_attributes = True


# ─── USUARIO ──────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    empresa_id: int
    nome: str
    email: EmailStr
    senha: str
    role: RoleEnum = RoleEnum.operador

class UsuarioOut(BaseModel):
    id: int
    empresa_id: int
    nome: str
    email: str
    role: RoleEnum
    criado_em: datetime

    class Config:
        from_attributes = True


# ─── META OEE ─────────────────────────────────────────────────────────────────

class MetaOEECreate(BaseModel):
    maquina_id: int
    meta_producao_hora: float
    meta_disponibilidade: float = 85.0
    meta_performance: float = 85.0
    meta_qualidade: float = 98.0

class MetaOEEOut(BaseModel):
    id: int
    maquina_id: int
    meta_producao_hora: float
    meta_disponibilidade: float
    meta_performance: float
    meta_qualidade: float

    class Config:
        from_attributes = True


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    senha: str
