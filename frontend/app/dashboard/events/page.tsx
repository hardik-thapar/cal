'use client';

import { useState, useEffect } from 'react';
import { eventTypesAPI, schedulesAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Copy, Check, ExternalLink } from 'lucide-react';

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
    if (!confirm('Delete this event?')) return;
    try {
      await eventTypesAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (event: EventType) => {
    setFormData({
      title: event.title,
      description: event.description,
      duration: event.duration,
      slug: event.slug,
      availability_schedule_id: event.availability_schedule_id || '',
    });
    setEditingId(event.id);
    setShowForm(true);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
        <p className="text-sm text-gray-600 mt-1">Create and manage your event types</p>
      </div>

      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setFormData({ title: '', description: '', duration: 30, slug: '', availability_schedule_id: '' });
        }}
        className="mb-6 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <Plus size={18} />
        New Event Type
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Event Type</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                  min="15"
                  step="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability Schedule</label>
              <select
                value={formData.availability_schedule_id}
                onChange={(e) => setFormData({ ...formData, availability_schedule_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select a schedule</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.timezone})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No event types yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>{event.duration} min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={`/book/${event.slug}`}
                  target="_blank"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  View page
                </a>
                <button
                  onClick={() => copyLink(event.slug)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {copiedSlug === event.slug ? (
                    <>
                      <Check size={14} className="text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
