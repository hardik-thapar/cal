from sqlalchemy import Column, String, Integer, Text, DateTime, Time, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base

class EventType(Base):
    __tablename__ = "event_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration = Column(Integer, nullable=False)  # in minutes
    slug = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Availability(Base):
    __tablename__ = "availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 6=Saturday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    timezone = Column(String(100), nullable=False)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type_id = Column(UUID(as_uuid=True), ForeignKey("event_types.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="booked")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('event_type_id', 'start_time', name='uq_event_start_time'),
    )
