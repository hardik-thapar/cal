# Scheduling Platform (Cal.com Clone)

A production-ready scheduling and booking platform built with Next.js, FastAPI, and PostgreSQL.

## 🚀 Live Demo

- **Frontend**: https://calender-sync.preview.emergentagent.com
- **API**: https://calender-sync.preview.emergentagent.com/api

## ✨ Features

### Admin Dashboard
- **Event Types Management**: Create, edit, and delete event types with custom durations
- **Availability Settings**: Set weekly availability with timezone support
- **Bookings Dashboard**: View upcoming and past bookings, cancel bookings

### Public Booking
- **Event Discovery**: Browse available event types via public URLs
- **Smart Calendar**: Select dates with disabled past dates and unavailable days
- **Dynamic Slot Generation**: Real-time available time slots based on availability and existing bookings
- **Booking Form**: Simple form to capture name and email
- **Confirmation Page**: Success confirmation after booking

### Technical Features
- ✅ **Double Booking Prevention**: Database-level unique constraint on (event_type_id, start_time)
- ✅ **Timezone Handling**: All times stored in UTC, converted for display
- ✅ **Real-time Slot Generation**: Dynamically calculates available slots
- ✅ **Edge Case Handling**: No availability, fully booked days, past dates, invalid slugs
- ✅ **Production-Ready Code**: Clean architecture, proper validation, error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.2** - App Router with TypeScript
- **Tailwind CSS** - Styling
- **react-day-picker** - Calendar component
- **Axios** - API client
- **date-fns** - Date manipulation
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **PostgreSQL 15** - Database
- **pytz** - Timezone handling

## 📁 Project Structure

```
/app
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # Database connection
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── services.py       # Business logic
│   ├── server.py             # Entry point
│   ├── seed.py               # Database seeding
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── page.tsx                      # Homepage
│   │   ├── dashboard/
│   │   │   ├── events/page.tsx          # Event types management
│   │   │   ├── availability/page.tsx    # Availability settings
│   │   │   └── bookings/page.tsx        # Bookings dashboard
│   │   └── book/
│   │       └── [slug]/
│   │           ├── page.tsx             # Public booking page
│   │           └── confirm/page.tsx     # Confirmation page
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Utility functions
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🗄️ Database Schema

### event_types
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (Text)
- `duration` (Integer, minutes)
- `slug` (String, Unique)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### availability
- `id` (UUID, Primary Key)
- `day_of_week` (Integer, 0=Sunday, 6=Saturday)
- `start_time` (Time)
- `end_time` (Time)
- `timezone` (String)

### bookings
- `id` (UUID, Primary Key)
- `event_type_id` (UUID, Foreign Key → event_types.id)
- `name` (String)
- `email` (String)
- `start_time` (Timestamp)
- `end_time` (Timestamp)
- `status` (String: 'booked' | 'cancelled')
- `created_at` (Timestamp)
- **UNIQUE CONSTRAINT**: (event_type_id, start_time) - Prevents double booking

## 🔌 API Endpoints

### Event Types
- `POST /api/events` - Create event type
- `GET /api/events` - List all event types
- `GET /api/events/{id}` - Get event type by ID
- `PUT /api/events/{id}` - Update event type
- `DELETE /api/events/{id}` - Delete event type

### Availability
- `POST /api/availability` - Set availability
- `GET /api/availability` - Get all availability

### Public Booking
- `GET /api/public/events/{slug}` - Get event by slug
- `GET /api/public/slots?slug={slug}&date={YYYY-MM-DD}` - Get available slots
- `POST /api/public/book` - Create booking

### Bookings Dashboard
- `GET /api/bookings/upcoming` - Get upcoming bookings
- `GET /api/bookings/past` - Get past bookings
- `POST /api/bookings/{id}/cancel` - Cancel booking

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

### Installation

1. **Setup Database**
```bash
# PostgreSQL is already running in the environment
# Database: scheduling_db
# User: scheduler_user
```

2. **Backend Setup**
```bash
cd /app/backend
pip install -r requirements.txt

# Seed the database
python seed.py
```

3. **Frontend Setup**
```bash
cd /app/frontend
npm install
npm run build
```

4. **Environment Variables**

Backend (`.env`):
```
DATABASE_URL=postgresql://scheduler_user:scheduler_pass@localhost:5432/scheduling_db
CORS_ORIGINS=*
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://calender-sync.preview.emergentagent.com/api
```

### Running the Application

Services are managed by Supervisor:

```bash
# Restart services
sudo supervisorctl restart backend frontend

# Check status
sudo supervisorctl status
```

Access the application:
- Frontend: https://calender-sync.preview.emergentagent.com
- API Docs: https://calender-sync.preview.emergentagent.com/api/docs

## 🧪 Testing

### Test Double Booking Prevention
```bash
# Try to book the same slot twice
curl -X POST "https://calender-sync.preview.emergentagent.com/api/public/book" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type_id": "EVENT_ID",
    "name": "Test User",
    "email": "test@example.com",
    "start_time": "2026-03-30T09:00:00Z"
  }'
# Second attempt will return: "This time slot is already booked"
```

### Test Slot Generation
```bash
# Get available slots for a specific date
curl "https://calender-sync.preview.emergentagent.com/api/public/slots?slug=30-min-meeting&date=2026-03-30"
```

## 🎯 Key Implementation Details

### Slot Generation Logic
1. Fetch event duration and availability for the day of week
2. Generate all possible slots from start to end time in steps of event duration
3. Filter out past time slots
4. Filter out already booked slots
5. Return available slots

### Double Booking Prevention
- Database level: UNIQUE constraint on (event_type_id, start_time)
- Application level: Conflict checking before insert
- Error handling: Returns 409 Conflict with meaningful message

### Timezone Handling
- All database times stored in UTC
- Availability includes timezone for proper conversion
- Frontend displays times in user's local timezone

## 📊 Sample Data

The database is seeded with:
- 2 event types: "30 Minute Meeting" and "60 Minute Meeting"
- Availability: Monday-Friday, 9 AM - 5 PM UTC
- 3 sample bookings (including test bookings)

## 🎨 UI/UX Features

- Clean, modern design inspired by Cal.com
- Responsive layout (mobile, tablet, desktop)
- Interactive calendar with disabled dates
- Real-time slot availability
- Loading states and error handling
- Success confirmation flow

## 🔒 Edge Cases Handled

✅ No availability for selected date → Shows message
✅ All slots booked → Shows "No available times"
✅ Past date selection → Disabled in calendar
✅ Invalid event slug → 404 error page
✅ Booking collision → Returns meaningful error
✅ Timezone differences → Proper UTC conversion

## 📝 Assumptions

1. No authentication required (per requirements)
2. No email notifications (per requirements)
3. Single admin managing events and availability
4. All times stored in UTC for consistency
5. Bookings cannot be edited, only cancelled
6. Event types have fixed duration (no variable length)

## 🚀 Deployment

### Current Deployment
- **Platform**: Emergent Cloud (Kubernetes)
- **Frontend**: Next.js production build served on port 3000
- **Backend**: FastAPI on port 8001
- **Database**: PostgreSQL 15

### Production Recommendations
- **Frontend**: Vercel
- **Backend**: Railway / Render
- **Database**: Neon / Supabase PostgreSQL
- **Environment**: Configure CORS, database connection pooling
- **Monitoring**: Add logging and error tracking (Sentry)

## 🤝 Contributing

This is a production-ready scheduling platform with complete feature implementation following the Cal.com specification.

## 📄 License

MIT License - Feel free to use this code for your projects.

---

**Built with ❤️ using Next.js, FastAPI, and PostgreSQL**
