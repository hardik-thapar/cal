from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime
import os
from dotenv import load_dotenv

from app.database import get_db, engine
from app import models, schemas, services

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scheduling Platform API")

# CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# ==================== EVENT TYPES ====================

@app.post("/api/events", response_model=schemas.EventTypeResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventTypeCreate, db: Session = Depends(get_db)):
    db_event = models.EventType(**event.model_dump())
    db.add(db_event)
    try:
        db.commit()
        db.refresh(db_event)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Event with this slug already exists")
    return db_event

@app.get("/api/events", response_model=List[schemas.EventTypeResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(models.EventType).all()
    return events

@app.get("/api/events/{event_id}", response_model=schemas.EventTypeResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(models.EventType).filter(models.EventType.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.put("/api/events/{event_id}", response_model=schemas.EventTypeResponse)
def update_event(event_id: str, event: schemas.EventTypeUpdate, db: Session = Depends(get_db)):
    db_event = db.query(models.EventType).filter(models.EventType.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    try:
        db.commit()
        db.refresh(db_event)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Event with this slug already exists")
    return db_event

@app.delete("/api/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, db: Session = Depends(get_db)):
    db_event = db.query(models.EventType).filter(models.EventType.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return None

# ==================== AVAILABILITY ====================

@app.post("/api/availability", response_model=schemas.AvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_availability(availability: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    
    # Parse time strings
    start_time = datetime.strptime(availability.start_time, "%H:%M").time()
    end_time = datetime.strptime(availability.end_time, "%H:%M").time()
    
    db_availability = models.Availability(
        day_of_week=availability.day_of_week,
        start_time=start_time,
        end_time=end_time,
        timezone=availability.timezone
    )
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability

@app.get("/api/availability", response_model=List[schemas.AvailabilityResponse])
def get_availability(db: Session = Depends(get_db)):
    availability = db.query(models.Availability).all()
    return availability

# ==================== PUBLIC BOOKING ====================

@app.get("/api/public/events/{slug}", response_model=schemas.EventTypeResponse)
def get_event_by_slug(slug: str, db: Session = Depends(get_db)):
    event = db.query(models.EventType).filter(models.EventType.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.get("/api/public/slots", response_model=List[schemas.SlotResponse])
def get_available_slots(slug: str, date: str, db: Session = Depends(get_db)):
    slots = services.generate_slots(db, slug, date)
    return slots

@app.post("/api/public/book", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    try:
        db_booking = services.create_booking(db, booking)
        return db_booking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This time slot is already booked")

# ==================== BOOKINGS DASHBOARD ====================

@app.get("/api/bookings/upcoming", response_model=List[schemas.BookingResponse])
def get_upcoming_bookings(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    bookings = db.query(models.Booking).filter(
        models.Booking.start_time >= now,
        models.Booking.status == "booked"
    ).order_by(models.Booking.start_time).all()
    return bookings

@app.get("/api/bookings/past", response_model=List[schemas.BookingResponse])
def get_past_bookings(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    bookings = db.query(models.Booking).filter(
        models.Booking.start_time < now
    ).order_by(models.Booking.start_time.desc()).all()
    return bookings

@app.post("/api/bookings/{booking_id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
