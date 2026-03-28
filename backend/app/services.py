from datetime import datetime, timedelta, time as dt_time
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
import pytz
from app import models, schemas

def check_booking_overlap(
    db: Session,
    event_type_id: str,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: str = None
) -> bool:
    """
    Check if a booking overlaps with existing bookings.
    Returns True if there is an overlap.
    """
    query = db.query(models.Booking).filter(
        models.Booking.event_type_id == event_type_id,
        models.Booking.status == "booked",
        # Overlap condition: (new_start < existing_end) AND (new_end > existing_start)
        models.Booking.start_time < end_time,
        models.Booking.end_time > start_time
    )
    
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)
    
    return query.first() is not None

def generate_slots(
    db: Session,
    event_slug: str,
    date_str: str
) -> List[schemas.SlotResponse]:
    """
    Generate available time slots for a given event and date.
    Filters out ANY overlapping bookings.
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

    # Fetch all bookings for this event on this date
    day_start = tz.localize(datetime.combine(target_date, dt_time.min)).astimezone(pytz.UTC)
    day_end = tz.localize(datetime.combine(target_date, dt_time.max)).astimezone(pytz.UTC)
    
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.event_type_id == event.id,
        models.Booking.status == "booked",
        models.Booking.start_time >= day_start,
        models.Booking.start_time < day_end
    ).all()

    while current_time + timedelta(minutes=event.duration) <= end_boundary:
        slot_end = current_time + timedelta(minutes=event.duration)
        
        # Convert to UTC for storage/comparison
        slot_start_utc = current_time.astimezone(pytz.UTC)
        slot_end_utc = slot_end.astimezone(pytz.UTC)

        # Check if slot is in the past
        if slot_start_utc <= now_utc:
            current_time += timedelta(minutes=event.duration)
            continue

        # Check for ANY overlapping booking
        # Overlap condition: (slot_start < booking_end) AND (slot_end > booking_start)
        is_available = True
        for booking in existing_bookings:
            if slot_start_utc < booking.end_time and slot_end_utc > booking.start_time:
                is_available = False
                break

        slots.append(schemas.SlotResponse(
            start_time=slot_start_utc,
            end_time=slot_end_utc,
            available=is_available
        ))

        current_time += timedelta(minutes=event.duration)

    return slots

def create_booking(
    db: Session,
    booking_data: schemas.BookingCreate
) -> models.Booking:
    """
    Create a new booking with strict overlap checking.
    """
    # Get event to calculate end time
    event = db.query(models.EventType).filter(
        models.EventType.id == booking_data.event_type_id
    ).first()
    
    if not event:
        raise ValueError("Event type not found")

    # Calculate end time
    end_time = booking_data.start_time + timedelta(minutes=event.duration)

    # CRITICAL: Check for overlapping bookings
    if check_booking_overlap(db, booking_data.event_type_id, booking_data.start_time, end_time):
        raise ValueError("This time slot is already booked")

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
