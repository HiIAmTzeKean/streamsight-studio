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

    @router.get("/get_params/{algorithm_name}")
    def get_algorithm_params(algorithm_name: str) -> dict:
        """Get default parameters for a specific algorithm."""
        try:
            algo_class = ALGORITHM_REGISTRY.get(algorithm_name)
            if not algo_class:
                raise HTTPException(status_code=404, detail="Algorithm not found")
            return algo_class.get_default_params()
        except Exception as e:
            logger.error(f"Error getting params for {algorithm_name}: {e}")
            raise HTTPException(status_code=500, detail="Failed to get algorithm parameters")
    
    return router
