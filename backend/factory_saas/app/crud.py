from sqlalchemy.orm import Session
from sqlalchemy import and_
from passlib.context import CryptContext
from datetime import datetime, timezone
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plain, senha_hash)

def _ativo(model):
    """Filtro padrão: exclui registros com deleted_at preenchido."""
    return model.deleted_at == None

def _soft_delete(db: Session, obj):
    """Preenche deleted_at em vez de deletar fisicamente."""
    obj.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obj)
    return obj


# ─── EMPRESA ──────────────────────────────────────────────────────────────────

def get_empresas(db: Session):
    return db.query(models.Empresa).filter(_ativo(models.Empresa)).all()

def get_empresa(db: Session, empresa_id: int):
    return db.query(models.Empresa).filter(
        models.Empresa.id == empresa_id,
        _ativo(models.Empresa)
    ).first()

def get_empresa_com_linhas(db: Session, empresa_id: int):
    return get_empresa(db, empresa_id)

def create_empresa(db: Session, data: schemas.EmpresaCreate):
    obj = models.Empresa(nome=data.nome, cnpj=data.cnpj)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_empresa(db: Session, empresa_id: int, data: schemas.EmpresaUpdate):
    obj = get_empresa(db, empresa_id)
    if not obj:
        return None
    if data.nome is not None:
        obj.nome = data.nome
    if data.cnpj is not None:
        obj.cnpj = data.cnpj
    db.commit()
    db.refresh(obj)
    return obj

def delete_empresa(db: Session, empresa_id: int):
    obj = get_empresa(db, empresa_id)
    if obj:
        return _soft_delete(db, obj)
    return None


# ─── LINHA ────────────────────────────────────────────────────────────────────

def get_linhas(db: Session, empresa_id: int):
    return db.query(models.Linha).filter(
        models.Linha.empresa_id == empresa_id,
        _ativo(models.Linha)
    ).all()

def get_linha(db: Session, linha_id: int):
    return db.query(models.Linha).filter(
        models.Linha.id == linha_id,
        _ativo(models.Linha)
    ).first()

def create_linha(db: Session, empresa_id: int, data: schemas.LinhaCreate):
    obj = models.Linha(nome=data.nome, empresa_id=empresa_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_linha(db: Session, linha_id: int, data: schemas.LinhaUpdate):
    obj = get_linha(db, linha_id)
    if not obj:
        return None
    if data.nome is not None:
        obj.nome = data.nome
    db.commit()
    db.refresh(obj)
    return obj

def delete_linha(db: Session, linha_id: int):
    obj = get_linha(db, linha_id)
    if obj:
        return _soft_delete(db, obj)
    return None


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

def get_maquinas_por_empresa(db: Session, empresa_id: int):
    return db.query(models.Maquina).filter(
        models.Maquina.empresa_id == empresa_id,
        _ativo(models.Maquina)
    ).all()

def get_maquinas_por_linha(db: Session, linha_id: int):
    return db.query(models.Maquina).filter(
        models.Maquina.linha_id == linha_id,
        _ativo(models.Maquina)
    ).all()

def get_maquina(db: Session, maquina_id: int):
    return db.query(models.Maquina).filter(
        models.Maquina.id == maquina_id,
        _ativo(models.Maquina)
    ).first()

def get_maquina_by_serial(db: Session, serial: str):
    return db.query(models.Maquina).filter(
        models.Maquina.serial_number == serial,
        _ativo(models.Maquina)
    ).first()

def create_maquina(db: Session, data: schemas.MaquinaCreate):
    # Resolve empresa_id a partir da linha
    linha = get_linha(db, data.linha_id)
    if not linha:
        return None
    obj = models.Maquina(
        empresa_id    = linha.empresa_id,
        linha_id      = data.linha_id,
        serial_number = data.serial_number,
        modelo        = data.modelo,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_maquina(db: Session, maquina_id: int, data: schemas.MaquinaUpdate):
    obj = get_maquina(db, maquina_id)
    if not obj:
        return None
    if data.linha_id is not None:
        linha = get_linha(db, data.linha_id)
        if linha:
            obj.linha_id   = data.linha_id
            obj.empresa_id = linha.empresa_id
    if data.modelo is not None:
        obj.modelo = data.modelo
    db.commit()
    db.refresh(obj)
    return obj

def delete_maquina(db: Session, maquina_id: int):
    obj = get_maquina(db, maquina_id)
    if obj:
        return _soft_delete(db, obj)
    return None


# ─── USUARIO ──────────────────────────────────────────────────────────────────

def get_usuarios(db: Session, empresa_id: int):
    return db.query(models.Usuario).filter(
        models.Usuario.empresa_id == empresa_id,
        _ativo(models.Usuario)
    ).all()

def get_usuario_by_email(db: Session, email: str):
    # Auth precisa buscar mesmo sem filtro de empresa
    return db.query(models.Usuario).filter(
        models.Usuario.email == email,
        _ativo(models.Usuario)
    ).first()

def create_usuario(db: Session, data: schemas.UsuarioCreate):
    obj = models.Usuario(
        empresa_id = data.empresa_id,
        nome       = data.nome,
        email      = data.email,
        senha_hash = hash_senha(data.senha),
        role       = data.role,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_usuario(db: Session, usuario_id: int, data: schemas.UsuarioUpdate):
    obj = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id,
        _ativo(models.Usuario)
    ).first()
    if not obj:
        return None
    if data.nome is not None:
        obj.nome = data.nome
    if data.role is not None:
        obj.role = data.role
    db.commit()
    db.refresh(obj)
    return obj

def delete_usuario(db: Session, usuario_id: int):
    obj = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id,
        _ativo(models.Usuario)
    ).first()
    if obj:
        return _soft_delete(db, obj)
    return None


# ─── META OEE ─────────────────────────────────────────────────────────────────

def get_meta_oee(db: Session, maquina_id: int):
    return db.query(models.MetaOEE).filter(
        models.MetaOEE.maquina_id == maquina_id
    ).first()

def upsert_meta_oee(db: Session, data: schemas.MetaOEECreate):
    obj = get_meta_oee(db, data.maquina_id)
    if obj:
        obj.meta_producao_hora   = data.meta_producao_hora
        obj.meta_disponibilidade = data.meta_disponibilidade
        obj.meta_performance     = data.meta_performance
        obj.meta_qualidade       = data.meta_qualidade
    else:
        obj = models.MetaOEE(**data.model_dump())
        db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
