from sqlmodel import SQLModel
from sqlalchemy.orm import registry

# Create a registry for handling circular dependencies
sqlmodel_registry = registry()

# Set this registry as the default for SQLModel
SQLModel.registry = sqlmodel_registry

# Prepare function to be called after all models are defined
def prepare_models():
    """Prepare models to handle circular dependencies properly"""
    try:
        from sqlalchemy import MetaData
        # This forces the preparation of the registry to handle circular dependencies
        sqlmodel_registry._class_registry = {}
    except Exception:
        pass  # Ignore if already prepared