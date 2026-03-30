from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

# Convert postgres:// to postgresql+asyncpg://
DB_URL = os.getenv("DB_URL", "").replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgres://", "postgresql+asyncpg://"
)

engine = create_async_engine(DB_URL, echo=False, pool_size=10)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("ML service DB connected")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session