from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas
from app.auth import create_access_token
from app.models import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=schemas.Token)
def login(dados: schemas.LoginInput, db: Session = Depends(get_db)):
    """
    Faz login com email e senha.
    Retorna um token JWT para usar nas demais rotas.
    """
    usuario = crud.get_usuario_by_email(db, dados.email)
    if not usuario or not crud.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    token = create_access_token(data={"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/registro", response_model=schemas.UsuarioOut, status_code=201)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário."""
    existente = crud.get_usuario_by_email(db, usuario.email)
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_usuario(db, usuario)
