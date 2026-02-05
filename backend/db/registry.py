"""
Centralized model registry to handle SQLModel circular dependencies
"""
from sqlmodel import SQLModel
from sqlalchemy.orm import registry

# Create a centralized registry for all models to handle circular dependencies
model_registry = registry()

# Override the default SQLModel registry to use our custom one
SQLModel.registry = model_registry

def prepare_models():
    """Prepare all models to handle circular dependencies properly"""
    # This function can be called after all models are imported
    # to ensure they're properly configured
    pass