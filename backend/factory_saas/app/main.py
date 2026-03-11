from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import empresas, maquinas, metrics, auth, usuarios

# Cria/atualiza tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Factory SaaS API",
    description="Plataforma IIoT — monitoramento industrial e OEE",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(empresas.router)
app.include_router(maquinas.router)
app.include_router(usuarios.router)
app.include_router(metrics.router)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status":  "online",
        "sistema": "Smart Factory SaaS",
        "versao":  "2.0.0",
    }
