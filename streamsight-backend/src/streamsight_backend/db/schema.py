"""
Database schema for Streamsight Studio.

Workflow:
1. User creates StreamJob with parameters → status = "created"
2. User adds algorithms to StreamJob via StreamAlgorithm table → status = "ready"
3. User runs StreamJob → status = "running" → spawns evaluation thread
4. Evaluation completes → status = "completed" (or "failed")
"""

from sqlalchemy import Column, Integer, Sequence, String, ARRAY, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


Base = declarative_base()


class StreamUser(Base):
    __tablename__ = "stream_user"
    id = Column(Integer, Sequence("stream_user_id_seq"), primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    streams = relationship("StreamJob", back_populates="stream_user")

class StreamJob(Base):
    __tablename__ = "stream_job"
    id = Column(Integer, Sequence("stream_job_id_seq"), primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    status = Column(String, nullable=False, default="created")  # created, ready, running, completed, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)  # When execution started
    completed_at = Column(DateTime, nullable=True)  # When execution completed

    # Stream configuration
    dataset = Column(String, nullable=False)
    top_k = Column(Integer, nullable=False)
    metrics = Column(ARRAY(String), nullable=False)
    timestamp_split_start = Column(DateTime, nullable=False)
    window_size = Column(Integer, nullable=False)

    # Foreign key
    user_id = Column(Integer, ForeignKey("stream_user.id"), nullable=False)

    # Relationships
    stream_user = relationship("StreamUser", back_populates="streams")
    stream_algorithms = relationship("StreamAlgorithm", back_populates="stream_job", cascade="all, delete-orphan")
    evaluations = relationship("EvaluationResult", back_populates="stream_job", cascade="all, delete-orphan")


class StreamAlgorithm(Base):
    __tablename__ = "stream_algorithm"
    id = Column(Integer, Sequence("stream_algorithm_id_seq"), primary_key=True, autoincrement=True)
    stream_job_id = Column(Integer, ForeignKey("stream_job.id"), nullable=False)
    algorithm_name = Column(String, nullable=False)  # Algorithm name from streamsight registry
    algorithm_uuid = Column(UUID(as_uuid=True), nullable=True)  # Unique identifier from streamsight on stream creation

    # Algorithm-specific configuration
    parameters = Column(Text)  # JSON string of algorithm parameters
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    stream_job = relationship("StreamJob", back_populates="stream_algorithms")
    evaluations = relationship("EvaluationResult", back_populates="stream_algorithm", cascade="all, delete-orphan")


class EvaluationResult(Base):
    __tablename__ = "evaluation_result"
    id = Column(Integer, Sequence("evaluation_result_id_seq"), primary_key=True, autoincrement=True)
    stream_job_id = Column(Integer, ForeignKey("stream_job.id"), nullable=False)
    stream_algorithm_id = Column(Integer, ForeignKey("stream_algorithm.id"), nullable=False)

    # Evaluation details
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Additional context
    split_type = Column(String)  # e.g., 'train', 'validation', 'test'
    window_start = Column(DateTime)
    window_end = Column(DateTime)

    # Relationships
    stream_job = relationship("StreamJob", back_populates="evaluations")
    stream_algorithm = relationship("StreamAlgorithm", back_populates="evaluations")