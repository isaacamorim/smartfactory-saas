# Smart Factory SaaS — Backend API

API industrial para monitoramento de máquinas, cálculo de OEE e gestão multiempresa.

---

## Stack

- **FastAPI** — API REST
- **PostgreSQL** — estrutura do SaaS (empresas, máquinas, usuários)
- **InfluxDB** — dados das máquinas (séries temporais)
- **JWT** — autenticação

---

## Estrutura do projeto

```
factory_saas/
├── app/
│   ├── main.py          ← entrada da aplicação
│   ├── database.py      ← conexão PostgreSQL
│   ├── models.py        ← tabelas do banco (ORM)
│   ├── schemas.py       ← validação de dados (Pydantic)
│   ├── crud.py          ← operações no banco
│   ├── influx.py        ← consultas no InfluxDB
│   ├── auth.py          ← JWT authentication
│   └── routers/
│       ├── auth.py      ← POST /auth/login
│       ├── empresas.py  ← CRUD empresas e linhas
│       ├── maquinas.py  ← CRUD máquinas e metas OEE
│       └── metrics.py   ← consulta dados do InfluxDB
├── requirements.txt
├── .env
└── deploy.sh
```

---

## Deploy no servidor

### Passo 1 — Enviar arquivos para o servidor

```bash
# No seu PC, dentro da pasta factory_saas:
scp -r . root@191.252.217.250:/opt/factory_saas
```

### Passo 2 — Configurar o .env no servidor

```bash
ssh root@191.252.217.250
nano /opt/factory_saas/.env
```

Preencha o token do InfluxDB:
```
INFLUX_TOKEN=cole_seu_token_aqui
```

Para pegar o token do InfluxDB:
```
Acesse: http://191.252.217.250:8086
Menu → Load Data → API Tokens → Generate Token
```

### Passo 3 — Rodar o deploy

```bash
cd /opt/factory_saas
bash deploy.sh
```

### Passo 4 — Verificar se está rodando

```bash
systemctl status factory-saas
```

---

## Testar a API

Acesse a documentação automática:

```
http://191.252.217.250:8000/docs
```

---

## Rotas disponíveis

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/registro | Cadastrar usuário |
| POST | /auth/login | Login → retorna token JWT |

### Empresas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /empresas/ | Listar todas |
| POST | /empresas/ | Criar empresa |
| GET | /empresas/{id}/linhas | Listar linhas |
| POST | /empresas/{id}/linhas | Criar linha |

### Máquinas
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /maquinas/ | Cadastrar máquina |
| GET | /maquinas/empresa/{id} | Listar por empresa |
| GET | /maquinas/serial/{serial} | Buscar por serial |
| POST | /maquinas/meta | Definir metas OEE |

### Métricas (InfluxDB)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /metrics/{serial}/atual | Última leitura da máquina |
| GET | /metrics/{serial}/oee | OEE atual |
| GET | /metrics/{serial}/historico/{field} | Histórico para gráficos |

---

## Fluxo de uso

1. `POST /auth/registro` → cria usuário admin
2. `POST /auth/login` → pega o token JWT
3. `POST /empresas/` → cadastra empresa
4. `POST /empresas/{id}/linhas` → cria linha de produção
5. `POST /maquinas/` → vincula serial EVA1000-00021 à empresa
6. `POST /maquinas/meta` → define metas de OEE
7. `GET /metrics/EVA1000-00021/oee` → consulta OEE em tempo real
