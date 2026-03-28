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
        models.Booking.status == "booked",
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
    Uses the event's assigned availability schedule.
    """
    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    day_of_week = (target_date.weekday() + 1) % 7

    # Get event type with its schedule
    event = db.query(models.EventType).filter(models.EventType.slug == event_slug).first()
    if not event:
        return []

    # Get the availability schedule
    if not event.availability_schedule_id:
        return []
    
    schedule = db.query(models.AvailabilitySchedule).filter(
        models.AvailabilitySchedule.id == event.availability_schedule_id
    ).first()
    
    if not schedule:
        return []

    # Get availability slots for this day and schedule
    availability_slots = db.query(models.AvailabilitySlot).filter(
        models.AvailabilitySlot.schedule_id == schedule.id,
        models.AvailabilitySlot.day_of_week == day_of_week
    ).all()

    if not availability_slots:
        return []

    tz = pytz.timezone(schedule.timezone)
    now_utc = datetime.now(pytz.UTC)
    all_slots = []

    # Fetch all bookings for this event on this date
    day_start = tz.localize(datetime.combine(target_date, dt_time.min)).astimezone(pytz.UTC)
    day_end = tz.localize(datetime.combine(target_date, dt_time.max)).astimezone(pytz.UTC)
    
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.status == "booked",
        models.Booking.start_time >= day_start,
        models.Booking.start_time < day_end
    ).all()

    # Generate slots for each availability slot
    for avail_slot in availability_slots:
        current_time = datetime.combine(target_date, avail_slot.start_time)
        end_boundary = datetime.combine(target_date, avail_slot.end_time)

        current_time = tz.localize(current_time)
        end_boundary = tz.localize(end_boundary)

        while current_time + timedelta(minutes=event.duration) <= end_boundary:
            slot_end = current_time + timedelta(minutes=event.duration)
            
            slot_start_utc = current_time.astimezone(pytz.UTC)
            slot_end_utc = slot_end.astimezone(pytz.UTC)

            if slot_start_utc <= now_utc:
                current_time += timedelta(minutes=event.duration)
                continue

            # Check for overlapping booking
            is_available = True
            for booking in existing_bookings:
                if slot_start_utc < booking.end_time and slot_end_utc > booking.start_time:
                    is_available = False
                    break

            all_slots.append(schemas.SlotResponse(
                start_time=slot_start_utc,
                end_time=slot_end_utc,
                available=is_available
            ))

            current_time += timedelta(minutes=event.duration)

    # Sort slots by start time
    all_slots.sort(key=lambda x: x.start_time)
    return all_slots

def create_booking(
    db: Session,
    booking_data: schemas.BookingCreate
) -> models.Booking:
    """
    Create a new booking with strict overlap checking.
    """
    event = db.query(models.EventType).filter(
        models.EventType.id == booking_data.event_type_id
    ).first()
    
    if not event:
        raise ValueError("Event type not found")

    end_time = booking_data.start_time + timedelta(minutes=event.duration)

    if check_booking_overlap(db, booking_data.event_type_id, booking_data.start_time, end_time):
        raise ValueError("This time slot is already booked")

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