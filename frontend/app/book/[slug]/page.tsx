'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventTypesAPI, publicAPI } from '@/lib/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Clock, Calendar as CalendarIcon, User, Mail } from 'lucide-react';

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

    try {
      await publicAPI.createBooking({
        event_type_id: event.id,
        name: formData.name,
        email: formData.email,
        start_time: selectedSlot.start_time,
      });
      router.push(`/book/${slug}/confirm`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error creating booking');
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Event Header */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={18} />
              <span>{event.duration} minutes</span>
            </div>
          </div>

          {/* Booking Flow */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Calendar/Time Selection */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              {step === 'date' || step === 'time' ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <CalendarIcon size={24} />
                    Select a Date
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Confirm Details
                  </h2>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSlot && formatTimeSlot(selectedSlot.start_time)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStep('time');
                      setSelectedSlot(null);
                    }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    ← Change time
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Time Slots/Form */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              {step === 'date' && (
                <div className="flex items-center justify-center h-full text-center">
                  <p className="text-gray-500">Select a date to see available times</p>
                </div>
              )}

              {step === 'time' && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Available Times
                  </h2>
                  {loadingSlots ? (
                    <p className="text-gray-500">Loading available times...</p>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No available times for this date</p>
                      <button
                        onClick={() => {
                          setSelectedDate(undefined);
                          setStep('date');
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Choose another date
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          className="px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center font-medium text-gray-700 hover:text-blue-600"
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Enter Your Details
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User size={18} />
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="John Doe"
                        data-testid="booking-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={18} />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="john@example.com"
                        data-testid="booking-email-input"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      data-testid="confirm-booking-button"
                    >
                      Confirm Booking
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
