"""
Database seeding script with availability schedules
"""
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, EventType, AvailabilitySchedule, AvailabilitySlot, Booking
import uuid
import pytz

def seed_database():
    # Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create Default Working Hours Schedule
        schedule1 = AvailabilitySchedule(
            id=uuid.uuid4(),
            name="Default Working Hours",
            timezone="UTC"
        )
        db.add(schedule1)
        db.commit()
        db.refresh(schedule1)
        
        # Add slots for Mon-Fri, 9 AM - 5 PM
        for day in range(1, 6):
            slot = AvailabilitySlot(
                id=uuid.uuid4(),
                schedule_id=schedule1.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0)
            )
            db.add(slot)
        db.commit()
        
        print(f"✅ Created schedule: {schedule1.name}")
        
        # Create Flexible Hours Schedule
        schedule2 = AvailabilitySchedule(
            id=uuid.uuid4(),
            name="Flexible Hours",
            timezone="UTC"
        )
        db.add(schedule2)
        db.commit()
        db.refresh(schedule2)
        
        # Add slots for Mon-Sun, 10 AM - 8 PM
        for day in range(0, 7):
            slot = AvailabilitySlot(
                id=uuid.uuid4(),
                schedule_id=schedule2.id,
                day_of_week=day,
                start_time=time(10, 0),
                end_time=time(20, 0)
            )
            db.add(slot)
        db.commit()
        
        print(f"✅ Created schedule: {schedule2.name}")
        
        # Seed Event Types with assigned schedules
        event1 = EventType(
            id=uuid.uuid4(),
            title="30 Minute Meeting",
            description="Quick 30-minute consultation call",
            duration=30,
            slug="30-min-meeting",
            availability_schedule_id=schedule1.id
        )
        
        event2 = EventType(
            id=uuid.uuid4(),
            title="60 Minute Meeting",
            description="In-depth 1-hour discussion",
            duration=60,
            slug="60-min-meeting",
            availability_schedule_id=schedule2.id
        )
        
        db.add(event1)
        db.add(event2)
        db.commit()
        
        print(f"✅ Created event types with assigned schedules")
        
        # Seed sample bookings
        tomorrow = datetime.now(pytz.UTC) + timedelta(days=1)
        tomorrow_10am = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        
        booking1 = Booking(
            id=uuid.uuid4(),
            event_type_id=event1.id,
            name="John Doe",
            email="john@example.com",
            start_time=tomorrow_10am,
            end_time=tomorrow_10am + timedelta(minutes=30),
            status="booked"
        )
        
        tomorrow_2pm = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        
        booking2 = Booking(
            id=uuid.uuid4(),
            event_type_id=event2.id,
            name="Jane Smith",
            email="jane@example.com",
            start_time=tomorrow_2pm,
            end_time=tomorrow_2pm + timedelta(minutes=60),
            status="booked"
        )
        
        db.add(booking1)
        db.add(booking2)
        db.commit()
        
        print("✅ Created sample bookings")
        print("\n🎉 Database seeded successfully with availability schedules!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
