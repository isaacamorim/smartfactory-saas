# app/routers/metrics.py

from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
from app.models import Usuario
from app.influx import (
    get_influx_client,
    query_metricas_recentes,
    query_historico,
    query_oee_atual,
    INFLUX_BUCKET,
)
from app.services.metrics_service import (
    query_machines,
    machine_summary,
    build_overview,
    build_dashboard,
    build_ranking,
)
from app.services.oee_service import (
    calc_oee,
    get_history,
    get_production,
    get_hourly,
    calc_forecast,
    calc_target,
    get_stoppages,
)
from app.services.alert_service import get_alerts

router = APIRouter(prefix="/metrics", tags=["Métricas"])

@router.get("/health")
def influx_health():
    try:
        client = get_influx_client()
        ready  = client.health()
        client.close()
        return {"status": "ok", "influx": ready.status}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/machines")
def get_machines_endpoint():
    return query_machines()

@router.get("/overview")
def overview():
    return build_overview()

@router.get("/dashboard")
def dashboard():
    return build_dashboard()

@router.get("/ranking")
def ranking_endpoint():
    return build_ranking()

@router.get("/alerts")
def alerts():
    return get_alerts()

@router.get("/{machine:path}/all")
def get_all(machine: str, current_user: Usuario = Depends(get_current_user)):
    data = query_metricas_recentes(machine, janela="-2m")
    if not data or "error" in data:
        data = query_metricas_recentes(machine, janela="-1h")
    if not data or "error" in data:
        raise HTTPException(status_code=404, detail="Sem dados recentes")
    return data

@router.get("/{machine:path}/summary")
def summary(machine: str):
    return machine_summary(machine)

@router.get("/{machine:path}/oee")
def oee(machine: str):
    return calc_oee(machine)

@router.get("/{machine:path}/history")
def history(machine: str):
    return get_history(machine)

@router.get("/{machine:path}/production")
def production(machine: str):
    return get_production(machine)


@router.get("/{machine}/hourly")
def hourly(machine: str):

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-24h)
      |> filter(fn:(r)=>
            r["_measurement"]=="machine_metrics"
        )
      |> filter(fn:(r)=>
            r["machine"]=="{machine}"
        )
      |> filter(fn:(r)=>
            r["_field"]=="prod_turno"
        )
      |> aggregateWindow(
            every:1h,
            fn:last,
            createEmpty:false
        )
    """

    horas = {}

    client = get_influx_client()

    try:

        tables = client.query_api().query(flux)

        for table in tables:

            for row in table.records:

                hora = row.get_time().strftime("%Y-%m-%d %H:00")

                horas[hora] = row.get_value()

    finally:

        client.close()

    return horas


@router.get("/{machine}/forecast")
def forecast(machine: str):

    dados = hourly(machine)

    valores = list(dados.values())

    if len(valores) == 0:

        return {"media_hora": 0, "previsao_turno": 0}

    media = sum(valores) / len(valores)

    horas_restantes = 8  # ajustar depois pelo turno

    previsao = media * horas_restantes

    return {"media_hora": round(media, 1), "previsao_turno": round(previsao, 1)}


@router.get("/{machine:path}/target")
def target(machine: str):
    return calc_target(machine)

@router.get("/{machine:path}/stoppages")
def stoppages(machine: str):
    return get_stoppages(machine)

@router.get("/{machine:path}/historico/{field}")
def historico_field(machine: str, field: str, janela: str = "-24h", current_user: Usuario = Depends(get_current_user)):
    data = query_historico(machine, field, janela)
    if not data:
        raise HTTPException(status_code=404, detail=f"Sem histórico para '{field}'")
    return data
