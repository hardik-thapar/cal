from sqlalchemy import Column, String, Integer, Text, DateTime, Time, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class AvailabilitySchedule(Base):
    __tablename__ = "availability_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    timezone = Column(String(100), nullable=False, default="UTC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    slots = relationship("AvailabilitySlot", back_populates="schedule", cascade="all, delete-orphan")

class EventType(Base):
    __tablename__ = "event_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration = Column(Integer, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    availability_schedule_id = Column(UUID(as_uuid=True), ForeignKey("availability_schedules.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    schedule = relationship("AvailabilitySchedule")
    bookings = relationship("Booking", back_populates="event_type", cascade="all, delete-orphan")

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("availability_schedules.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    schedule = relationship("AvailabilitySchedule", back_populates="slots")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type_id = Column(UUID(as_uuid=True), ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False)
    
    event_type = relationship("EventType", back_populates="bookings")
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="booked")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint('start_time < end_time', name='check_start_before_end'),
    )