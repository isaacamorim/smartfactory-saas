# app/routers/empresas.py

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


# ═══════════════════════════════════════════════════════════════════════════════
# PARTE A — COLE NO FINAL DE app/routers/empresas.py
# ═══════════════════════════════════════════════════════════════════════════════
# Imports adicionais que precisam estar no topo do empresas.py:
#
#   from app.services.metrics_service import build_empresa_dashboard, build_linha_dashboard
#   from app import crud
#   from app.database import get_db
#   from sqlalchemy.orm import Session
#
# Se já existirem, não duplicar.

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import Usuario
from app import crud
from app.services.metrics_service import build_empresa_dashboard, build_linha_dashboard

# ─── GET /empresa/{empresa_id}/dashboard ──────────────────────────────────────


@router.get("/{empresa_id}/dashboard")
def dashboard_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Dashboard agregado de uma empresa.
    Segurança: admin vê qualquer empresa; gerente/operador só vê a própria.
    """
    # Verificação de acesso
    if current_user.role != "admin" and current_user.empresa_id != empresa_id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Empresa existe?
    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    # Monta estrutura linhas → serials para o service
    linhas_db = crud.get_linhas(db, empresa_id)
    linhas_data = []

    for linha in linhas_db:
        maquinas = crud.get_maquinas_por_linha(db, linha.id)
        serials = [m.serial_number for m in maquinas if m.deleted_at is None]
        linhas_data.append(
            {
                "linha_id": linha.id,
                "nome": linha.nome,
                "serials": serials,
            }
        )

    return build_empresa_dashboard(
        empresa_id=empresa_id,
        nome=empresa.nome,
        linhas_data=linhas_data,
    )


# ─── GET /empresa/{empresa_id}/linhas/{linha_id}/dashboard ────────────────────


@router.get("/{empresa_id}/linhas/{linha_id}/dashboard")
def dashboard_linha(
    empresa_id: int,
    linha_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Dashboard de uma linha específica dentro da empresa.
    """
    # Verificação de acesso
    if current_user.role != "admin" and current_user.empresa_id != empresa_id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    empresa = crud.get_empresa(db, empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    linha = crud.get_linha(db, linha_id)
    if not linha or linha.empresa_id != empresa_id:
        raise HTTPException(status_code=404, detail="Linha não encontrada")

    maquinas = crud.get_maquinas_por_linha(db, linha_id)
    serials = [m.serial_number for m in maquinas if m.deleted_at is None]

    return build_linha_dashboard(
        linha_id=linha_id,
        nome=linha.nome,
        empresa_id=empresa_id,
        serials=serials,
    )


