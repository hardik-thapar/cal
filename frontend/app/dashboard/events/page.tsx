'use client';

import { useState, useEffect } from 'react';
import { eventTypesAPI, schedulesAPI } from '@/lib/api';
import { Plus, MoreVertical, Link as LinkIcon, Check, Clock, ExternalLink, Trash2, Edit2, Globe } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  duration: number;
  slug: string;
  availability_schedule_id: string | null;
}

interface Schedule {
  id: string;
  name: string;
  timezone: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    slug: '',
    availability_schedule_id: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, schedulesRes] = await Promise.all([
        eventTypesAPI.getAll(),
        schedulesAPI.getAll(),
      ]);
      setEvents(eventsRes.data);
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await eventTypesAPI.update(editingId, formData);
      } else {
        await eventTypesAPI.create(formData);
      }
      setFormData({ title: '', description: '', duration: 30, slug: '', availability_schedule_id: '' });
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event type?')) return;
    try {
      await eventTypesAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Event types</h1>
          <p className="text-sm text-brand-muted">Create events to share for people to book on your calendar.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: '', description: '', duration: 30, slug: '', availability_schedule_id: schedules[0]?.id || '' });
          }}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <Plus size={16} />
          <span>New</span>
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="p-8 bg-brand-secondary border border-brand-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-tight">
            {editingId ? 'Edit event type' : 'Create a new event type'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-brand-muted uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-brand-border text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-all"
                  required
                  placeholder="e.g. 15min Meeting"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-brand-muted uppercase tracking-wider">URL Slug</label>
                <div className="flex items-center bg-black border border-brand-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-white transition-all">
                  <span className="pl-4 pr-1 text-brand-muted text-sm font-medium">cal.com/hardik/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="flex-1 px-1 py-2.5 bg-transparent text-white text-sm focus:outline-none"
                    required
                    placeholder="slug"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-brand-muted uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-black border border-brand-border text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-all min-h-[100px]"
                placeholder="What is this meeting about?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-brand-muted uppercase tracking-wider">Duration</label>
                <div className="relative">
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-black border border-brand-border text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-all appearance-none"
                  >
                    {[15, 30, 45, 60, 90].map(m => (
                      <option key={m} value={m} className="bg-brand-secondary">{m} minutes</option>
                    ))}
                  </select>
                  <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-brand-muted uppercase tracking-wider">Availability</label>
                <div className="relative">
                  <select
                    value={formData.availability_schedule_id}
                    onChange={(e) => setFormData({ ...formData, availability_schedule_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-brand-border text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-all appearance-none"
                  >
                    <option value="" className="bg-brand-secondary">Select a schedule</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id} className="bg-brand-secondary">
                        {s.name} ({s.timezone})
                      </option>
                    ))}
                  </select>
                  <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
              <button type="submit" className="btn-primary px-6">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-bold text-brand-muted hover:text-white transition-colors uppercase tracking-tight"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-secondary/30">
            <LinkIcon size={40} className="text-brand-border mb-4" />
            <p className="text-brand-muted font-bold uppercase tracking-wider text-sm">No event types created yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-xs font-bold text-white hover:underline uppercase tracking-widest"
            >
              CREATE YOUR FIRST EVENT
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="group bg-brand-secondary border border-brand-border rounded-xl p-6 hover:border-brand-muted transition-all duration-300 hover:shadow-xl relative flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-black rounded-lg border border-brand-border group-hover:border-brand-muted transition-colors">
                  <Clock size={20} className="text-white" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(event.id);
                      setFormData({
                        title: event.title,
                        description: event.description || '',
                        duration: event.duration,
                        slug: event.slug,
                        availability_schedule_id: event.availability_schedule_id || '',
                      });
                      setShowForm(true);
                    }}
                    className="p-1.5 hover:bg-brand-hover rounded-md text-brand-muted hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-md text-brand-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-white tracking-tight uppercase mb-1">{event.title}</h3>
                <p className="text-sm text-brand-muted font-medium line-clamp-2 min-h-[40px] mb-4">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-brand-border mt-auto">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-muted uppercase tracking-widest">
                  <Clock size={12} />
                  <span>{event.duration}m</span>
                </div>
                <div className="h-1 w-1 bg-brand-border rounded-full" />
                <button
                  onClick={() => copyLink(event.slug)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-brand-muted hover:text-white uppercase tracking-widest transition-colors"
                >
                  {copiedSlug === event.slug ? (
                    <><Check size={12} className="text-green-500" /> <span>Copied</span></>
                  ) : (
                    <><LinkIcon size={12} /> <span>Copy link</span></>
                  )}
                </button>
                <a 
                  href={`/book/${event.slug}`}
                  target="_blank"
                  className="ml-auto p-1.5 hover:bg-brand-hover rounded-md text-brand-muted hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
