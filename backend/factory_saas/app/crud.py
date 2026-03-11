from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timezone
from typing import Optional, List
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def _ativo(model):
    return model.deleted_at == None

def _soft_delete(db: Session, obj):
    obj.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obj)
    return obj


# ─── EMPRESA ──────────────────────────────────────────────────────────────────

def get_empresas(db: Session) -> List[models.Empresa]:
    return db.query(models.Empresa).filter(_ativo(models.Empresa)).all()

def get_empresa(db: Session, empresa_id: int) -> Optional[models.Empresa]:
    return db.query(models.Empresa).filter(
        models.Empresa.id == empresa_id, _ativo(models.Empresa)
    ).first()

def create_empresa(db: Session, data: schemas.EmpresaCreate) -> models.Empresa:
    obj = models.Empresa(nome=data.nome, cnpj=data.cnpj)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update_empresa(db: Session, empresa_id: int, data: schemas.EmpresaUpdate) -> Optional[models.Empresa]:
    obj = get_empresa(db, empresa_id)
    if not obj: return None
    if data.nome is not None: obj.nome = data.nome
    if data.cnpj is not None: obj.cnpj = data.cnpj
    db.commit(); db.refresh(obj)
    return obj

def delete_empresa(db: Session, empresa_id: int) -> Optional[models.Empresa]:
    obj = get_empresa(db, empresa_id)
    return _soft_delete(db, obj) if obj else None


# ─── LINHA ────────────────────────────────────────────────────────────────────

def get_linhas(db: Session, empresa_id: int) -> List[models.Linha]:
    return db.query(models.Linha).filter(
        models.Linha.empresa_id == empresa_id, _ativo(models.Linha)
    ).all()

def get_linha(db: Session, linha_id: int) -> Optional[models.Linha]:
    return db.query(models.Linha).filter(
        models.Linha.id == linha_id, _ativo(models.Linha)
    ).first()

def create_linha(db: Session, empresa_id: int, data: schemas.LinhaCreate) -> models.Linha:
    obj = models.Linha(nome=data.nome, empresa_id=empresa_id)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update_linha(db: Session, linha_id: int, data: schemas.LinhaUpdate) -> Optional[models.Linha]:
    obj = get_linha(db, linha_id)
    if not obj: return None
    if data.nome is not None: obj.nome = data.nome
    db.commit(); db.refresh(obj)
    return obj

def delete_linha(db: Session, linha_id: int) -> Optional[models.Linha]:
    obj = get_linha(db, linha_id)
    return _soft_delete(db, obj) if obj else None


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

def get_maquinas_por_empresa(db: Session, empresa_id: int) -> List[models.Maquina]:
    return db.query(models.Maquina).filter(
        models.Maquina.empresa_id == empresa_id, _ativo(models.Maquina)
    ).all()

def get_maquinas_por_linha(db: Session, linha_id: int) -> List[models.Maquina]:
    return db.query(models.Maquina).filter(
        models.Maquina.linha_id == linha_id, _ativo(models.Maquina)
    ).all()

def get_maquina(db: Session, maquina_id: int) -> Optional[models.Maquina]:
    return db.query(models.Maquina).filter(
        models.Maquina.id == maquina_id, _ativo(models.Maquina)
    ).first()

def get_maquina_by_serial(db: Session, serial: str) -> Optional[models.Maquina]:
    return db.query(models.Maquina).filter(
        models.Maquina.serial_number == serial, _ativo(models.Maquina)
    ).first()

def create_maquina(db: Session, data: schemas.MaquinaCreate) -> Optional[models.Maquina]:
    linha = get_linha(db, data.linha_id)
    if not linha: return None
    obj = models.Maquina(
        empresa_id    = linha.empresa_id,
        linha_id      = data.linha_id,
        serial_number = data.serial_number,
        modelo        = data.modelo,
    )
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update_maquina(db: Session, maquina_id: int, data: schemas.MaquinaUpdate) -> Optional[models.Maquina]:
    obj = get_maquina(db, maquina_id)
    if not obj: return None
    if data.linha_id is not None:
        linha = get_linha(db, data.linha_id)
        if linha:
            obj.linha_id   = data.linha_id
            obj.empresa_id = linha.empresa_id
    if data.modelo is not None:
        obj.modelo = data.modelo
    db.commit(); db.refresh(obj)
    return obj

def delete_maquina(db: Session, maquina_id: int) -> Optional[models.Maquina]:
    obj = get_maquina(db, maquina_id)
    return _soft_delete(db, obj) if obj else None


# ─── USUARIO ──────────────────────────────────────────────────────────────────

def get_usuarios(db: Session, empresa_id: int) -> List[models.Usuario]:
    return db.query(models.Usuario).filter(
        models.Usuario.empresa_id == empresa_id, _ativo(models.Usuario)
    ).all()

def get_usuario_by_email(db: Session, email: str) -> Optional[models.Usuario]:
    return db.query(models.Usuario).filter(
        models.Usuario.email == email, _ativo(models.Usuario)
    ).first()

def get_usuario_by_id(db: Session, usuario_id: int) -> Optional[models.Usuario]:
    return db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id, _ativo(models.Usuario)
    ).first()

def create_usuario(db: Session, data: schemas.UsuarioCreate) -> models.Usuario:
    obj = models.Usuario(
        empresa_id = data.empresa_id,
        nome       = data.nome,
        email      = data.email,
        senha_hash = hash_senha(data.senha),
        role       = data.role,
    )
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update_usuario(db: Session, usuario_id: int, data: schemas.UsuarioUpdate) -> Optional[models.Usuario]:
    obj = get_usuario_by_id(db, usuario_id)
    if not obj: return None
    if data.nome is not None: obj.nome = data.nome
    if data.role is not None: obj.role = data.role
    db.commit(); db.refresh(obj)
    return obj

def delete_usuario(db: Session, usuario_id: int) -> Optional[models.Usuario]:
    obj = get_usuario_by_id(db, usuario_id)
    return _soft_delete(db, obj) if obj else None


# ─── META OEE ─────────────────────────────────────────────────────────────────

def get_meta_oee(db: Session, maquina_id: int) -> Optional[models.MetaOEE]:
    return db.query(models.MetaOEE).filter(models.MetaOEE.maquina_id == maquina_id).first()

def upsert_meta_oee(db: Session, data: schemas.MetaOEECreate) -> models.MetaOEE:
    obj = get_meta_oee(db, data.maquina_id)
    if obj:
        obj.meta_producao_hora   = data.meta_producao_hora
        obj.meta_disponibilidade = data.meta_disponibilidade
        obj.meta_performance     = data.meta_performance
        obj.meta_qualidade       = data.meta_qualidade
    else:
        obj = models.MetaOEE(**data.model_dump())
        db.add(obj)
    db.commit(); db.refresh(obj)
    return obj
