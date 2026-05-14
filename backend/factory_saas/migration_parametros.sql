-- ============================================================
-- MIGRATION — Tabela de Parâmetros da Máquina
-- Salva os parâmetros configurados na tela de Parâmetros CLP
-- Vinculada à máquina pelo serial_number
-- ============================================================

CREATE TABLE IF NOT EXISTS parametros_maquina (
    id                      SERIAL PRIMARY KEY,
    maquina_id              INTEGER NOT NULL REFERENCES maquinas(id),

    -- Temperatura de solda (%)
    temp_horizontal         REAL    NOT NULL DEFAULT 35.0,
    temp_vertical           REAL    NOT NULL DEFAULT 30.0,

    -- Seletoras — Funções
    sel_pesagem             BOOLEAN NOT NULL DEFAULT FALSE,
    sel_fim_produto         BOOLEAN NOT NULL DEFAULT FALSE,
    sel_fim_fita            BOOLEAN NOT NULL DEFAULT FALSE,
    sel_fim_embalagem       BOOLEAN NOT NULL DEFAULT FALSE,
    sel_emerg_enfardadeira  BOOLEAN NOT NULL DEFAULT FALSE,
    sel_pacote_vazio        BOOLEAN NOT NULL DEFAULT FALSE,
    sel_inv_rs485           BOOLEAN NOT NULL DEFAULT FALSE,
    sel_reserva_q12         BOOLEAN NOT NULL DEFAULT FALSE,
    sel_reserva_q13         BOOLEAN NOT NULL DEFAULT FALSE,

    -- Seletoras — Dosador (0=Rotativo 1=Gaveta 2=Rosca 3=Balança)
    tipo_dosador            INTEGER NOT NULL DEFAULT 1,

    -- Seletoras — Datador
    sel_datador             BOOLEAN NOT NULL DEFAULT TRUE,
    sel_temp_datador        BOOLEAN NOT NULL DEFAULT FALSE,

    -- Motores
    vel_motor_rpm           REAL    NOT NULL DEFAULT 1720.0,
    relacao_reducao         REAL    NOT NULL DEFAULT 30.85,
    pacotes_min             REAL    NOT NULL DEFAULT 40.0,

    -- Ângulos Página 1 — Soldas
    ang_datador_ini         INTEGER NOT NULL DEFAULT 110,
    ang_datador_fim         INTEGER NOT NULL DEFAULT 150,
    ang_solda_v_ini         INTEGER NOT NULL DEFAULT 320,
    ang_solda_v_fim         INTEGER NOT NULL DEFAULT 100,
    ang_pulso_sv_ini        INTEGER NOT NULL DEFAULT 300,
    ang_solda_h_ini         INTEGER NOT NULL DEFAULT 160,
    ang_solda_h_fim         INTEGER NOT NULL DEFAULT 220,
    ang_pulso_sh_ini        INTEGER NOT NULL DEFAULT 150,
    ang_esfr_h_ini          INTEGER NOT NULL DEFAULT 200,
    ang_esfr_h_fim          INTEGER NOT NULL DEFAULT 320,

    -- Ângulos Página 2 — Gavetas
    ang_dos_rot_ini         INTEGER NOT NULL DEFAULT 0,
    ang_dos_rot_fim         INTEGER NOT NULL DEFAULT 1,
    ang_gav_sup_ini         INTEGER NOT NULL DEFAULT 180,
    ang_gav_sup_fim         REAL    NOT NULL DEFAULT 0.5,
    ang_gav_inf_ini         INTEGER NOT NULL DEFAULT 30,
    ang_gav_inf_fim         REAL    NOT NULL DEFAULT 0.3,
    ang_abre_fecha_ini      INTEGER NOT NULL DEFAULT 90,
    ang_abre_fecha_fim      INTEGER NOT NULL DEFAULT 350,
    ang_q15_ini             INTEGER NOT NULL DEFAULT 0,
    ang_q15_fim             REAL    NOT NULL DEFAULT 0.0,
    ang_alim_ini            INTEGER NOT NULL DEFAULT 0,
    ang_fim_ciclo           INTEGER NOT NULL DEFAULT 50,
    ang_esteira_fim         REAL    NOT NULL DEFAULT 0.0,

    -- Controle
    criado_em               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at              TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Índice para busca por máquina
CREATE INDEX IF NOT EXISTS idx_parametros_maquina_id ON parametros_maquina(maquina_id);

-- Apenas um registro ativo por máquina
CREATE UNIQUE INDEX IF NOT EXISTS idx_parametros_maquina_unico
    ON parametros_maquina(maquina_id)
    WHERE deleted_at IS NULL;
