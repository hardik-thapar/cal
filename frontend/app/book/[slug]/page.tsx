'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventTypesAPI, publicAPI } from '@/lib/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Clock, User, Mail, Check } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  duration: number;
  slug: string;
}

interface Slot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchEvent = async () => {
    try {
      const response = await eventTypesAPI.getBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedDate || !event) return;
    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await publicAPI.getSlots(slug, dateStr);
      setSlots(response.data);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !event) return;

    setSubmitting(true);
    try {
      await publicAPI.createBooking({
        event_type_id: event.id,
        name: formData.name,
        email: formData.email,
        start_time: selectedSlot.start_time,
      });
      router.push(`/book/${slug}/confirm?date=${format(selectedDate!, 'yyyy-MM-dd')}&time=${formatTimeSlot(selectedSlot.start_time)}&name=${formData.name}&email=${formData.email}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error creating booking.');
      await fetchSlots();
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\" style={{backgroundColor: '#f8fafc'}}>
        <div className=\"inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent\"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\" style={{backgroundColor: '#f8fafc'}}>
        <div className=\"text-center bg-white p-12 rounded-2xl border border-gray-200\">
          <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">Event Not Found</h1>
          <p className=\"text-gray-600\">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className=\"min-h-screen\" style={{backgroundColor: '#f8fafc'}}>
      <div className=\"container mx-auto px-4 py-12 max-w-5xl\">
        <div className=\"bg-white rounded-2xl border border-gray-200 overflow-hidden\">
          <div className=\"grid md:grid-cols-5\">
            {/* Left Section - Event Details & Calendar */}
            <div className=\"md:col-span-2 p-8 border-r border-gray-200\">
              <div className=\"mb-8\">\n                <h1 className=\"text-2xl font-semibold text-gray-900 mb-2\">{event.title}</h1>
                {event.description && (
                  <p className=\"text-sm text-gray-600 mb-4\">{event.description}</p>
                )}
                <div className=\"flex items-center gap-2 text-sm text-gray-500\">
                  <Clock size={16} />
                  <span>{event.duration} min</span>
                </div>
              </div>

              <div className=\"mb-6\">
                <h3 className=\"text-sm font-semibold text-gray-900 mb-4\">Select a Date</h3>
                <DayPicker
                  mode=\"single\"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: new Date() }}
                  modifiersClassNames={{
                    selected: 'bg-gray-900 text-white hover:bg-gray-800',
                    today: 'font-bold text-gray-900',
                  }}
                  className=\"cal-daypicker\"
                />
              </div>

              {selectedDate && selectedSlot && (
                <div className=\"pt-6 border-t border-gray-200\">
                  <div className=\"flex items-center gap-2 text-sm text-gray-600 mb-2\">
                    <Check size={16} className=\"text-green-600\" />
                    <span>{format(selectedDate, 'EEE, MMM d')}</span>
                  </div>
                  <div className=\"text-sm text-gray-600\">
                    {formatTimeSlot(selectedSlot.start_time)}
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Time Slots & Form */}
            <div className=\"md:col-span-3 p-8\">
              {!selectedDate ? (
                <div className=\"flex items-center justify-center h-full\">
                  <p className=\"text-gray-500 text-sm\">Select a date to see available times</p>
                </div>
              ) : !selectedSlot ? (
                <>
                  <h3 className=\"text-sm font-semibold text-gray-900 mb-4\">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {loadingSlots ? (
                    <div className=\"flex justify-center py-8\">
                      <div className=\"inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-900 border-r-transparent\"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className=\"text-center py-12\">
                      <p className=\"text-gray-500 text-sm mb-4\">No available times for this date</p>
                      <button
                        onClick={() => setSelectedDate(undefined)}
                        className=\"text-sm text-gray-900 hover:underline\"
                      >
                        Choose another date
                      </button>
                    </div>
                  ) : (
                    <div className=\"grid grid-cols-2 gap-2 max-h-96 overflow-y-auto\">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className=\"px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition text-gray-900\"
                          data-testid={`time-slot-${index}`}
                        >
                          {formatTimeSlot(slot.start_time)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className=\"mb-6\">
                    <button
                      onClick={() => setSelectedSlot(null)}
                      className=\"text-sm text-gray-600 hover:text-gray-900\"
                    >
                      ← Change time
                    </button>
                  </div>
                  <h3 className=\"text-sm font-semibold text-gray-900 mb-6\">Enter Details</h3>
                  <form onSubmit={handleSubmit} className=\"space-y-4\">
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                        Name *
                      </label>
                      <div className=\"relative\">
                        <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                          <User size={18} className=\"text-gray-400\" />
                        </div>
                        <input
                          type=\"text\"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className=\"w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent\"
                          required
                          placeholder=\"Your name\"
                          data-testid=\"booking-name-input\"
                        />
                      </div>
                    </div>
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                        Email *
                      </label>
                      <div className=\"relative\">
                        <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                          <Mail size={18} className=\"text-gray-400\" />
                        </div>
                        <input
                          type=\"email\"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className=\"w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent\"
                          required
                          placeholder=\"you@example.com\"
                          data-testid=\"booking-email-input\"
                        />
                      </div>
                    </div>
                    <button
                      type=\"submit\"
                      disabled={submitting}
                      className=\"w-full px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed\"
                      data-testid=\"confirm-booking-button\"
                    >
                      {submitting ? 'Confirming...' : 'Confirm'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .cal-daypicker .rdp {
          --rdp-cell-size: 40px;
          margin: 0;
        }
        .cal-daypicker .rdp-months {
          justify-content: center;
        }
        .cal-daypicker .rdp-caption {
          display: flex;
          justify-content: center;
          padding: 1rem 0;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .cal-daypicker .rdp-head_cell {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .cal-daypicker .rdp-day {
          font-size: 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid transparent;
        }
        .cal-daypicker .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #f9fafb;
          border-color: #e5e7eb;
        }
        .cal-daypicker .rdp-day_disabled {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
