## app/services/metrics_service.py

from datetime import datetime, timezone
from app.routers.metrics import get_client, INFLUX_BUCKET


def machine_summary(machine):

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

        return {"machine": machine, "online": False, "status": {}}

    delta = (
        datetime.now(timezone.utc) - last_seen.replace(tzinfo=timezone.utc)
    ).total_seconds()

    return {
        "machine": machine,
        "online": delta < 300,
        "last_seen": last_seen,
        "status": data,
    }
