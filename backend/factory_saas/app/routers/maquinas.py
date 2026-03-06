from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.models import Usuario
from typing import List

router = APIRouter(prefix="/maquinas", tags=["Máquinas"])


@router.get("/empresa/{empresa_id}", response_model=List[schemas.MaquinaOut])
def listar_maquinas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas as máquinas de uma empresa."""
    return crud.get_maquinas(db, empresa_id)


@router.get("/serial/{serial}", response_model=schemas.MaquinaOut)
def obter_por_serial(
    serial: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Busca uma máquina pelo serial number."""
    maquina = crud.get_maquina_by_serial(db, serial)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return maquina


@router.post("/", response_model=schemas.MaquinaOut, status_code=201)
def criar_maquina(
    maquina: schemas.MaquinaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cadastra nova máquina e vincula ao serial.
    A partir daqui, dados MQTT com esse serial são associados à empresa.
    """
    existente = crud.get_maquina_by_serial(db, maquina.serial_number)
    if existente:
        raise HTTPException(status_code=400, detail="Serial já cadastrado")
    return crud.create_maquina(db, maquina)


@router.delete("/{maquina_id}", status_code=204)
def deletar_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    maquina = crud.delete_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")


# ─── METAS OEE ────────────────────────────────────────────────────────────────

@router.get("/{maquina_id}/meta", response_model=schemas.MetaOEEOut)
def obter_meta(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    meta = crud.get_meta_oee(db, maquina_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Meta não definida para esta máquina")
    return meta


@router.post("/meta", response_model=schemas.MetaOEEOut, status_code=201)
def definir_meta(
    meta: schemas.MetaOEECreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cria ou atualiza as metas de OEE de uma máquina."""
    return crud.upsert_meta_oee(db, meta)
