import logging as logger

from fastapi import APIRouter, Depends, HTTPException, status
from streamsight.registries import ALGORITHM_REGISTRY
from streamsight_backend.config.setting import get_settings
from streamsight_backend.db.connection import get_db

logger = logger.getLogger(__name__)


def create_algorithm_router() -> APIRouter:
    router = APIRouter(prefix="/algorithm", tags=["algorithm"])

    @router.get("/list")
    def list_algorithms() -> list[dict]:
        """Get list of available algorithms from streamsight registry."""
        keys = ALGORITHM_REGISTRY.get_registered_keys()
        return [
            {
                "name": key,
                "description": f"Recommendation algorithm: {key}",
                "category": "Recommendation"
            }
            for key in keys
        ]

    @router.get("/get_algorithm")
    def get_algorithm() -> list[str]:
        """Get algorithm keys from streamsight registry (legacy)."""
        return ALGORITHM_REGISTRY.get_registered_keys()

    return router
