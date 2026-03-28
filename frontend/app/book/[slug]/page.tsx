'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventTypesAPI, publicAPI } from '@/lib/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Clock, Calendar as CalendarIcon, User, Mail, ArrowLeft } from 'lucide-react';

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
  const [step, setStep] = useState<'date' | 'time' | 'form'>('date');

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
      setStep('time');
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setStep('form');
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
      alert(error.response?.data?.detail || 'Error creating booking. This slot may have been booked.');
      await fetchSlots();
      setStep('time');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Clock size={16} />
                <span className="text-sm">{event.duration} min</span>
              </div>
            </div>
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm">{event.description}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {step === 'date' || step === 'time' ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-blue-600" />
                  Select Date & Time
                </h2>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={{ before: new Date() }}
                    modifiersClassNames={{
                      selected: 'bg-blue-600 text-white hover:bg-blue-700',
                      today: 'font-bold',
                    }}
                    className="rdp-custom"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setStep('time');
                    setSelectedSlot(null);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm">Change date/time</span>
                </button>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1 font-medium">DATE</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-gray-600 mb-1 font-medium">TIME</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSlot && formatTimeSlot(selectedSlot.start_time)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {step === 'date' && (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a date to see available times</p>
                </div>
              </div>
            )}

            {step === 'time' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Times
                </h2>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No available times for this date</p>
                    <button
                      onClick={() => {
                        setSelectedDate(undefined);
                        setStep('date');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Choose another date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center font-medium text-gray-700 hover:text-blue-600"
                        data-testid={`time-slot-${index}`}
                      >
                        {formatTimeSlot(slot.start_time)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 'form' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Enter Your Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                        placeholder="John Doe"
                        data-testid="booking-name-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                        placeholder="john@example.com"
                        data-testid="booking-email-input"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="confirm-booking-button"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        <span>Confirming...</span>
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}