from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.models import Usuario

router = APIRouter(prefix="/empresas", tags=["Empresas"])


# ─── EMPRESAS ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.EmpresaOut])
def listar_empresas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas as empresas ativas (deleted_at IS NULL)."""
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


@router.get("/{empresa_id}/completo", response_model=schemas.EmpresaComLinhas)
def obter_empresa_com_linhas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna empresa com todas as linhas e máquinas aninhadas."""
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.post("/", response_model=schemas.EmpresaOut, status_code=201)
def criar_empresa(
    data: schemas.EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cadastra uma nova empresa."""
    return crud.create_empresa(db, data)


@router.put("/{empresa_id}", response_model=schemas.EmpresaOut)
def atualizar_empresa(
    empresa_id: int,
    data: schemas.EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = crud.update_empresa(db, empresa_id, data)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.delete("/{empresa_id}", status_code=204)
def deletar_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Soft delete: preenche deleted_at, não remove do banco."""
    empresa = crud.delete_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")


# ─── LINHAS (sub-recurso de empresa) ──────────────────────────────────────────

@router.get("/{empresa_id}/linhas", response_model=list[schemas.LinhaOut])
def listar_linhas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista linhas ativas de uma empresa."""
    return crud.get_linhas(db, empresa_id)


@router.post("/{empresa_id}/linhas", response_model=schemas.LinhaOut, status_code=201)
def criar_linha(
    empresa_id: int,
    data: schemas.LinhaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return crud.create_linha(db, empresa_id, data)


@router.put("/{empresa_id}/linhas/{linha_id}", response_model=schemas.LinhaOut)
def atualizar_linha(
    empresa_id: int,
    linha_id: int,
    data: schemas.LinhaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    linha = crud.update_linha(db, linha_id, data)
    if not linha:
        raise HTTPException(status_code=404, detail="Linha não encontrada")
    return linha


@router.delete("/{empresa_id}/linhas/{linha_id}", status_code=204)
def deletar_linha(
    empresa_id: int,
    linha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Soft delete da linha."""
    linha = crud.delete_linha(db, linha_id)
    if not linha:
        raise HTTPException(status_code=404, detail="Linha não encontrada")


# ─── MÁQUINAS (sub-recurso de linha dentro de empresa) ────────────────────────

@router.get("/{empresa_id}/linhas/{linha_id}/maquinas", response_model=list[schemas.MaquinaOut])
def listar_maquinas_da_linha(
    empresa_id: int,
    linha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista máquinas ativas de uma linha específica."""
    return crud.get_maquinas_por_linha(db, linha_id)
