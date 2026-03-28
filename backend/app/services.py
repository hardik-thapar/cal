from datetime import datetime, timedelta, time as dt_time
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
import pytz
from app import models, schemas

def generate_slots(
    db: Session,
    event_slug: str,
    date_str: str
) -> List[schemas.SlotResponse]:
    """
    Generate available time slots for a given event and date.
    """
    # Parse the date
    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    day_of_week = (target_date.weekday() + 1) % 7  # Convert to 0=Sunday format

    # Get event type
    event = db.query(models.EventType).filter(models.EventType.slug == event_slug).first()
    if not event:
        return []

    # Get availability for this day
    availability = db.query(models.Availability).filter(
        models.Availability.day_of_week == day_of_week
    ).first()

    if not availability:
        return []

    # Get timezone
    tz = pytz.timezone(availability.timezone)

    # Generate all possible slots
    slots = []
    current_time = datetime.combine(target_date, availability.start_time)
    end_boundary = datetime.combine(target_date, availability.end_time)

    # Make timezone aware
    current_time = tz.localize(current_time)
    end_boundary = tz.localize(end_boundary)

    # Convert to UTC for comparison
    now_utc = datetime.now(pytz.UTC)

    while current_time + timedelta(minutes=event.duration) <= end_boundary:
        slot_end = current_time + timedelta(minutes=event.duration)
        
        # Convert to UTC for storage/comparison
        slot_start_utc = current_time.astimezone(pytz.UTC)
        slot_end_utc = slot_end.astimezone(pytz.UTC)

        # Check if slot is in the past
        if slot_start_utc <= now_utc:
            current_time += timedelta(minutes=event.duration)
            continue

        # Check if slot is already booked
        existing_booking = db.query(models.Booking).filter(
            and_(
                models.Booking.event_type_id == event.id,
                models.Booking.start_time == slot_start_utc,
                models.Booking.status == "booked"
            )
        ).first()

        slots.append(schemas.SlotResponse(
            start_time=slot_start_utc,
            end_time=slot_end_utc,
            available=existing_booking is None
        ))

        current_time += timedelta(minutes=event.duration)

    return slots

def create_booking(
    db: Session,
    booking_data: schemas.BookingCreate
) -> models.Booking:
    """
    Create a new booking with conflict checking.
    """
    # Get event to calculate end time
    event = db.query(models.EventType).filter(
        models.EventType.id == booking_data.event_type_id
    ).first()
    
    if not event:
        raise ValueError("Event type not found")

    # Calculate end time
    end_time = booking_data.start_time + timedelta(minutes=event.duration)

    # Create booking
    db_booking = models.Booking(
        event_type_id=booking_data.event_type_id,
        name=booking_data.name,
        email=booking_data.email,
        start_time=booking_data.start_time,
        end_time=end_time,
        status="booked"
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking
