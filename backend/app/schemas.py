from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, time
from typing import Optional, List
import uuid

# Availability Schedule Schemas
class AvailabilityScheduleCreate(BaseModel):
    name: str
    timezone: str = "UTC"

class AvailabilityScheduleResponse(BaseModel):
    id: uuid.UUID
    name: str
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True

# Availability Slot Schemas
class AvailabilitySlotCreate(BaseModel):
    schedule_id: uuid.UUID
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str
    end_time: str

class AvailabilitySlotResponse(BaseModel):
    id: uuid.UUID
    schedule_id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time

    class Config:
        from_attributes = True

# Event Type Schemas
class EventTypeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration: int
    slug: str
    availability_schedule_id: Optional[uuid.UUID] = None

class EventTypeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    slug: Optional[str] = None
    availability_schedule_id: Optional[uuid.UUID] = None

class EventTypeResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    duration: int
    slug: str
    availability_schedule_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    event_type_id: uuid.UUID
    name: str
    email: EmailStr
    start_time: datetime

class BookingResponse(BaseModel):
    id: uuid.UUID
    event_type_id: uuid.UUID
    name: str
    email: str
    start_time: datetime
    end_time: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Slot Schema
class SlotResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool