from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha_plain: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plain, senha_hash)


# ─── EMPRESA ─────────────────────────────────────────────────────────────────

def get_empresas(db: Session):
    return db.query(models.Empresa).all()

def get_empresa(db: Session, empresa_id: int):
    return db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()

def create_empresa(db: Session, empresa: schemas.EmpresaCreate):
    db_empresa = models.Empresa(nome=empresa.nome, cnpj=empresa.cnpj)
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

def delete_empresa(db: Session, empresa_id: int):
    db_empresa = get_empresa(db, empresa_id)
    if db_empresa:
        db.delete(db_empresa)
        db.commit()
    return db_empresa


# ─── LINHA ────────────────────────────────────────────────────────────────────

def get_linhas(db: Session, empresa_id: int):
    return db.query(models.Linha).filter(models.Linha.empresa_id == empresa_id).all()

def create_linha(db: Session, linha: schemas.LinhaCreate):
    db_linha = models.Linha(nome=linha.nome, empresa_id=linha.empresa_id)
    db.add(db_linha)
    db.commit()
    db.refresh(db_linha)
    return db_linha


# ─── MAQUINA ──────────────────────────────────────────────────────────────────

def get_maquinas(db: Session, empresa_id: int):
    return db.query(models.Maquina).filter(models.Maquina.empresa_id == empresa_id).all()

def get_maquina_by_serial(db: Session, serial: str):
    return db.query(models.Maquina).filter(models.Maquina.serial_number == serial).first()

def create_maquina(db: Session, maquina: schemas.MaquinaCreate):
    db_maquina = models.Maquina(
        empresa_id=maquina.empresa_id,
        linha_id=maquina.linha_id,
        serial_number=maquina.serial_number,
        modelo=maquina.modelo,
    )
    db.add(db_maquina)
    db.commit()
    db.refresh(db_maquina)
    return db_maquina

def delete_maquina(db: Session, maquina_id: int):
    db_maquina = db.query(models.Maquina).filter(models.Maquina.id == maquina_id).first()
    if db_maquina:
        db.delete(db_maquina)
        db.commit()
    return db_maquina


# ─── USUARIO ──────────────────────────────────────────────────────────────────

def get_usuario_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def create_usuario(db: Session, usuario: schemas.UsuarioCreate):
    db_usuario = models.Usuario(
        empresa_id=usuario.empresa_id,
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=hash_senha(usuario.senha),
        role=usuario.role,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


# ─── META OEE ─────────────────────────────────────────────────────────────────

def get_meta_oee(db: Session, maquina_id: int):
    return db.query(models.MetaOEE).filter(models.MetaOEE.maquina_id == maquina_id).first()

def upsert_meta_oee(db: Session, meta: schemas.MetaOEECreate):
    db_meta = get_meta_oee(db, meta.maquina_id)
    if db_meta:
        db_meta.meta_producao_hora = meta.meta_producao_hora
        db_meta.meta_disponibilidade = meta.meta_disponibilidade
        db_meta.meta_performance = meta.meta_performance
        db_meta.meta_qualidade = meta.meta_qualidade
    else:
        db_meta = models.MetaOEE(**meta.model_dump())
        db.add(db_meta)
    db.commit()
    db.refresh(db_meta)
    return db_meta
