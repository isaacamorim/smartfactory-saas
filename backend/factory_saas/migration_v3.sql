-- ============================================================
-- MIGRATION v3 — Smart Factory SaaS
-- empresa_id nullable em usuarios (admins não têm empresa fixa)
-- ============================================================

-- 1. Tornar empresa_id nullable em usuarios
ALTER TABLE usuarios ALTER COLUMN empresa_id DROP NOT NULL;

-- 2. Verificar
SELECT id, nome, email, role, empresa_id FROM usuarios;
