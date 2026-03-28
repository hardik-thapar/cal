"""
Database seeding script for the scheduling platform
"""
from sqlalchemy.orm import Session
from datetime import datetime, time
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, EventType, Availability, Booking
import uuid

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Booking).delete()
        db.query(Availability).delete()
        db.query(EventType).delete()
        db.commit()
        
        # Seed Event Types
        event1 = EventType(
            id=uuid.uuid4(),
            title="30 Minute Meeting",
            description="Quick 30-minute consultation call",
            duration=30,
            slug="30-min-meeting"
        )
        
        event2 = EventType(
            id=uuid.uuid4(),
            title="60 Minute Meeting",
            description="In-depth 1-hour discussion",
            duration=60,
            slug="60-min-meeting"
        )
        
        db.add(event1)
        db.add(event2)
        db.commit()
        
        print(f"✅ Created event types: {event1.slug}, {event2.slug}")
        
        # Seed Availability (Mon-Fri, 9 AM - 5 PM)
        for day in range(1, 6):  # 1=Monday to 5=Friday
            availability = Availability(
                id=uuid.uuid4(),
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                timezone="UTC"
            )
            db.add(availability)
        
        db.commit()
        print("✅ Created availability: Mon-Fri, 9 AM - 5 PM (UTC)")
        
        # Seed sample bookings
        from datetime import datetime, timedelta
        import pytz
        
        # Create a booking for tomorrow at 10 AM
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
        
        # Create a booking for tomorrow at 2 PM
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
        
        # Create a past booking
        yesterday = datetime.now(pytz.UTC) - timedelta(days=1)
        yesterday_11am = yesterday.replace(hour=11, minute=0, second=0, microsecond=0)
        
        booking3 = Booking(
            id=uuid.uuid4(),
            event_type_id=event1.id,
            name="Bob Johnson",
            email="bob@example.com",
            start_time=yesterday_11am,
            end_time=yesterday_11am + timedelta(minutes=30),
            status="booked"
        )
        
        db.add(booking1)
        db.add(booking2)
        db.add(booking3)
        db.commit()
        
        print("✅ Created 3 sample bookings")
        print("\n🎉 Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
