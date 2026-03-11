from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.models import Usuario

router = APIRouter(prefix="/maquinas", tags=["Máquinas"])


@router.get("/empresa/{empresa_id}", response_model=list[schemas.MaquinaOut])
def listar_maquinas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas as máquinas ativas de uma empresa."""
    return crud.get_maquinas_por_empresa(db, empresa_id)


@router.get("/serial/{serial}", response_model=schemas.MaquinaOut)
def obter_por_serial(
    serial: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    maquina = crud.get_maquina_by_serial(db, serial)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return maquina


@router.get("/{maquina_id}", response_model=schemas.MaquinaOut)
def obter_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return maquina


@router.post("/", response_model=schemas.MaquinaOut, status_code=201)
def criar_maquina(
    data: schemas.MaquinaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cadastra máquina vinculada a uma linha.
    empresa_id é resolvido automaticamente a partir da linha.
    """
    if crud.get_maquina_by_serial(db, data.serial_number):
        raise HTTPException(status_code=400, detail="Serial já cadastrado")
    maquina = crud.create_maquina(db, data)
    if not maquina:
        raise HTTPException(status_code=404, detail="Linha não encontrada")
    return maquina


@router.put("/{maquina_id}", response_model=schemas.MaquinaOut)
def atualizar_maquina(
    maquina_id: int,
    data: schemas.MaquinaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    maquina = crud.update_maquina(db, maquina_id, data)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return maquina


@router.delete("/{maquina_id}", status_code=204)
def deletar_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Soft delete: preenche deleted_at."""
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
    data: schemas.MetaOEECreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cria ou atualiza metas de OEE de uma máquina (upsert)."""
    return crud.upsert_meta_oee(db, data)
