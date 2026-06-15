import os

class Settings:
    PROJECT_NAME: str = "UrbanFlow AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # JWT Auth settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "URBANFLOW_AI_SUPER_SECRET_KEY_987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    # Fallback to local SQLite if PostgreSQL is not provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./urbanflow.db"
    )

settings = Settings()
