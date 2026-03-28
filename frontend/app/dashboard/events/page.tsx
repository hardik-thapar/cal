'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventTypesAPI } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  duration: number;
  slug: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    slug: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventTypesAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
      setFormData({ title: '', description: '', duration: 30, slug: '' });
      setShowForm(false);
      setEditingId(null);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventTypesAPI.delete(id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event: EventType) => {
    setFormData({
      title: event.title,
      description: event.description,
      duration: event.duration,
      slug: event.slug,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
            <p className="text-gray-600 mt-1">Create and manage your event types</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/availability"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Availability
            </Link>
            <Link
              href="/dashboard/bookings"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Bookings
            </Link>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ title: '', description: '', duration: 30, slug: '' });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              New Event Type
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Event Type' : 'Create Event Type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL-friendly)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    pattern="[a-z0-9-]+"
                    placeholder="e.g., 30-min-meeting"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ title: '', description: '', duration: 30, slug: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
            <p className="text-gray-500">No event types yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>{event.duration} minutes</span>
                      <span>•</span>
                      <span>/book/{event.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      data-testid={`edit-event-${event.slug}`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      data-testid={`delete-event-${event.slug}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/book/${event.slug}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    target="_blank"
                  >
                    View booking page →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
