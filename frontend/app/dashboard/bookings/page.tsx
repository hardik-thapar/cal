'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { X } from 'lucide-react';

interface Booking {
  id: string;
  event_type_id: string;
  name: string;
  email: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function BookingsPage() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        bookingsAPI.getUpcoming(),
        bookingsAPI.getPast(),
      ]);
      setUpcomingBookings(upcoming.data);
      setPastBookings(past.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-600 mt-1">See upcoming and past events</p>
      </div>

      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb' }}>
        <div className="border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'upcoming'
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'past'
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
            {bookings.map((booking) => (
              <div key={booking.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{booking.name}</h3>
                      {booking.status === 'cancelled' && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{booking.email}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{formatDate(booking.start_time)}</span>
                      <span>{formatTime(booking.start_time)}</span>
                    </div>
                  </div>
                  {activeTab === 'upcoming' && booking.status === 'booked' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-3 py-1.5 text-xs text-gray-700 border rounded-md hover:bg-gray-50 transition flex items-center gap-1"
                      style={{ borderColor: '#d1d5db' }}
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
