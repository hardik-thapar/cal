'use client';

import { useState, useEffect } from 'react';
import { schedulesAPI, slotsAPI } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  timezone: string;
}

interface Slot {
  id: string;
  schedule_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      fetchSlots();
    }
  }, [selectedSchedule]);

  const fetchSchedules = async () => {
    try {
      const response = await schedulesAPI.getAll();
      setSchedules(response.data);
      if (response.data.length > 0 && !selectedSchedule) {
        setSelectedSchedule(response.data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedSchedule) return;
    try {
      const response = await slotsAPI.getAll(selectedSchedule);
      setSlots(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createSchedule = async () => {
    if (!newScheduleName) return;
    try {
      await schedulesAPI.create({ name: newScheduleName, timezone: 'UTC' });
      setNewScheduleName('');
      setShowNewSchedule(false);
      fetchSchedules();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addSlot = async () => {
    if (!selectedSchedule) return;
    try {
      await slotsAPI.create({
        schedule_id: selectedSchedule,
        ...newSlot,
      });
      fetchSlots();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      await slotsAPI.delete(id);
      fetchSlots();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-sm text-gray-600 mt-1">Configure times when you are available for bookings</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedSchedule || ''}
          onChange={(e) => setSelectedSchedule(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowNewSchedule(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      {showNewSchedule && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-semibold mb-4">Create New Schedule</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              placeholder="Schedule name"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={createSchedule}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewSchedule(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedSchedule && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold">Weekly Hours</h3>
          </div>

          <div className="p-6">
            {slots.length === 0 ? (
              <p className="text-gray-500 text-sm">No availability set</p>
            ) : (
              <div className="space-y-2">
                {slots
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900 w-24">{DAYS[slot.day_of_week]}</span>
                        <span className="text-sm text-gray-600">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold mb-4">Add Time Slot</h4>
              <div className="grid grid-cols-4 gap-4">
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  onClick={addSlot}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
