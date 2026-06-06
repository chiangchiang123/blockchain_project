from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    server_private_key: str
    server_address: str
    contract_address: str
    # abi: json

    class Config:
        env_file = ".env"

settings = Settings()