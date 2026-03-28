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
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-12 rounded-2xl border border-gray-200">
          <h1 className="text-2xl font-bold">Event Not Found</h1>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 p-8 border-r border-gray-200">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{event.title}</h1>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{event.duration} min</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Select a Date</h3>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: new Date() }}
                  className="cal-picker"
                />
              </div>

              {selectedDate && selectedSlot && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Check size={16} className="text-green-600" />
                    <span>{format(selectedDate, 'EEE, MMM d')}</span>
                  </div>
                  <div className="text-sm text-gray-600">{formatTime(selectedSlot.start_time)}</div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 p-8">
              {!selectedDate ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Select a date to see available times</p>
                </div>
              ) : !selectedSlot ? (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-sm mb-4">No available times</p>
                      <button
                        onClick={() => setSelectedDate(undefined)}
                        className="text-sm text-gray-900 hover:underline"
                      >
                        Choose another date
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition"
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
                    className="text-sm text-gray-600 hover:text-gray-900 mb-6"
                  >
                    ← Change time
                  </button>
                  <h3 className="text-sm font-semibold text-gray-900 mb-6">Enter Details</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                          data-testid="booking-name-input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                          data-testid="booking-email-input"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
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
        .cal-picker .rdp {
          --rdp-cell-size: 40px;
          margin: 0;
        }
        .cal-picker .rdp-day_selected {
          background-color: #111827;
          color: white;
        }
        .cal-picker .rdp-day_selected:hover {
          background-color: #1f2937;
        }
        .cal-picker .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}
