from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import get_current_user
from app.models import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("/empresa/{empresa_id}", response_model=list[schemas.UsuarioOut])
def listar_usuarios(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return crud.get_usuarios(db, empresa_id)


@router.post("/", response_model=schemas.UsuarioOut, status_code=201)
def criar_usuario(
    data: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if crud.get_usuario_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_usuario(db, data)


@router.put("/{usuario_id}", response_model=schemas.UsuarioOut)
def atualizar_usuario(
    usuario_id: int,
    data: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    usuario = crud.update_usuario(db, usuario_id, data)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.delete("/{usuario_id}", status_code=204)
def deletar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Soft delete: preenche deleted_at."""
    usuario = crud.delete_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
