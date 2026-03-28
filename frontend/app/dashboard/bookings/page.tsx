'use client';

import { useState, useEffect } from 'react';
import { bookingsAPI } from '@/lib/api';
import { X, Video, MoreHorizontal, Filter, ChevronDown, Calendar, Clock, User, ExternalLink, Trash2 } from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';

interface Booking {
  id: string;
  event_type_id: string;
  name: string;
  email: string;
  start_time: string;
  end_time: string;
  status: string;
  event_type?: {
    title: string;
    duration: number;
  };
}

export default function BookingsPage() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recurring' | 'past' | 'canceled'>('upcoming');

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

  const getBookingsForTab = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings.filter(b => b.status === 'booked');
      case 'past':
        return pastBookings;
      case 'canceled':
        return [...upcomingBookings, ...pastBookings].filter(b => b.status === 'cancelled');
      default:
        return [];
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  const bookings = getBookingsForTab();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-brand-muted">See upcoming and past events booked through your event type links.</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-1">
        <div className="flex items-center gap-6">
          {(['upcoming', 'recurring', 'past', 'canceled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-3 text-sm font-bold uppercase tracking-widest transition-all relative
                ${activeTab === tab ? 'text-white' : 'text-brand-muted hover:text-white'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary border border-brand-border text-brand-muted hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary border border-brand-border text-brand-muted hover:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-secondary/30">
            <Calendar size={40} className="text-brand-border mb-4" />
            <p className="text-brand-muted font-bold uppercase tracking-wider text-sm">No {activeTab} bookings yet</p>
          </div>
        ) : (
          <div className="bg-brand-secondary border border-brand-border rounded-xl overflow-hidden shadow-sm divide-y divide-brand-border">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-brand-hover transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 bg-black rounded-lg border border-brand-border group-hover:border-brand-muted transition-colors">
                      <Clock size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight uppercase mb-1">
                        {booking.event_type?.title || 'Meeting'} with {booking.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-brand-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{format(parseISO(booking.start_time), 'EEEE, MMMM do')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span>{booking.name} ({booking.email})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-14 md:ml-0">
                    {booking.status === 'booked' && (
                      <button className="btn-secondary px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 group/btn">
                        <Video size={14} className="text-brand-muted group-hover/btn:text-white transition-colors" />
                        Join Video
                      </button>
                    )}
                    
                    {booking.status === 'booked' && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="p-2.5 hover:bg-red-500/10 rounded-lg text-brand-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                        title="Cancel Booking"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="relative group/menu">
                      <button className="p-2.5 hover:bg-brand-hover rounded-lg text-brand-muted hover:text-white transition-colors border border-transparent hover:border-brand-border">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between pt-4 text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">
        <span>Showing {bookings.length} result(s)</span>
        <div className="flex items-center gap-4">
          <button className="hover:text-white transition-colors disabled:opacity-30" disabled>Previous</button>
          <button className="hover:text-white transition-colors disabled:opacity-30" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
