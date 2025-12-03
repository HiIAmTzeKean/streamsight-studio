import logging as logger

from fastapi import APIRouter, Depends, HTTPException, status
from streamsight.registries import DATASET_REGISTRY

from streamsight_backend.config.setting import get_settings


logger = logger.getLogger(__name__)


def create_dataset_router() -> APIRouter:
    router = APIRouter(prefix="/dataset", tags=["dataset"])

    @router.get("/get_dataset")
    def get_dataset() -> list[str]:
        return DATASET_REGISTRY.get_registered_keys()

    return router
