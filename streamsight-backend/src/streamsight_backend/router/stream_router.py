import logging as logger
from datetime import datetime
from operator import or_
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from streamsight.registries import ALGORITHM_REGISTRY
from streamsight_backend.config.setting import get_settings
from streamsight_backend.db.connection import get_db
from streamsight_backend.db.schema import StreamJob, StreamUser, StreamAlgorithm
from streamsight_backend.services.auth import get_current_username

logger = logger.getLogger(__name__)


class CreateStreamRequest(BaseModel):
    name: str
    description: str
    dataset: str
    top_k: int
    metrics: List[str]
    timestamp_split_start: str
    window_size: int


class CreateStreamResponse(BaseModel):
    stream_job_id: int
    status: str


class AddAlgorithmsRequest(BaseModel):
    algorithm_ids: List[str]


class AddAlgorithmsResponse(BaseModel):
    message: str
    stream_job_id: int
    status: str


def create_stream_router() -> APIRouter:
    router = APIRouter(prefix="/stream", tags=["stream"])

    @router.post("/create_stream", response_model=CreateStreamResponse)
    def create_stream(
        request: CreateStreamRequest,
        db: Session = Depends(get_db),
        current_username: str = Depends(get_current_username)
    ) -> CreateStreamResponse:
        logger.info(f"Creating stream job for user {current_username} with request: {request}")
        logger.info(f"Creating stream job for user {current_username} with request: {request}")
        logger.info(f"Creating stream job for user {current_username} with request: {request}")
        logger.info(f"Creating stream job for user {current_username} with request: {request}")
        logger.info(f"Creating stream job for user {current_username} with request: {request}")
        # Get user from database
        user = db.query(StreamUser).filter(StreamUser.username == current_username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Parse timestamp
        try:
            timestamp_split_start = datetime.fromisoformat(request.timestamp_split_start.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp format")

        # Create stream job
        stream_job = StreamJob(
            name=request.name,
            description=request.description,
            dataset=request.dataset,
            top_k=request.top_k,
            metrics=request.metrics,
            timestamp_split_start=timestamp_split_start,
            window_size=request.window_size,
            user_id=user.id,
            status="created"
        )

        db.add(stream_job)
        db.commit()
        db.refresh(stream_job)

        logger.info(f"Created stream job {stream_job.id} for user {current_username}")
        return CreateStreamResponse(stream_job_id=stream_job.id, status=stream_job.status)

    @router.get("/list_available")
    def list_available_streams(
        db: Session = Depends(get_db),
        current_username: str = Depends(get_current_username)
    ) -> List[dict]:
        # Get user from database
        user = db.query(StreamUser).filter(StreamUser.username == current_username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Get stream jobs with status "created" or "ready" and join with algorithms
        stream_jobs = db.query(StreamJob).filter(
            StreamJob.user_id == user.id,
            or_(
                StreamJob.status == "created",
                StreamJob.status == "ready"
            )
        ).all()

        result = []
        for job in stream_jobs:
            # Get algorithms for this stream job
            stream_algorithms = db.query(StreamAlgorithm).filter(
                StreamAlgorithm.stream_job_id == job.id
            ).all()
            
            # Get algorithm details from registry
            algorithms = []
            registered_algorithms = ALGORITHM_REGISTRY.get_registered_keys()
            for sa in stream_algorithms:
                if sa.algorithm_name in registered_algorithms:
                    algorithms.append({
                        "name": sa.algorithm_name,
                        "description": f"Recommendation algorithm: {sa.algorithm_name}",
                        "category": "Recommendation"
                    })

            result.append({
                "id": job.id,
                "name": job.name,
                "description": job.description,
                "status": job.status,
                "dataset": job.dataset,
                "top_k": job.top_k,
                "metrics": job.metrics,
                "window_size": job.window_size,
                "created_at": job.created_at.isoformat(),
                "algorithms": algorithms
            })

        return result

    @router.get("/list_all")
    def list_all_streams(
        db: Session = Depends(get_db),
        current_username: str = Depends(get_current_username)
    ) -> List[dict]:
        # Get user from database
        user = db.query(StreamUser).filter(StreamUser.username == current_username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Get all stream jobs for the user
        stream_jobs = db.query(StreamJob).filter(StreamJob.user_id == user.id).all()

        result = []
        for job in stream_jobs:
            # Get algorithms for this stream job
            stream_algorithms = db.query(StreamAlgorithm).filter(
                StreamAlgorithm.stream_job_id == job.id
            ).all()
            
            # Get algorithm details from registry
            algorithms = []
            registered_algorithms = ALGORITHM_REGISTRY.get_registered_keys()
            for sa in stream_algorithms:
                if sa.algorithm_name in registered_algorithms:
                    algorithms.append({
                        "name": sa.algorithm_name,
                        "description": f"Recommendation algorithm: {sa.algorithm_name}",
                        "category": "Recommendation"
                    })

            result.append({
                "id": job.id,
                "name": job.name,
                "description": job.description,
                "status": job.status,
                "dataset": job.dataset,
                "top_k": job.top_k,
                "metrics": job.metrics,
                "window_size": job.window_size,
                "created_at": job.created_at.isoformat(),
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "algorithms": algorithms
            })

        return result

    @router.post("/{stream_job_id}/add_algorithms", response_model=AddAlgorithmsResponse)
    def add_algorithms_to_stream(
        stream_job_id: int,
        request: AddAlgorithmsRequest,
        db: Session = Depends(get_db),
        current_username: str = Depends(get_current_username)
    ) -> AddAlgorithmsResponse:
        # Get user from database
        user = db.query(StreamUser).filter(StreamUser.username == current_username).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Get stream job
        stream_job = db.query(StreamJob).filter(
            StreamJob.id == stream_job_id,
            StreamJob.user_id == user.id
        ).first()
        if not stream_job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stream job not found")
        if stream_job.status not in ["created", "ready"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stream job is not in a valid status for adding algorithms")

        # Validate algorithms exist in streamsight registry
        registered_algorithms = ALGORITHM_REGISTRY.get_registered_keys()
        for algorithm_id in request.algorithm_ids:
            if algorithm_id not in registered_algorithms:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Algorithm {algorithm_id} not found in streamsight registry")

        # Create StreamAlgorithm entries
        for algorithm_id in request.algorithm_ids:
            stream_algorithm = StreamAlgorithm(
                stream_job_id=stream_job_id,
                algorithm_name=algorithm_id
            )
            db.add(stream_algorithm)

        # Update stream job status to "ready"
        stream_job.status = "ready"
        db.commit()

        logger.info(f"Added {len(request.algorithm_ids)} algorithms to stream job {stream_job_id}")
        return AddAlgorithmsResponse(
            message=f"Successfully added {len(request.algorithm_ids)} algorithms",
            stream_job_id=stream_job_id,
            status="ready"
        )

    return router
