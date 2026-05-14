# smartfactory-saas/backend/factory_saas/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import empresas, maquinas, metrics, auth, usuarios, parametros_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Factory SaaS API",
    description="Plataforma IIoT — monitoramento industrial e OEE",
    version="2.1.0",
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
app.include_router(parametros_router.router)


@app.get("/")
def health():
    return {"status": "online", "versao": "2.1.0"}
