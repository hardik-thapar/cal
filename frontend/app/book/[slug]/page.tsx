'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventTypesAPI, publicAPI } from '@/lib/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Clock, User, Mail, Globe } from 'lucide-react';

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
  const [formData, setFormData] = useState({ name: '', email: '' });

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
      console.error('Error:', error);
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
      console.error('Error:', error);
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
      const params = new URLSearchParams({
        date: format(selectedDate!, 'yyyy-MM-dd'),
        time: formatTime(selectedSlot.start_time),
        name: formData.name,
        email: formData.email,
      });
      router.push(`/book/${slug}/confirm?${params}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Booking failed');
      fetchSlots();
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Event Not Found</h1>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
          <div className="grid md:grid-cols-3">
            {/* Left: Event Info */}
            <div className="p-8 border-r" style={{ borderColor: '#e5e7eb' }}>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">{event.title}</h1>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{event.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{event.duration} min</span>
                </div>
              </div>
            </div>

            {/* Middle: Calendar */}
            <div className="p-8 border-r" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Select a Date</h3>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="modern-calendar"
              />
            </div>

            {/* Right: Time Slots / Form */}
            <div className="p-8">
              {!selectedDate ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">Pick a date to see available times</p>
                </div>
              ) : !selectedSlot ? (
                <>
                  <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                    {format(selectedDate, 'EEE, MMM d')}
                  </h3>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-3">No available times</p>
                      <button
                        onClick={() => setSelectedDate(undefined)}
                        className="text-xs text-gray-700 hover:text-black font-medium"
                      >
                        Pick another date
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full px-3 py-2.5 text-sm text-center border rounded-md hover:border-black transition-colors"
                          style={{ borderColor: '#d1d5db' }}
                          data-testid={`time-slot-${idx}`}
                        >
                          {formatTime(slot.start_time)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="text-xs text-gray-600 hover:text-black mb-6 font-medium"
                  >
                    ← Back
                  </button>
                  <div className="mb-6 p-3 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-600 mb-1">Selected time</div>
                    <div className="text-sm font-semibold">{formatTime(selectedSlot.start_time)}</div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        style={{ borderColor: '#d1d5db' }}
                        required
                        placeholder="Your name"
                        data-testid="booking-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        style={{ borderColor: '#d1d5db' }}
                        required
                        placeholder="you@example.com"
                        data-testid="booking-email-input"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-4 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
                      data-testid="confirm-booking-button"
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
        .modern-calendar {
          width: 100%;
        }
        .modern-calendar .rdp {
          margin: 0;
          --rdp-cell-size: 40px;
        }
        .modern-calendar .rdp-months {
          width: 100%;
        }
        .modern-calendar .rdp-month {
          width: 100%;
        }
        .modern-calendar .rdp-caption {
          display: flex;
          justify-content: center;
          padding: 0 0 1rem 0;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .modern-calendar .rdp-head_cell {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
        }
        .modern-calendar .rdp-day {
          font-size: 0.875rem;
          border-radius: 6px;
          font-weight: 500;
        }
        .modern-calendar .rdp-day_selected {
          background-color: #000 !important;
          color: white !important;
          font-weight: 600;
        }
        .modern-calendar .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #f3f4f6;
        }
        .modern-calendar .rdp-day_today {
          font-weight: 700;
          color: #000;
        }
        .modern-calendar .rdp-day_disabled {
          color: #d1d5db;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
