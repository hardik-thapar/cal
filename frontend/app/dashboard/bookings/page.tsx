'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { Calendar, X } from 'lucide-react';

interface Booking {
  id: string;
  event_type_id: string;
  name: string;
  email: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-600 mt-1">See upcoming and past events booked through your event type links</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'upcoming'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'past'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past ({pastBookings.length})
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{booking.name}</h3>
                      {booking.status === 'cancelled' && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{booking.email}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>{formatDate(booking.start_time)}</span>
                      <span>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>
                  {activeTab === 'upcoming' && booking.status === 'booked' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <X size={16} />
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
