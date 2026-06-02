# app/services/oee_service.py
from app.influx import get_influx_client, INFLUX_BUCKET, query_oee_atual, query_historico
from app.services.metrics_service import machine_summary


def calc_oee(serial: str) -> dict:
    result = query_oee_atual(serial)
    if result and result.get("oee") is not None:
        return {
            "oee":             round(result.get("oee") or 0, 2),
            "disponibilidade": round(result.get("disponibilidade") or 0, 2),
            "performance":     round(result.get("performance") or 0, 2),
            "qualidade":       round(result.get("qualidade") or 0, 2),
        }
    resumo = machine_summary(serial)
    if not resumo["online"]:
        return {"oee": 0, "disponibilidade": 0, "performance": 0, "qualidade": 0}
    vel = resumo["status"].get("vel", 0) or 0
    performance = min((vel / 12) * 100, 100)
    oee = performance / 100
    return {
        "oee":             round(oee * 100, 2),
        "disponibilidade": 100,
        "performance":     round(performance, 2),
        "qualidade":       100,
    }


def get_history(serial: str) -> list:
    prod = query_historico(serial, "prod_turno", "-24h")
    vel  = query_historico(serial, "vel", "-24h")
    historico = []
    for item in prod:
        historico.append({**item, "field": "prod_turno"})
    for item in vel:
        historico.append({**item, "field": "vel"})
    return sorted(historico, key=lambda x: x["time"])


def get_production(serial: str) -> list:
    raw      = query_historico(serial, "prod_turno", "-24h")
    dados    = []
    anterior = None
    for item in raw:
        atual      = item["value"] or 0
        incremento = max(atual - anterior, 0) if anterior is not None else 0
        dados.append({"time": item["time"], "producao": incremento})
        anterior = atual
    return dados


def get_hourly(serial: str) -> dict:
    prod  = get_production(serial)
    horas = {}
    for item in prod:
        t    = item["time"]
        hora = t[:13] + ":00" if isinstance(t, str) else str(t)[:13] + ":00"
        horas[hora] = horas.get(hora, 0) + item["producao"]
    return horas


def calc_forecast(serial: str) -> dict:
    horas   = get_hourly(serial)
    valores = list(horas.values())
    if not valores:
        return {"media_hora": 0, "previsao_turno": 0}
    media = sum(valores) / len(valores)
    return {"media_hora": round(media, 2), "previsao_turno": round(media * 8, 0)}


def calc_target(serial: str, meta: int = 2500) -> dict:
    previsao = calc_forecast(serial)
    previsto = previsao["previsao_turno"]
    return {
        "meta":        meta,
        "previsto":    previsto,
        "atingimento": round((previsto / meta) * 100, 1) if meta else 0,
        "saldo":       previsto - meta,
        "status":      "OK" if previsto >= meta else "RISCO",
    }


def get_stoppages(serial: str) -> list:
    raw     = query_historico(serial, "vel", "-24h")
    paradas = []
    inicio  = None
    for item in raw:
        vel = item["value"] or 0
        t   = item["time"]
        if vel == 0:
            if inicio is None:
                inicio = t
        else:
            if inicio:
                try:
                    from datetime import datetime
                    dt_i    = datetime.fromisoformat(inicio.replace("Z", "+00:00"))
                    dt_f    = datetime.fromisoformat(t.replace("Z", "+00:00"))
                    duracao = (dt_f - dt_i).total_seconds() / 60
                except Exception:
                    duracao = 0
                paradas.append({"inicio": inicio, "fim": t, "duracao_min": round(duracao, 2)})
                inicio = None
    return sorted(paradas, key=lambda x: x["inicio"], reverse=True)
