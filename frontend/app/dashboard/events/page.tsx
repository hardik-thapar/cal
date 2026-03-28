'use client';

import { useState, useEffect } from 'react';
import { eventTypesAPI, schedulesAPI } from '@/lib/api';
import { Plus, MoreVertical, Link as LinkIcon, Copy, Check, Clock } from 'lucide-react';

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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-600 mt-1">Create events to share for people to book on your calendar</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: '', description: '', duration: 30, slug: '', availability_schedule_id: '' });
          }}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors"
        >
          New Event Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg mb-6" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Event Type</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                style={{ borderColor: '#d1d5db' }}
                required
                placeholder="Quick Chat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                style={{ borderColor: '#d1d5db' }}
                rows={3}
                placeholder="A quick video meeting"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  style={{ borderColor: '#d1d5db' }}
                  required
                  placeholder="quick-chat"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <select
                value={formData.availability_schedule_id}
                onChange={(e) => setFormData({ ...formData, availability_schedule_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                style={{ borderColor: '#d1d5db' }}
              >
                <option value="">Select schedule</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900">
                {editingId ? 'Save' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                style={{ borderColor: '#d1d5db' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-gray-500 text-sm">No event types yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-5 rounded-lg hover:shadow-sm transition-shadow"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {event.duration}m
                    </span>
                    <button
                      onClick={() => copyLink(event.slug)}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      {copiedSlug === event.slug ? (
                        <><Check size={14} /> Copied!</>
                      ) : (
                        <><LinkIcon size={14} /> Copy link</>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
