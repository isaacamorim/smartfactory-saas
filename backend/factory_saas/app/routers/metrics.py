## app/routers/metrics.py
from fastapi import APIRouter, HTTPException, Depends
from influxdb_client import InfluxDBClient
from app.auth import get_current_user
from app.models import Usuario
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import os

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
def query_last(machine: str, tipo: str, janela=None):

    janela = janela or JANELAS.get(tipo, "-24h")

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
    |> range(start:{janela})

    |> filter(fn:(r)=>
        r["_measurement"]=="machine_metrics"
    )

    |> filter(fn:(r)=>
        r["machine"]=="{machine}"
    )

    |> filter(fn:(r)=>
        r["type"]=="{tipo}"
    )

    |> group(columns:["_field"])
    |> last()
    """

    result = {}

    with get_client() as client:

        tables = client.query_api().query(flux)

        for table in tables:
            for record in table.records:
                result[record.get_field()] = record.get_value()

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

    tipos = ["heartbeat", "status", "pesos", "turno", "kpis", "config", "semana"]

    with ThreadPoolExecutor(max_workers=7) as executor:

        futures = {tipo: executor.submit(query_last, machine, tipo) for tipo in tipos}

        return {tipo: future.result() for tipo, future in futures.items()}


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


@router.get("/machines")
def get_machines():

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-30d)
      |> filter(fn:(r)=>r["_measurement"]=="machine_metrics")
      |> filter(fn:(r)=>exists r.machine)
      |> keep(columns:["machine"])
      |> distinct(column:"machine")
    """

    with get_client() as client:

        tables = client.query_api().query(flux)

        machines = []

        for table in tables:
            for row in table.records:

                machine = row.values.get("machine")

                if machine:
                    machines.append(machine)

    return sorted(list(set(machines)))


@router.get("/overview")
def overview():

    machines = get_machines()

    dados = []

    for machine in machines:

        resumo = machine_summary(machine)

        dados.append(
            {
                "machine": resumo["machine"],
                "online": resumo["online"],
                "last_seen": resumo["last_seen"],
                "vel": resumo["status"].get("vel"),
                "prod_turno": resumo["status"].get("prod_turno"),
                "turno": resumo["status"].get("turno"),
                "total": resumo["status"].get("total"),
            }
        )

    return dados


@router.get("/{machine}/summary")
def machine_summary(machine: str):

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-24h)
      |> filter(fn:(r)=>r["_measurement"]=="machine_metrics")
      |> filter(fn:(r)=>r["machine"]=="{machine}")
      |> last()
    """

    with get_client() as client:

        tables = client.query_api().query(flux)

        data = {}
        last_seen = None

        for table in tables:
            for row in table.records:

                data[row.get_field()] = row.get_value()
                last_seen = row.get_time()

        if not data:

            return {"machine": machine, "online": False, "message": "Sem dados"}

        delta = (
            datetime.now(timezone.utc)
            -
            last_seen.replace(tzinfo=timezone.utc)
        ).total_seconds()

        online = delta < 300

        return {
            "machine": machine,
            "online": online,
            "last_seen": last_seen,
            "status": data,
        }


@router.get("/dashboard")
def dashboard():

    dados = overview()

    online = [m for m in dados if m["online"]]

    return {
        "machines_total": len(dados),
        "machines_online": len(online),
        "machines_offline": len(dados) - len(online),
        "prod_turno_total": sum(m["prod_turno"] or 0 for m in online),
        "total_pecas": sum(m["total"] or 0 for m in online),
        "vel_media": round(sum(m["vel"] or 0 for m in online) / max(len(online), 1), 2),
        "turnos": {
            "t1": sum(1 for m in online if m["turno"] == 1),
            "t2": sum(1 for m in online if m["turno"] == 2),
            "t3": sum(1 for m in online if m["turno"] == 3),
        },
        "offline": [m["machine"] for m in dados if not m["online"]],
    }


@router.get("/{machine}/history")
def history(machine: str):

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-24h)
      |> filter(fn:(r)=>r["_measurement"]=="machine_metrics")
      |> filter(fn:(r)=>r["machine"]=="{machine}")
      |> filter(fn:(r)=>
            r["_field"]=="prod_turno"
            or
            r["_field"]=="vel"
      )
      |> aggregateWindow(
            every:5m,
            fn:last,
            createEmpty:false
      )
    """

    with get_client() as client:

        tables = client.query_api().query(flux)

        historico = []

        for table in tables:
            for row in table.records:

                historico.append(
                    {
                        "time": row.get_time(),
                        "field": row.get_field(),
                        "value": row.get_value(),
                    }
                )

    return historico


@router.get("/{machine}/production")
def production(machine: str):

    historico = history(machine)

    dados = []
    anterior = None

    for item in historico:

        if item["field"] != "prod_turno":
            continue

        atual = item["value"]

        if anterior is None:
            incremento = 0

        else:
            incremento = max(atual - anterior, 0)

        dados.append({"time": item["time"], "producao": incremento})

        anterior = atual

    return dados


@router.get("/{machine}/hourly")
def hourly(machine: str):

    prod = production(machine)

    horas = {}

    for item in prod:

        if isinstance(item["time"], str):

            hora = item["time"][:13] + ":00"

        else:

            hora = item["time"].strftime("%Y-%m-%d %H:00")

        horas[hora] = horas.get(hora, 0) + item["producao"]

    return horas


@router.get("/{machine}/oee")
def oee(machine: str):

    resumo = machine_summary(machine)

    if not resumo["online"]:

        return {"oee": 0, "disponibilidade": 0, "performance": 0, "qualidade": 0}

    vel = resumo["status"].get("vel", 0)

    disponibilidade = 100
    performance = min((vel / 12) * 100, 100)

    qualidade = 100

    oee = (disponibilidade * performance * qualidade) / 10000

    return {
        "oee": round(oee, 2),
        "disponibilidade": disponibilidade,
        "performance": round(performance, 2),
        "qualidade": qualidade,
    }


@router.get("/alerts")
def alerts():

    avisos = []

    maquinas = get_machines()

    for machine in maquinas:

        resumo = machine_summary(machine)

        if not resumo["online"]:

            avisos.append(
                {"machine": machine, "tipo": "offline", "mensagem": "Sem dados > 2 min"}
            )

            continue

        vel = resumo["status"].get("vel", 0)

        if vel < 5:

            avisos.append(
                {
                    "machine": machine,
                    "tipo": "baixa_vel",
                    "mensagem": f"Velocidade baixa ({vel})",
                }
            )

        prod = resumo["status"].get("prod_turno", 0)

        if prod == 0:

            avisos.append(
                {"machine": machine, "tipo": "sem_producao", "mensagem": "Sem produção"}
            )

    return avisos


@router.get("/ranking")
def ranking():

    maquinas = get_machines()

    resultado = []

    for machine in maquinas:

        resumo = machine_summary(machine)

        status = resumo.get("status", {})

        resultado.append(
            {
                "machine": machine,
                "online": resumo["online"],
                "prod_turno": status.get("prod_turno", 0),
                "total": status.get("total", 0),
                "vel": status.get("vel", 0),
            }
        )

    resultado.sort(key=lambda x: x["prod_turno"], reverse=True)

    return resultado


@router.get("/{machine}/forecast")
def forecast(machine: str):

    horas = hourly(machine)

    valores = list(horas.values())

    if not valores:

        return {"forecast": 0}

    media = sum(valores) / len(valores)

    previsao = media * 8

    return {"media_hora": round(media, 2), "previsao_turno": round(previsao, 0)}


@router.get("/{machine}/target")
def target(machine: str):

    previsao = forecast(machine)

    meta = 2500

    previsto = previsao["previsao_turno"]

    diferenca = previsto - meta

    percentual = (previsto / meta) * 100

    return {
        "meta": meta,
        "previsto": previsto,
        "atingimento": round(percentual, 1),
        "saldo": diferenca,
        "status": "OK" if previsto >= meta else "RISCO",
    }


@router.get("/{machine}/stoppages")
def stoppages(machine: str):

    flux = f"""
    from(bucket:"{INFLUX_BUCKET}")
      |> range(start:-24h)
      |> filter(fn:(r)=>r["_measurement"]=="machine_metrics")
      |> filter(fn:(r)=>r["machine"]=="{machine}")
      |> filter(fn:(r)=>r["_field"]=="vel")
      |> aggregateWindow(every:30s, fn:last)
    """

    with get_client() as client:

        tables = client.query_api().query(flux)

        dados = []

        for table in tables:
            for row in table.records:

                dados.append({"time": row.get_time(), "vel": row.get_value()})

    paradas = []

    inicio = None

    for item in dados:

        if item["vel"] == 0:

            if inicio is None:

                inicio = item["time"]

        else:

            if inicio:

                fim = item["time"]

                duracao = (fim - inicio).total_seconds() / 60

                paradas.append(
                    {"inicio": inicio, "fim": fim, "duracao_min": round(duracao, 2)}
                )

                inicio = None

    return sorted(paradas, key=lambda x: x["inicio"], reverse=True)
