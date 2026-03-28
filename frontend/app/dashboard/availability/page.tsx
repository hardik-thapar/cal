'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { availabilityAPI } from '@/lib/api';
import { Plus } from 'lucide-react';

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'UTC',
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await availabilityAPI.getAll();
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await availabilityAPI.create(formData);
      setFormData({ day_of_week: 1, start_time: '09:00', end_time: '17:00', timezone: 'UTC' });
      setShowForm(false);
      fetchAvailability();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error saving availability');
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
            <p className="text-gray-600 mt-1">Set your available hours</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/events"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Event Types
            </Link>
            <Link
              href="/dashboard/bookings"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Bookings
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              data-testid="add-availability-button"
            >
              <Plus size={20} />
              Add Hours
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add Availability</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {availability.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-200">
            <p className="text-gray-500">No availability set. Add your working hours!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">Day</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Start Time</th>
                  <th className="text-left p-4 font-semibold text-gray-900">End Time</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Timezone</th>
                </tr>
              </thead>
              <tbody>
                {availability
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((avail) => (
                    <tr key={avail.id} className="border-b border-gray-100 last:border-0">
                      <td className="p-4 text-gray-900">{DAYS[avail.day_of_week]}</td>
                      <td className="p-4 text-gray-600">{formatTime(avail.start_time)}</td>
                      <td className="p-4 text-gray-600">{formatTime(avail.end_time)}</td>
                      <td className="p-4 text-gray-600">{avail.timezone}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
