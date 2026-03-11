from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user, require_admin, require_gerente_ou_admin, verificar_acesso_empresa
from app.models import Usuario, RoleEnum

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("/empresa/{empresa_id}", response_model=List[schemas.UsuarioOut])
def listar_usuarios(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    verificar_acesso_empresa(empresa_id, current_user)
    return crud.get_usuarios(db, empresa_id)


@router.post("/", response_model=schemas.UsuarioOut, status_code=201)
def criar_usuario(
    data: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    """
    Admin: pode criar qualquer role (incluindo gerente) para qualquer empresa.
    Gerente: pode criar apenas operadores da própria empresa.
             Não pode criar gerentes nem admins.
    """
    # Gerente só cria para a própria empresa
    if current_user.role == RoleEnum.gerente:
        if data.empresa_id != current_user.empresa_id:
            raise HTTPException(status_code=403, detail="Gerente só pode criar usuários para a própria empresa")
        if data.role in (RoleEnum.gerente, RoleEnum.admin):
            raise HTTPException(status_code=403, detail="Gerente só pode criar operadores")

    # Admin criando gerente — empresa_id obrigatório
    if data.role == RoleEnum.gerente and not data.empresa_id:
        raise HTTPException(status_code=400, detail="Gerente precisa estar vinculado a uma empresa")

    if crud.get_usuario_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    return crud.create_usuario(db, data)


@router.put("/{usuario_id}", response_model=schemas.UsuarioOut)
def atualizar_usuario(
    usuario_id: int,
    data: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Gerente só edita usuários da própria empresa
    if current_user.role == RoleEnum.gerente:
        if usuario.empresa_id != current_user.empresa_id:
            raise HTTPException(status_code=403, detail="Acesso negado")
        if data.role in (RoleEnum.gerente, RoleEnum.admin):
            raise HTTPException(status_code=403, detail="Gerente não pode promover usuários")

    resultado = crud.update_usuario(db, usuario_id, data)
    return resultado


@router.delete("/{usuario_id}", status_code=204)
def deletar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_gerente_ou_admin),
):
    usuario = crud.get_usuario_by_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if current_user.role == RoleEnum.gerente:
        if usuario.empresa_id != current_user.empresa_id:
            raise HTTPException(status_code=403, detail="Acesso negado")
        if usuario.role != RoleEnum.operador:
            raise HTTPException(status_code=403, detail="Gerente só pode desativar operadores")

    if not crud.delete_usuario(db, usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
