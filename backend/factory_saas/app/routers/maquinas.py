# app/routers/maquinas.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user, require_admin, require_gerente_ou_admin, verificar_acesso_empresa
from app.models import Usuario
from app.services.metrics_service import build_maquina_resumo

router = APIRouter(prefix="/maquinas", tags=["Máquinas"])


@router.get("/empresa/{empresa_id}", response_model=List[schemas.MaquinaOut])
def listar_maquinas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    verificar_acesso_empresa(empresa_id, current_user)
    return crud.get_maquinas_por_empresa(db, empresa_id)


@router.get("/serial/{serial}", response_model=schemas.MaquinaOut)
def obter_por_serial(
    serial: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    maquina = crud.get_maquina_by_serial(db, serial)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)
    return maquina


@router.get("/{maquina_id}", response_model=schemas.MaquinaOut)
def obter_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)
    return maquina


@router.post("/", response_model=schemas.MaquinaOut, status_code=201)
def criar_maquina(
    data: schemas.MaquinaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),  # só admin cadastra máquinas novas
):
    """
    Apenas admin cadastra máquinas.
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
    current_user: Usuario = Depends(require_gerente_ou_admin),  # gerente pode trocar de linha
):
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)
    return crud.update_maquina(db, maquina_id, data)


@router.delete("/{maquina_id}", status_code=204)
def deletar_maquina(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),  # só admin desativa máquinas
):
    if not crud.delete_maquina(db, maquina_id):
        raise HTTPException(status_code=404, detail="Máquina não encontrada")


# ─── METAS OEE — gerente pode definir metas ───────────────────────────────────

@router.get("/{maquina_id}/meta", response_model=schemas.MetaOEEOut)
def obter_meta(
    maquina_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)
    meta = crud.get_meta_oee(db, maquina_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Meta não definida para esta máquina")
    return meta


@router.post("/meta", response_model=schemas.MetaOEEOut, status_code=201)
def definir_meta(
    data: schemas.MetaOEECreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    """Gerente e admin podem definir/atualizar metas OEE."""
    maquina = crud.get_maquina(db, data.maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    verificar_acesso_empresa(maquina.empresa_id, current_user)
    return crud.upsert_meta_oee(db, data)


# ═══════════════════════════════════════════════════════════════════════════════
# PARTE B — COLE NO FINAL DE app/routers/maquinas.py
# ═══════════════════════════════════════════════════════════════════════════════


@router.get("/{maquina_id}/dashboard")
def dashboard_maquina(
    maquina_id:   int,
    db:           Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Dashboard completo de uma máquina individual.
    Inclui métricas realtime + metas OEE do Postgres.
    """
    maquina = crud.get_maquina(db, maquina_id)
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")

    # Verificação de acesso
    if current_user.role != "admin" and current_user.empresa_id != maquina.empresa_id:
            raise HTTPException(status_code=403, detail="Acesso negado")

    # Métricas realtime do Influx
    resumo = build_maquina_resumo(maquina.serial_number)

    # Meta OEE do Postgres
    meta_db = crud.get_meta_oee(db, maquina_id)
    meta = None
    if meta_db:
        meta = {
            "meta_producao_hora":   meta_db.meta_producao_hora,
            "meta_disponibilidade": meta_db.meta_disponibilidade,
            "meta_performance":     meta_db.meta_performance,
            "meta_qualidade":       meta_db.meta_qualidade,
        }

    return {
        "maquina_id": maquina_id,
        "modelo":     maquina.modelo,
        "linha_id":   maquina.linha_id,
        "empresa_id": maquina.empresa_id,
        **resumo,
        "meta": meta,
    }
