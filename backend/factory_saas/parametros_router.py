# factory_saas/parametros_router.py

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime, text
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db, Base
from app.auth import get_current_user, require_gerente_ou_admin, verificar_acesso_empresa
from app import crud
from app.models import Usuario

router = APIRouter(prefix="/parametros", tags=["Parâmetros CLP"])


# ─── MODEL ────────────────────────────────────────────────────────────────────

class ParametrosMaquina(Base):
    __tablename__ = "parametros_maquina"

    id                     = Column(Integer, primary_key=True, index=True)
    maquina_id             = Column(Integer, ForeignKey("maquinas.id"), nullable=False)

    temp_horizontal        = Column(Float,   nullable=False, default=35.0)
    temp_vertical          = Column(Float,   nullable=False, default=30.0)

    sel_pesagem            = Column(Boolean, nullable=False, default=False)
    sel_fim_produto        = Column(Boolean, nullable=False, default=False)
    sel_fim_fita           = Column(Boolean, nullable=False, default=False)
    sel_fim_embalagem      = Column(Boolean, nullable=False, default=False)
    sel_emerg_enfardadeira = Column(Boolean, nullable=False, default=False)
    sel_pacote_vazio       = Column(Boolean, nullable=False, default=False)
    sel_inv_rs485          = Column(Boolean, nullable=False, default=False)
    sel_reserva_q12        = Column(Boolean, nullable=False, default=False)
    sel_reserva_q13        = Column(Boolean, nullable=False, default=False)

    tipo_dosador           = Column(Integer, nullable=False, default=1)

    sel_datador            = Column(Boolean, nullable=False, default=True)
    sel_temp_datador       = Column(Boolean, nullable=False, default=False)

    vel_motor_rpm          = Column(Float,   nullable=False, default=1720.0)
    relacao_reducao        = Column(Float,   nullable=False, default=30.85)
    pacotes_min            = Column(Float,   nullable=False, default=40.0)

    ang_datador_ini        = Column(Integer, nullable=False, default=110)
    ang_datador_fim        = Column(Integer, nullable=False, default=150)
    ang_solda_v_ini        = Column(Integer, nullable=False, default=320)
    ang_solda_v_fim        = Column(Integer, nullable=False, default=100)
    ang_pulso_sv_ini       = Column(Integer, nullable=False, default=300)
    ang_solda_h_ini        = Column(Integer, nullable=False, default=160)
    ang_solda_h_fim        = Column(Integer, nullable=False, default=220)
    ang_pulso_sh_ini       = Column(Integer, nullable=False, default=150)
    ang_esfr_h_ini         = Column(Integer, nullable=False, default=200)
    ang_esfr_h_fim         = Column(Integer, nullable=False, default=320)

    ang_dos_rot_ini        = Column(Integer, nullable=False, default=0)
    ang_dos_rot_fim        = Column(Integer, nullable=False, default=1)
    ang_gav_sup_ini        = Column(Integer, nullable=False, default=180)
    ang_gav_sup_fim        = Column(Float,   nullable=False, default=0.5)
    ang_gav_inf_ini        = Column(Integer, nullable=False, default=30)
    ang_gav_inf_fim        = Column(Float,   nullable=False, default=0.3)
    ang_abre_fecha_ini     = Column(Integer, nullable=False, default=90)
    ang_abre_fecha_fim     = Column(Integer, nullable=False, default=350)
    ang_q15_ini            = Column(Integer, nullable=False, default=0)
    ang_q15_fim            = Column(Float,   nullable=False, default=0.0)
    ang_alim_ini           = Column(Integer, nullable=False, default=0)
    ang_fim_ciclo          = Column(Integer, nullable=False, default=50)
    ang_esteira_fim        = Column(Float,   nullable=False, default=0.0)

    criado_em              = Column(DateTime(timezone=True), server_default=text("NOW()"))
    atualizado_em          = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=datetime.now)
    deleted_at             = Column(DateTime(timezone=True), nullable=True, default=None)


# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class ParametrosSchema(BaseModel):
    maquina_id:             int

    temp_horizontal:        float   = 35.0
    temp_vertical:          float   = 30.0

    sel_pesagem:            bool    = False
    sel_fim_produto:        bool    = False
    sel_fim_fita:           bool    = False
    sel_fim_embalagem:      bool    = False
    sel_emerg_enfardadeira: bool    = False
    sel_pacote_vazio:       bool    = False
    sel_inv_rs485:          bool    = False
    sel_reserva_q12:        bool    = False
    sel_reserva_q13:        bool    = False

    tipo_dosador:           int     = 1

    sel_datador:            bool    = True
    sel_temp_datador:       bool    = False

    vel_motor_rpm:          float   = 1720.0
    relacao_reducao:        float   = 30.85
    pacotes_min:            float   = 40.0

    ang_datador_ini:        int     = 110
    ang_datador_fim:        int     = 150
    ang_solda_v_ini:        int     = 320
    ang_solda_v_fim:        int     = 100
    ang_pulso_sv_ini:       int     = 300
    ang_solda_h_ini:        int     = 160
    ang_solda_h_fim:        int     = 220
    ang_pulso_sh_ini:       int     = 150
    ang_esfr_h_ini:         int     = 200
    ang_esfr_h_fim:         int     = 320

    ang_dos_rot_ini:        int     = 0
    ang_dos_rot_fim:        int     = 1
    ang_gav_sup_ini:        int     = 180
    ang_gav_sup_fim:        float   = 0.5
    ang_gav_inf_ini:        int     = 30
    ang_gav_inf_fim:        float   = 0.3
    ang_abre_fecha_ini:     int     = 90
    ang_abre_fecha_fim:     int     = 350
    ang_q15_ini:            int     = 0
    ang_q15_fim:            float   = 0.0
    ang_alim_ini:           int     = 0
    ang_fim_ciclo:          int     = 50
    ang_esteira_fim:        float   = 0.0

    class Config:
        from_attributes = True

class ParametrosOut(ParametrosSchema):
    id:           int
    criado_em:    Optional[datetime]  = None
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _get_parametros(db: Session, maquina_id: int) -> Optional[ParametrosMaquina]:
    return db.query(ParametrosMaquina).filter(
        ParametrosMaquina.maquina_id == maquina_id,
        ParametrosMaquina.deleted_at == None,
    ).first()


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.get("/maquina/{maquina_id}", response_model=ParametrosOut)
def obter_parametros(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna os parâmetros salvos de uma máquina."""
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)

    params = _get_parametros(db, maquina_id)
    if not params:
        raise HTTPException(status_code=404, detail="Parâmetros não configurados para esta máquina")
    return params


@router.post("/maquina/{maquina_id}", response_model=ParametrosOut)
def salvar_parametros(
    maquina_id: int,
    data: ParametrosSchema,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    """
    Cria ou atualiza os parâmetros de uma máquina (upsert).
    Gerente e Admin podem salvar.
    """
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)

    data.maquina_id = maquina_id
    params = _get_parametros(db, maquina_id)

    if params:
        # Atualizar campos existentes
        for key, value in data.model_dump(exclude={"maquina_id"}).items():
            setattr(params, key, value)
        params.atualizado_em = datetime.now(timezone.utc)
    else:
        params = ParametrosMaquina(**data.model_dump())
        db.add(params)

    db.commit()
    db.refresh(params)
    return params
