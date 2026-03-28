'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookingsAPI } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
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
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">View and manage your bookings</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/events"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Event Types
            </Link>
            <Link
              href="/dashboard/availability"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Availability
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid="upcoming-tab"
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid="past-tab"
              >
                Past ({pastBookings.length})
              </button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-gray-50 transition"
                  data-testid={`booking-${booking.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.name}</h3>
                        {booking.status === 'cancelled' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{booking.email}</p>
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
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                        data-testid={`cancel-booking-${booking.id}`}
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
    </div>
  );
}
