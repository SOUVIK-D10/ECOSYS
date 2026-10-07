import asyncio
import psutil
import datetime
from pydantic import BaseModel
from enum import Enum

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
            # Uptime
            boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
            uptime = str(datetime.datetime.now() - boot_time).split('.')[0]
            
            # CPU
            cpu_usage = psutil.cpu_percent(interval=0.1)
            
            # RAM
            ram = psutil.virtual_memory()
            
            # Disk (defaults to the drive where the API is running)
            disk = psutil.disk_usage('/')
        
            #Temperature
            power = psutil.sensors_battery()
            plugged = power.power_plugged # type: ignore
            percent = power.percent # type: ignore
            
            # Return the data matching our DTO
            data = SystemHealthDTO(
                status=Status.GREEN if(cpu_usage<50 and ram.percent<70 and disk.percent<80) else Status.YELLOW if(cpu_usage<70 and ram.percent<80 and disk.percent<85) else Status.ORANGE if(cpu_usage<90 and ram.percent<90 and disk.percent<90) else Status.RED,
                uptime=uptime,
                cpu_usage_percent=cpu_usage,
                ram_left_gb=ram.free/(1024**3),
                ram_usage_percent=ram.percent,
                disk_free_gb=bytes_to_gb(disk.free),
                disk_usage_percent=disk.percent,
                battery_life_percentage= 0.0 if(percent==None) else percent,
                battery_is_power_plugged= False if(plugged==None) else plugged
            ).model_dump_json()

            yield f"data: {data}\n\n"

            await asyncio.sleep(10)
    except KeyboardInterrupt:
        print("Monitoring Done")