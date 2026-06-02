# app/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
    id:         int
    nome:       str
    cnpj:       str
    criado_em:  datetime
    deleted_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# ─── LINHA ────────────────────────────────────────────────────────────────────

class LinhaCreate(BaseModel):
    nome: str

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
    maquinas: List["MaquinaOut"] = []
    class Config:
        from_attributes = True


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

class MaquinaCreate(BaseModel):
    linha_id:      int
    serial_number: str
    modelo:        str

class MaquinaUpdate(BaseModel):
    linha_id: Optional[int] = None
    modelo:   Optional[str] = None

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


# ─── USUARIO ──────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    empresa_id: Optional[int] = None   # None para admin
    nome:       str
    email:      EmailStr
    senha:      str
    role:       RoleEnum = RoleEnum.operador

class UsuarioUpdate(BaseModel):
    nome:  Optional[str]      = None
    role:  Optional[RoleEnum] = None

class UsuarioOut(BaseModel):
    id:         int
    empresa_id: Optional[int]
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
    access_token:  str
    token_type:    str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    senha: str

class LoginResponse(BaseModel):
    """Retorna token + dados do usuário logado para o frontend."""
    access_token: str
    token_type:   str
    usuario:      UsuarioOut


# ─── HIERARQUIA ───────────────────────────────────────────────────────────────

class EmpresaComLinhas(EmpresaOut):
    linhas: List[LinhaComMaquinas] = []
    class Config:
        from_attributes = True

LinhaComMaquinas.model_rebuild()


# ─── COLE NO FINAL DE app/schemas.py ─────────────────────────────────────────
# Não alterar nada acima. Apenas adicionar esses schemas.

from typing import Optional, List
from pydantic import BaseModel

# ─── ESTADO INDUSTRIAL DA MÁQUINA ─────────────────────────────────────────────
# ciclo=1 → PRODUZINDO | auto=1 → PRONTA | manual=1 → MANUAL | offline → OFFLINE


class MaquinaResumoOut(BaseModel):
    """Resumo de uma máquina para cards e listas."""

    serial: str
    modelo: str
    online: bool
    estado: str  # PRODUZINDO | PRONTA | MANUAL | OFFLINE
    vel: float
    pac_min: float
    prod_turno: float
    total: float
    turno_atual: int
    oee: float
    performance: float
    qualidade: float
    disponibilidade: float


class LinhaResumoOut(BaseModel):
    """Resumo de uma linha para o dashboard de empresa."""

    linha_id: int
    nome: str
    machines_total: int
    machines_online: int
    machines_offline: int
    oee_medio: float
    producao_total: float
    vel_media: float
    maquinas: List[MaquinaResumoOut] = []


class AlertaOut(BaseModel):
    machine: str
    tipo: str
    severity: str
    mensagem: str


# ─── DASHBOARD EMPRESA ────────────────────────────────────────────────────────


class TurnosEmpresaOut(BaseModel):
    t1_total: float
    t2_total: float
    t3_total: float
    turno_ativo: int  # turno com mais máquinas ativas (1, 2 ou 3)


class EmpresaDashboardOut(BaseModel):
    empresa_id: int
    nome: str
    machines_total: int
    machines_online: int
    machines_offline: int
    oee_medio: float
    producao_total: float
    vel_media: float
    turnos: TurnosEmpresaOut
    linhas: List[LinhaResumoOut] = []
    alertas: List[AlertaOut] = []


# ─── DASHBOARD LINHA ──────────────────────────────────────────────────────────


class LinhaDashboardOut(BaseModel):
    linha_id: int
    nome: str
    empresa_id: int
    machines_total: int
    machines_online: int
    machines_offline: int
    oee_medio: float
    producao_total: float
    vel_media: float
    maquinas: List[MaquinaResumoOut] = []


# ─── DASHBOARD MÁQUINA ────────────────────────────────────────────────────────


class MetaOEEResumoOut(BaseModel):
    meta_producao_hora: float
    meta_disponibilidade: float
    meta_performance: float
    meta_qualidade: float


class MaquinaDashboardOut(BaseModel):
    # identidade
    maquina_id: int
    serial: str
    modelo: str
    linha_id: int
    empresa_id: int

    # estado
    online: bool
    estado: str  # PRODUZINDO | PRONTA | MANUAL | OFFLINE

    # produção
    vel: float
    pac_min: float
    prod_turno: float
    total: float
    turno_atual: int
    t1: float
    t2: float
    t3: float

    # qualidade
    ok: float
    nok: float

    # OEE
    oee: float
    disponibilidade: float
    performance: float
    qualidade: float

    # pesagem
    peso_atual: float  # liq_scaime / 10 em kg
    peso_medio: float  # media em g
    peso_min: float
    peso_max: float
    estavel: bool
    tol_min: float
    tol_max: float
    peso_ref: float

    # forecast
    previsao_turno: float
    media_hora: float

    # metas do Postgres
    meta: Optional[MetaOEEResumoOut] = None
