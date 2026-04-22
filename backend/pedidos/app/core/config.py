from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Pedidos Service"
    debug: bool = True
    api_prefix: str = "/api"

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/johns_papas_db"

    cors_allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
