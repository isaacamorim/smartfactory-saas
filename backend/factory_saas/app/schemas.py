from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    admin    = "admin"
    gerente  = "gerente"
    operador = "operador"


# ─── EMPRESA ──────────────────────────────────────────────────────────────────

class EmpresaCreate(BaseModel):
    nome: str
    cnpj: str

class EmpresaUpdate(BaseModel):
    nome: Optional[str] = None
    cnpj: Optional[str] = None

class EmpresaOut(BaseModel):
    id:        int
    nome:      str
    cnpj:      str
    criado_em: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── LINHA ────────────────────────────────────────────────────────────────────

class LinhaCreate(BaseModel):
    nome: str
    # empresa_id é injetado pela rota

class LinhaUpdate(BaseModel):
    nome: Optional[str] = None

class LinhaOut(BaseModel):
    id:         int
    nome:       str
    empresa_id: int
    criado_em:  datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LinhaComMaquinas(LinhaOut):
    maquinas: list["MaquinaOut"] = []

    class Config:
        from_attributes = True


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

class MaquinaCreate(BaseModel):
    linha_id:      int
    serial_number: str
    modelo:        str
    # empresa_id é resolvido automaticamente a partir da linha

class MaquinaUpdate(BaseModel):
    linha_id: Optional[int]  = None
    modelo:   Optional[str]  = None

class MaquinaOut(BaseModel):
    id:            int
    empresa_id:    int
    linha_id:      int
    serial_number: str
    modelo:        str
    criado_em:     datetime
    deleted_at:    Optional[datetime] = None

    class Config:
        from_attributes = True

class MaquinaDetalhe(MaquinaOut):
    """Retorna máquina com nome da linha e empresa embutidos."""
    linha_nome:   Optional[str] = None
    empresa_nome: Optional[str] = None

    class Config:
        from_attributes = True


# ─── USUARIO ──────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    empresa_id: int
    nome:       str
    email:      EmailStr
    senha:      str
    role:       RoleEnum = RoleEnum.operador

class UsuarioUpdate(BaseModel):
    nome:  Optional[str]      = None
    role:  Optional[RoleEnum] = None

class UsuarioOut(BaseModel):
    id:         int
    empresa_id: int
    nome:       str
    email:      str
    role:       RoleEnum
    criado_em:  datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── META OEE ─────────────────────────────────────────────────────────────────

class MetaOEECreate(BaseModel):
    maquina_id:           int
    meta_producao_hora:   float
    meta_disponibilidade: float = 85.0
    meta_performance:     float = 85.0
    meta_qualidade:       float = 98.0

class MetaOEEOut(BaseModel):
    id:                   int
    maquina_id:           int
    meta_producao_hora:   float
    meta_disponibilidade: float
    meta_performance:     float
    meta_qualidade:       float
    atualizado_em:        Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type:   str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    senha: str


# ─── RESPOSTA HIERÁRQUICA ─────────────────────────────────────────────────────

class EmpresaComLinhas(EmpresaOut):
    """Retorna empresa com linhas e máquinas aninhadas."""
    linhas: list[LinhaComMaquinas] = []

    class Config:
        from_attributes = True

LinhaComMaquinas.model_rebuild()
