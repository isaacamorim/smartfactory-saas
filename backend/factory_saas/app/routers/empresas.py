from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.models import Usuario
from typing import List

router = APIRouter(prefix="/empresas", tags=["Empresas"])


@router.get("/", response_model=List[schemas.EmpresaOut])
def listar_empresas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas as empresas cadastradas."""
    return crud.get_empresas(db)


@router.get("/{empresa_id}", response_model=schemas.EmpresaOut)
def obter_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.post("/", response_model=schemas.EmpresaOut, status_code=201)
def criar_empresa(
    empresa: schemas.EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cadastra uma nova empresa."""
    return crud.create_empresa(db, empresa)


@router.delete("/{empresa_id}", status_code=204)
def deletar_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = crud.delete_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")


# ─── LINHAS (sub-recurso de empresa) ─────────────────────────────────────────

@router.get("/{empresa_id}/linhas", response_model=List[schemas.LinhaOut])
def listar_linhas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return crud.get_linhas(db, empresa_id)


@router.post("/{empresa_id}/linhas", response_model=schemas.LinhaOut, status_code=201)
def criar_linha(
    empresa_id: int,
    linha: schemas.LinhaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    linha.empresa_id = empresa_id
    return crud.create_linha(db, linha)
