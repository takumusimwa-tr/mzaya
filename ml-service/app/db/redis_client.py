import redis.asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = None

async def init_redis():
    global redis_client
    redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
    await redis_client.ping()
    print("ML service Redis connected")

def get_redis():
    return redis_client