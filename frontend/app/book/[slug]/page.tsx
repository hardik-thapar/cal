'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Loader,
  CheckCircle2,
  Video,
  MapPin,
  Phone,
  User,
  Mail,
  AlertCircle
} from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, parseISO } from 'date-fns';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState<'selection' | 'details' | 'success'>('selection');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (slug) fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && slug) {
      fetchSlots();
    }
  }, [selectedDate, slug]);

  const fetchEvent = async () => {
    try {
      const res = await publicAPI.getEvent(slug);
      setEvent(res.data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await publicAPI.getSlots(slug, dateStr);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !event) return;
    
    setBookingLoading(true);
    try {
      await publicAPI.book({
        event_type_id: event.id,
        name: formData.name,
        email: formData.email,
        start_time: selectedSlot.start_time,
      });
      setStep('success');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Booking failed. Please try another slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-white" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Event not found</h1>
        <button onClick={() => router.push('/')} className="btn-secondary">go home</button>
      </div>
    </div>
  );

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-secondary border border-brand-border rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-bold mb-2 uppercase tracking-tighter">This meeting is scheduled</h1>
          <p className="text-brand-muted text-sm mb-8 font-medium">We sent an email with a calendar invitation to {formData.email}.</p>
          
          <div className="space-y-4 text-left border-t border-brand-border pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-hover rounded flex items-center justify-center">
                <CalendarIcon size={16} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight">
                {format(parseISO(selectedSlot!.start_time), 'EEEE, MMMM do, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-hover rounded flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span className="text-sm font-bold uppercase tracking-tight">
                {format(parseISO(selectedSlot!.start_time), 'HH:mm')} - {format(parseISO(selectedSlot!.end_time), 'HH:mm')}
              </span>
            </div>
          </div>
          
          <button onClick={() => router.push('/')} className="btn-primary w-full mt-10 uppercase font-bold tracking-widest text-xs py-3">
            Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full bg-[#111111] border border-brand-border rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Panel: Event Info */}
        <div className="w-full md:w-1/3 p-8 md:p-10 border-b md:border-b-0 md:border-r border-brand-border bg-[#0a0a0a]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-hover rounded-full flex items-center justify-center border border-brand-border">
              <span className="text-sm font-bold">HT</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Hardik Thapar</p>
              <h2 className="text-lg font-bold uppercase tracking-tight">{event.title}</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-brand-muted">
              <Clock size={18} />
              <span className="text-sm font-bold uppercase tracking-tight">{event.duration}m</span>
            </div>
            <div className="flex items-center gap-2.5 text-brand-muted">
              <Video size={18} />
              <span className="text-sm font-bold uppercase tracking-tight">Cal Video</span>
            </div>
            {event.description && (
              <p className="text-sm text-brand-muted font-medium pt-4 border-t border-brand-border">
                {event.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-10 flex items-center gap-2 text-[11px] font-bold text-[#71717a] uppercase tracking-widest">
            <Globe size={14} />
            <span>Asia/Kolkata</span>
          </div>
        </div>

        {/* Middle Panel: Calendar */}
        {step === 'selection' && (
          <div className="flex-1 p-8 md:p-10 bg-[#111111] border-brand-border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold uppercase tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-brand-hover rounded-lg transition-colors border border-brand-border">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-brand-hover rounded-lg transition-colors border border-brand-border">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(d => (
                <span key={d} className="text-[10px] font-bold text-brand-muted uppercase tracking-widest py-2">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, i) => {
                const isCurrentMonth = isSameMonth(date, monthStart);
                const isPast = date < new Date() && !isToday(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                
                return (
                  <button
                    key={i}
                    disabled={!isCurrentMonth || isPast}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-2 text-sm font-bold rounded-lg flex flex-col items-center justify-center transition-all relative
                      ${!isCurrentMonth ? 'text-transparent pointer-events-none' : ''}
                      ${isPast ? 'text-[#333333] cursor-not-allowed' : 'text-white hover:bg-brand-hover'}
                      ${isSelected ? 'bg-white text-black hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10' : ''}
                    `}
                  >
                    {format(date, 'd')}
                    {isToday(date) && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Panel: Time Slots or Form */}
        {step === 'selection' && (
          <div className="w-full md:w-[320px] p-8 md:p-10 border-t md:border-t-0 md:border-l border-brand-border bg-[#0a0a0a] flex flex-col min-h-[400px]">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-tight">
                    {format(selectedDate, 'EEE d')}
                  </h3>
                  <div className="flex p-0.5 bg-brand-hover rounded-md text-[9px] font-bold uppercase border border-brand-border">
                    <span className="px-2 py-1 bg-black rounded shadow-sm">12h</span>
                    <span className="px-2 py-1 text-brand-muted">24h</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {slotsLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader className="w-5 h-5 animate-spin text-brand-muted" />
                    </div>
                  ) : slots.length > 0 ? (
                    slots.filter(s => s.available).map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <button
                          onClick={() => setSelectedSlot(s)}
                          className={`
                            flex-1 py-3 text-sm font-bold rounded-lg border transition-all text-center uppercase tracking-tight
                            ${selectedSlot === s ? 'w-1/2 bg-brand-muted border-brand-muted text-white' : 'w-full border-brand-border hover:border-white text-white'}
                          `}
                        >
                          {format(parseISO(s.start_time), 'HH:mm')}
                        </button>
                        {selectedSlot === s && (
                          <button
                            onClick={() => setStep('details')}
                            className="w-1/2 py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-brand-muted transition-all uppercase tracking-widest"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-muted text-center pt-10 font-medium">No slots available for this date.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-brand-hover rounded-xl flex items-center justify-center mb-4 border border-brand-border">
                  <CalendarIcon size={20} className="text-brand-muted" />
                </div>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Select a date to see available times</p>
              </div>
            )}
          </div>
        )}

        {/* Full Details Step */}
        {step === 'details' && (
          <div className="flex-1 p-8 md:p-10 bg-[#111111] animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep('selection')} className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted hover:text-white mb-8 group transition-colors uppercase tracking-[0.2em]">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <h3 className="text-xl font-bold uppercase tracking-tight mb-8">Confirm your booking</h3>
            
            <form onSubmit={handleBook} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-brand-border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-sm"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-brand-border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} /> Anything else we should know?
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-brand-border text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-sm min-h-[120px]"
                  placeholder="Optional notes for the host..."
                />
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                  Total duration: <span className="text-white">{event.duration} minutes</span>
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn-primary px-8 py-3 flex items-center gap-2 uppercase font-bold tracking-widest text-xs"
                >
                  {bookingLoading ? <Loader size={16} className="animate-spin" /> : 'Confirm Booking'}
                  {!bookingLoading && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
