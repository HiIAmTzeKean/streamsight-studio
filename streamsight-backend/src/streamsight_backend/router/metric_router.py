import logging as logger

from fastapi import APIRouter, Depends, HTTPException, status
from streamsight.registries import METRIC_REGISTRY

from streamsight_backend.config.setting import get_settings


logger = logger.getLogger(__name__)


def create_metric_router() -> APIRouter:
    router = APIRouter(prefix="/metric", tags=["metric"])

    @router.get("/get_metric")
    def get_metric() -> list[str]:
        return METRIC_REGISTRY.get_registered_keys()

    return router
