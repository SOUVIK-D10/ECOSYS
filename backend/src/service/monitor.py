import asyncio
import psutil
import datetime
from pydantic import BaseModel
from enum import Enum
from fastapi.responses import StreamingResponse

class Status(str, Enum):
    GREEN = "HEALTHY"
    YELLOW = "UNWELL"
    ORANGE = "UNHEALTHY"
    RED = "CRITICAL"

class SystemHealthDTO(BaseModel):
    status: Status = Status.YELLOW
    uptime: str
    cpu_usage_percent: float
    ram_left_gb: float
    ram_usage_percent: float
    disk_free_gb: float
    disk_usage_percent: float
    battery_life_percentage: float
    battery_is_power_plugged: bool

def bytes_to_gb(bytes_value: int) -> float:
    return round(bytes_value / (1024 ** 3), 2)

async def check_server_health():
    try:
        while True:
            # Gather your metrics...
            try:
                boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
                uptime = str(datetime.datetime.now() - boot_time).split('.')[0]
            except Exception:
                uptime = "N/A"
            
            cpu_usage = psutil.cpu_percent(interval=0.1)
            ram = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            try:
                power = psutil.sensors_battery()
                plugged = power.power_plugged if power else True
                percent = power.percent if power else 100.0
            except Exception:
                plugged = True
                percent = 100.0
            
            data = SystemHealthDTO(
                status=Status.GREEN if (cpu_usage < 50 and ram.percent < 70 and disk.percent < 80) else Status.YELLOW if (cpu_usage < 70 and ram.percent < 80 and disk.percent < 85) else Status.ORANGE if (cpu_usage < 90 and ram.percent < 90 and disk.percent < 90) else Status.RED,
                uptime=uptime,
                cpu_usage_percent=cpu_usage,
                ram_left_gb=bytes_to_gb(ram.free),
                ram_usage_percent=ram.percent,
                disk_free_gb=bytes_to_gb(disk.free),
                disk_usage_percent=disk.percent,
                battery_life_percentage=percent,
                battery_is_power_plugged=plugged
            ).model_dump_json()

            # 1. Send the actual payload
            yield f"data: {data}\n\n"

            # 2. Send rapid sub-second pings to trick Cloudflare/Render proxies 
            # into keeping the TCP socket open during the 10-second wait window
            for _ in range(5):
                await asyncio.sleep(2)
                yield f": heartbeat\n\n" # SSE comment ping (ignored by clients, keeps proxy alive)

    except asyncio.CancelledError:
        pass