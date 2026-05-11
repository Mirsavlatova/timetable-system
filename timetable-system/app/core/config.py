from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:12345@localhost:5432/darsjadvali_db"
    SECRET_KEY: str = "supersecretkey-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
