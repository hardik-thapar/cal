'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventTypesAPI } from '@/lib/api';
import { Calendar, Clock, ChevronRight, Share2, Globe, Command } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  duration: number;
  slug: string;
}

export default function PublicProfilePage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventTypesAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto pt-24 pb-20 px-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-brand-secondary border border-brand-border rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              HT
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-4 border-black rounded-full flex items-center justify-center">
              <CheckCircle size={14} className="text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2 leading-none">Hardik Thapar</h1>
          <div className="flex items-center gap-2 text-brand-muted text-[10px] font-bold uppercase tracking-[0.3em]">
            <Globe size={14} />
            <span>Asia/Kolkata</span>
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.5em] mb-6 border-b border-brand-border pb-4">Select an event</h2>
          
          {events.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-secondary/30">
              <Command size={32} className="text-brand-border mb-4 animate-pulse" />
              <p className="text-brand-muted font-bold uppercase tracking-wider text-xs">No public events available</p>
            </div>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/book/${event.slug}`}
                className="group flex flex-col p-6 bg-brand-secondary border border-brand-border rounded-2xl hover:border-white transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-white transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold uppercase tracking-widest">
                      <Clock size={14} />
                      <span>{event.duration} minutes</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-brand-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                {event.description && (
                  <p className="mt-4 text-sm text-brand-muted font-medium line-clamp-2 max-w-xl group-hover:text-[#a1a1aa] transition-colors">
                    {event.description}
                  </p>
                )}
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[80px] rounded-full -mr-10 -mt-10 group-hover:bg-white/10 transition-colors" />
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Calendar className="w-5 h-5 text-brand-muted group-hover:text-white transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-muted group-hover:text-white transition-colors">Cal.com Clone</span>
          </div>
          <button className="p-2 border border-brand-border rounded-lg text-brand-muted hover:text-white hover:border-white transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
