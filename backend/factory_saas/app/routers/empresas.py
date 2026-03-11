from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user, require_admin, require_gerente_ou_admin, verificar_acesso_empresa
from app.models import Usuario

router = APIRouter(prefix="/empresas", tags=["Empresas"])


# ─── EMPRESAS ─────────────────────────────────────────────────────────────────
# Apenas admin gerencia empresas

@router.get("/", response_model=List[schemas.EmpresaOut])
def listar_empresas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Admin: retorna todas as empresas.
    Gerente/Operador: retorna apenas a própria empresa.
    """
    if current_user.role == "admin":
        return crud.get_empresas(db)
    if not current_user.empresa_id:
        return []
    emp = crud.get_empresa(db, current_user.empresa_id)
    return [emp] if emp else []


@router.get("/{empresa_id}", response_model=schemas.EmpresaOut)
def obter_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    verificar_acesso_empresa(empresa_id, current_user)
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.get("/{empresa_id}/completo", response_model=schemas.EmpresaComLinhas)
def obter_empresa_completo(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Empresa com linhas e máquinas aninhadas."""
    verificar_acesso_empresa(empresa_id, current_user)
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.post("/", response_model=schemas.EmpresaOut, status_code=201)
def criar_empresa(
    data: schemas.EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    """Somente admin cria empresas."""
    return crud.create_empresa(db, data)


@router.put("/{empresa_id}", response_model=schemas.EmpresaOut)
def atualizar_empresa(
    empresa_id: int,
    data: schemas.EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    empresa = crud.update_empresa(db, empresa_id, data)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa


@router.delete("/{empresa_id}", status_code=204)
def deletar_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    if not crud.delete_empresa(db, empresa_id):
        raise HTTPException(status_code=404, detail="Empresa não encontrada")


# ─── LINHAS ───────────────────────────────────────────────────────────────────
# Gerente pode criar/editar linhas da própria empresa. Admin pode tudo.

@router.get("/{empresa_id}/linhas", response_model=List[schemas.LinhaOut])
def listar_linhas(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    verificar_acesso_empresa(empresa_id, current_user)
    return crud.get_linhas(db, empresa_id)


@router.post("/{empresa_id}/linhas", response_model=schemas.LinhaOut, status_code=201)
def criar_linha(
    empresa_id: int,
    data: schemas.LinhaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    verificar_acesso_empresa(empresa_id, current_user)
    if not crud.get_empresa(db, empresa_id):
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return crud.create_linha(db, empresa_id, data)


@router.put("/{empresa_id}/linhas/{linha_id}", response_model=schemas.LinhaOut)
def atualizar_linha(
    empresa_id: int,
    linha_id: int,
    data: schemas.LinhaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    verificar_acesso_empresa(empresa_id, current_user)
    linha = crud.update_linha(db, linha_id, data)
    if not linha:
        raise HTTPException(status_code=404, detail="Linha não encontrada")
    return linha


@router.delete("/{empresa_id}/linhas/{linha_id}", status_code=204)
def deletar_linha(
    empresa_id: int,
    linha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    verificar_acesso_empresa(empresa_id, current_user)
    if not crud.delete_linha(db, linha_id):
        raise HTTPException(status_code=404, detail="Linha não encontrada")


@router.get("/{empresa_id}/linhas/{linha_id}/maquinas", response_model=List[schemas.MaquinaOut])
def listar_maquinas_da_linha(
    empresa_id: int,
    linha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    verificar_acesso_empresa(empresa_id, current_user)
    return crud.get_maquinas_por_linha(db, linha_id)
