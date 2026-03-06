import os
from influxdb_client import InfluxDBClient
from dotenv import load_dotenv

load_dotenv()

INFLUX_URL    = os.getenv("INFLUX_URL")
INFLUX_TOKEN  = os.getenv("INFLUX_TOKEN")
INFLUX_ORG    = os.getenv("INFLUX_ORG")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET")


def get_influx_client():
    return InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)


def query_metricas_recentes(serial: str, janela: str = "-1h") -> dict:
    """
    Busca os últimos valores de cada field para um serial específico.
    janela: ex. "-1h", "-24h", "-7d"
    """
    client = get_influx_client()
    query_api = client.query_api()

    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: {janela})
      |> filter(fn: (r) => r["_measurement"] == "machine_metrics")
      |> filter(fn: (r) => r["serial"] == "{serial}")
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''

    result = {}
    try:
        tables = query_api.query(query)
        for table in tables:
            for record in table.records:
                result = record.values
    except Exception as e:
        result = {"error": str(e)}
    finally:
        client.close()

    return result


def query_historico(serial: str, field: str, janela: str = "-24h") -> list:
    """
    Busca histórico de um campo específico para gráficos.
    Ex: field = "contador_boas"
    """
    client = get_influx_client()
    query_api = client.query_api()

    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: {janela})
      |> filter(fn: (r) => r["_measurement"] == "machine_metrics")
      |> filter(fn: (r) => r["serial"] == "{serial}")
      |> filter(fn: (r) => r["_field"] == "{field}")
      |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
    '''

    historico = []
    try:
        tables = query_api.query(query)
        for table in tables:
            for record in table.records:
                historico.append({
                    "time": record.get_time().isoformat(),
                    "value": record.get_value(),
                })
    except Exception as e:
        historico = [{"error": str(e)}]
    finally:
        client.close()

    return historico


def query_oee_atual(serial: str, janela: str = "-8h") -> dict:
    """
    Busca os componentes de OEE calculados pelo Node-RED
    e já gravados no InfluxDB.
    """
    client = get_influx_client()
    query_api = client.query_api()

    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: {janela})
      |> filter(fn: (r) => r["_measurement"] == "machine_metrics")
      |> filter(fn: (r) => r["serial"] == "{serial}")
      |> filter(fn: (r) => r["_field"] == "oee" 
              or r["_field"] == "disponibilidade"
              or r["_field"] == "performance"
              or r["_field"] == "qualidade")
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''

    result = {}
    try:
        tables = query_api.query(query)
        for table in tables:
            for record in table.records:
                result = {
                    "oee":            record.values.get("oee"),
                    "disponibilidade": record.values.get("disponibilidade"),
                    "performance":     record.values.get("performance"),
                    "qualidade":       record.values.get("qualidade"),
                }
    except Exception as e:
        result = {"error": str(e)}
    finally:
        client.close()

    return result
