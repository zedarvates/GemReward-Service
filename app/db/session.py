import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Using SQLite with aiosqlite as default for easy standalone testing.
# In production, replace the URL in .env with asyncpg (PostgreSQL).
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./gem_reward.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def get_db():
    """
    Dependency generator for FastAPI to inject AsyncSession.
    """
    async with AsyncSessionLocal() as session:
        yield session
