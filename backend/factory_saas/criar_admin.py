#!/usr/bin/env python3
"""
Script para criar o usuário admin inicial.
Rodar no servidor:
  cd /opt/smartfactory-saas
  source /opt/venv/bin/activate
  python3 criar_admin.py
"""
import sys
sys.path.insert(0, "/opt/smartfactory-saas")

from app.database import SessionLocal
from app import crud, schemas
from app.models import RoleEnum

db = SessionLocal()

email = "admin@smartfactory.com"
existente = crud.get_usuario_by_email(db, email)

if existente:
    print(f"Usuário '{email}' já existe (role: {existente.role})")
    if existente.role != RoleEnum.admin:
        existente.role = RoleEnum.admin
        existente.empresa_id = None
        db.commit()
        print("→ Role atualizado para admin e empresa desvinculada.")
else:
    usuario = crud.create_usuario(db, schemas.UsuarioCreate(
        empresa_id = None,
        nome       = "Administrador",
        email      = email,
        senha      = "Admin@2025",
        role       = RoleEnum.admin,
    ))
    print(f"✓ Admin criado: {usuario.email} (id={usuario.id})")
    print("  Senha: Admin@2025  ← troque no primeiro login!")

db.close()
