from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import empresas, maquinas, metrics, auth

# Cria todas as tabelas no banco automaticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Factory SaaS API",
    description="Plataforma IIoT para monitoramento industrial e cálculo de OEE",
    version="1.0.0",
)

# CORS — permite que o frontend acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Em produção: coloque o domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os routers
app.include_router(auth.router)
app.include_router(empresas.router)
app.include_router(maquinas.router)
app.include_router(metrics.router)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "sistema": "Smart Factory SaaS",
        "versao": "1.0.0"
    }
