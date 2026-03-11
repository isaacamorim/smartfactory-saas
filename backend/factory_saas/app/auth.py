import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud
from app.models import Usuario, RoleEnum
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MIN))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise exc
    except JWTError:
        raise exc

    usuario = crud.get_usuario_by_email(db, email=email)
    if not usuario:
        raise exc
    return usuario


# ─── DEPENDÊNCIAS DE PERMISSÃO ────────────────────────────────────────────────

def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Apenas admin pode acessar."""
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
    return current_user


def require_gerente_ou_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """Admin ou gerente podem acessar."""
    if current_user.role == RoleEnum.operador:
        raise HTTPException(status_code=403, detail="Acesso restrito a gerentes e administradores")
    return current_user


def get_empresa_id_do_usuario(current_user: Usuario = Depends(get_current_user)) -> Optional[int]:
    """
    Retorna empresa_id do usuário logado.
    Para admin retorna None (pode ver tudo).
    """
    return current_user.empresa_id


def verificar_acesso_empresa(empresa_id: int, current_user: Usuario):
    """
    Verifica se o usuário tem acesso à empresa informada.
    Admin: acesso total.
    Gerente/Operador: só a própria empresa.
    """
    if current_user.role == RoleEnum.admin:
        return  # admin vê tudo
    if current_user.empresa_id != empresa_id:
        raise HTTPException(status_code=403, detail="Acesso negado a esta empresa")
