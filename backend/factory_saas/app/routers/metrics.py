## app/routers/metrics.py
from fastapi import APIRouter, HTTPException, Depends
from influxdb_client import InfluxDBClient
from app.auth import get_current_user
from app.models import Usuario
import os
from typing import Optional

router = APIRouter(prefix="/metrics", tags=["Métricas"])

INFLUX_URL = os.getenv("INFLUX_URL", "http://191.252.217.250:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
INFLUX_ORG = os.getenv("INFLUX_ORG", "smart_factory")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "factory_system")

# Janelas por tipo — semana e config ficam mais tempo no cache
JANELAS = {
    "heartbeat": "-2m",
    "status": "-2m",
    "pesos": "-2m",
    "turno": "-2m",
    "kpis": "-2m",
    "config": "-1h",
    "semana": "-7d",
}


def get_client():
    return InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)


# ─── HEALTH ───────────────────────────────────────────────────────────────────
@router.get("/health")
def influx_health():
    try:
        with get_client() as client:
            ready = client.health()
            return {"status": "ok", "influx": ready.status}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


# ─── HELPER ───────────────────────────────────────────────────────────────────
def query_last(machine: str, tipo: str, janela: Optional[str] = None) -> dict:

    janela = janela or JANELAS.get(tipo, "-5m")

    flux = f"""
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: {janela})

  |> filter(fn: (r) =>
      r["_measurement"] == "machine_metrics"
  )

  |> pivot(
      rowKey:["_time"],
      columnKey:["_field"],
      valueColumn:"_value"
  )

  |> filter(fn: (r) =>
      r["machine"] == "{machine}"
  )

  |> filter(fn: (r) =>
      r["type"] == "{tipo}"
  )

  |> sort(columns: ["_time"], desc: true)

  |> limit(n: 1)
"""

    result = {}

    try:

        with get_client() as client:

            tables = client.query_api().query(flux)

            for table in tables:

                for record in table.records:

                    values = record.values

                    for key, value in values.items():

                        # ignora metadados influx
                        if key.startswith("_"):
                            continue

                        # ignora machine/type
                        if key in ["result", "table", "machine", "type"]:
                            continue

                        # ignora valores nulos
                        if value is None:
                            continue

                        result[key] = value

    except Exception as e:

        raise HTTPException(status_code=503, detail=f"InfluxDB error: {e}")

    return result


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────
@router.get("/{machine:path}/status")
def get_status(machine: str):
    data = query_last(machine, "status")
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados recentes de status")
    return data


@router.get("/{machine:path}/pesos")
def get_pesos(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "pesos")
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados recentes de pesos")
    return data


@router.get("/{machine:path}/turno")
def get_turno(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "turno")
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados de turno")
    return data


@router.get("/{machine:path}/semana")
def get_semana(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "semana")
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados de semana")
    return data


@router.get("/{machine:path}/config")
def get_config(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "config")
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados de config")
    return data


@router.get("/{machine:path}/kpis")
def get_kpis(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "kpis")  # ← era "kpis", mantém consistente
    if not data:
        raise HTTPException(status_code=404, detail="Sem dados de KPIs")
    return data


@router.get("/{machine:path}/all")
def get_all(machine: str, current_user: Usuario = Depends(get_current_user)):
    return {
        "heartbeat": query_last(machine, "heartbeat"),
        "status": query_last(machine, "status"),
        "pesos": query_last(machine, "pesos"),
        "turno": query_last(machine, "turno"),
        "kpis": query_last(machine, "kpis"),  # ← era "kpi", corrigido
        "config": query_last(machine, "config"),
        "semana": query_last(machine, "semana"),
    }


# ─── ENDPOINTS ────────────────────────────────────────────────


@router.get("/{machine:path}/heartbeat")
def get_heartbeat(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_last(machine, "heartbeat")

    if not data:
        raise HTTPException(status_code=404, detail="Sem heartbeat")

    return data


@router.get("/{machine:path}/status")
def get_status(machine: str):
    data = query_last(machine, "status")

    if not data:
        raise HTTPException(status_code=404, detail="Sem dados recentes de status")

    return data
