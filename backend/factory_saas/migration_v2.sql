-- ============================================================
-- MIGRATION v2 — Smart Factory SaaS
-- Adiciona deleted_at em todas as tabelas
-- Torna linha_id obrigatório em maquinas
-- ============================================================

-- 1. Empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Linhas
ALTER TABLE linhas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Maquinas
ALTER TABLE maquinas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
-- linha_id agora é obrigatório (preencha os existentes antes)
-- UPDATE maquinas SET linha_id = 1 WHERE linha_id IS NULL;
-- ALTER TABLE maquinas ALTER COLUMN linha_id SET NOT NULL;

-- 4. Usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 5. Índices para performance nas queries com deleted_at
CREATE INDEX IF NOT EXISTS idx_empresas_deleted ON empresas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_linhas_deleted    ON linhas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_maquinas_deleted  ON maquinas(deleted_at);
CREATE INDEX IF NOT EXISTS idx_usuarios_deleted  ON usuarios(deleted_at);

-- Verificar resultado
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'deleted_at'
ORDER BY table_name;
