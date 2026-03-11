from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import create_access_token, get_current_user, require_admin
from app.models import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=schemas.LoginResponse)
def login(dados: schemas.LoginInput, db: Session = Depends(get_db)):
    """
    Login com email e senha.
    Retorna token JWT + dados do usuário (role, empresa_id).
    O frontend usa esses dados para montar a interface corretamente.
    """
    usuario = crud.get_usuario_by_email(db, dados.email)
    if not usuario or not crud.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")

    token = create_access_token(data={"sub": usuario.email})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "usuario":      usuario,
    }


@router.get("/me", response_model=schemas.UsuarioOut)
def me(current_user: Usuario = Depends(get_current_user)):
    """Retorna dados do usuário logado."""
    return current_user


@router.post("/registro-admin", response_model=schemas.UsuarioOut, status_code=201)
def registrar_admin(
    dados: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    """
    Cria um novo usuário admin (sem empresa vinculada).
    Apenas admins podem criar outros admins.
    """
    if crud.get_usuario_by_email(db, dados.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    dados.role       = "admin"
    dados.empresa_id = None
    return crud.create_usuario(db, dados)
