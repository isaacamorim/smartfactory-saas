## Acesso
ssh root@191.252.217.250

## Senha
siteNh!25

1️⃣ Entrar no PostgreSQL

No servidor execute:

sudo -u postgres psql

Vai aparecer algo assim:

postgres=#
2️⃣ Criar banco do sistema
CREATE DATABASE smartfactory;

Agora conecte nele:

\c smartfactory
3️⃣ Criar tabela empresas
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE
);
4️⃣ Criar tabela linhas

Cada linha pertence a uma empresa.

CREATE TABLE linhas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    empresa_id INTEGER REFERENCES empresas(id)
);
5️⃣ Criar tabela usuarios

Vou colocar campos que fazem sentido para indústria.

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(50),
    funcao VARCHAR(50),
    empresa_id INTEGER REFERENCES empresas(id),

    senha_hash VARCHAR

    adm BOOLEAN DEFAULT FALSE,

    operador BOOLEAN DEFAULT FALSE,
    mecanico BOOLEAN DEFAULT FALSE
);
6️⃣ Criar tabela maquinas
CREATE TABLE maquinas (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE,
    nome VARCHAR(100),
    apelido VARCHAR(100),

    linha_id INTEGER REFERENCES linhas(id),
);
7️⃣ Criar tabela metas_oee

Aqui vamos colocar metas industriais reais.

CREATE TABLE metas_oee (
    id SERIAL PRIMARY KEY,

    nome VARCHAR(100),

    maquina_id INTEGER REFERENCES maquinas(id),

    meta_producao_hora INTEGER,
    meta_disponibilidade NUMERIC(5,2),
    meta_performance NUMERIC(5,2),
    meta_qualidade NUMERIC(5,2),

    meta_oee NUMERIC(5,2)
);
8️⃣ Ver todas as tabelas

Execute:

\dt

Vai mostrar:

empresas
linhas
usuarios
maquinas
metas_oee
9️⃣ Inserir dados de teste
Empresa
INSERT INTO empresas (nome, cnpj)
VALUES ('Novo Horizonte', '00.000.000/0001-00');
Linha
INSERT INTO linhas (nome, empresa_id)
VALUES ('Linha Feijao', 1);
Máquina
INSERT INTO maquinas (serial_number, nome, apelido, linha_id, empresa_id)
VALUES ('EVA1000-00021', 'Empacotadora EVA1000', 'Empacotadora 1', 1, 1);
Meta OEE
INSERT INTO metas_oee (
    nome,
    maquina_id,
    meta_producao_hora,
    meta_disponibilidade,
    meta_performance,
    meta_qualidade,
    meta_oee
)
VALUES (
    'Meta EVA1000',
    1,
    1200,
    90,
    95,
    99,
    85
);
10️⃣ Ver dados
Empresas
SELECT * FROM empresas;
Máquinas
SELECT * FROM maquinas;
11️⃣ Como isso conecta com o sistema

Agora seu sistema fica assim:

PostgreSQL
   ↓
empresas
linhas
usuarios
maquinas
metas_oee

Enquanto o InfluxDB guarda os dados da máquina:

produção
velocidade
status
refugo
12️⃣ Arquitetura final

Seu sistema terá dois bancos:

PostgreSQL

estrutura do SaaS

empresas
linhas
usuarios
maquinas
metas

















