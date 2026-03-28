#!/bin/bash

# Comprehensive test script for the scheduling platform
API_URL="https://calender-sync.preview.emergentagent.com/api"

echo "🧪 Testing Scheduling Platform API"
echo "===================================="
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -s "$API_URL/health" | python3 -c "import sys, json; data = json.load(sys.stdin); print('✅ Health check:', data['status'])" || echo "❌ Failed"
echo ""

# Test 2: Get event types
echo "2️⃣ Testing event types..."
EVENT_COUNT=$(curl -s "$API_URL/events" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "✅ Found $EVENT_COUNT event types"
echo ""

# Test 3: Get availability
echo "3️⃣ Testing availability..."
AVAIL_COUNT=$(curl -s "$API_URL/availability" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "✅ Found $AVAIL_COUNT availability slots"
echo ""

# Test 4: Get available slots
echo "4️⃣ Testing slot generation..."
SLOT_COUNT=$(curl -s "$API_URL/public/slots?slug=30-min-meeting&date=2026-03-30" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len([s for s in data if s['available']]))")
echo "✅ Generated $SLOT_COUNT available slots for 2026-03-30"
echo ""

# Test 5: Get upcoming bookings
echo "5️⃣ Testing bookings..."
BOOKING_COUNT=$(curl -s "$API_URL/bookings/upcoming" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "✅ Found $BOOKING_COUNT upcoming bookings"
echo ""

# Test 6: Test double booking prevention
echo "6️⃣ Testing double booking prevention..."
RESULT=$(curl -s -X POST "$API_URL/public/book" -H "Content-Type: application/json" -d '{
  "event_type_id": "69d46bd1-1629-41d6-bda2-c418f0c9b7fe",
  "name": "Duplicate Test",
  "email": "duplicate@test.com",
  "start_time": "2026-03-30T09:00:00Z"
}' | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('detail', 'Success'))")

if [[ "$RESULT" == *"already booked"* ]]; then
  echo "✅ Double booking prevention working"
else
  echo "⚠️  Unexpected result: $RESULT"
fi
echo ""

echo "🎉 All tests completed!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: https://calender-sync.preview.emergentagent.com"
echo "   Dashboard: https://calender-sync.preview.emergentagent.com/dashboard/events"
echo "   Booking: https://calender-sync.preview.emergentagent.com/book/30-min-meeting"
echo "   API Docs: https://calender-sync.preview.emergentagent.com/api/docs"
