'use client';

import { useState, useEffect } from 'react';
import { schedulesAPI, slotsAPI } from '@/lib/api';
import { Plus, Trash2, MoreHorizontal, Globe, Clock, ChevronRight } from 'lucide-react';

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
  const [userTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
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
      await schedulesAPI.create({ name: newScheduleName, timezone: userTimezone });
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  const currentSchedule = schedules.find(s => s.id === selectedSchedule);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
          <p className="text-sm text-brand-muted">Configure times when you are available for bookings.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-[#111111] border border-brand-border rounded-lg">
            <button className="px-3 py-1.5 text-xs font-semibold bg-brand-hover text-white rounded-md shadow-sm">My availability</button>
            <button className="px-3 py-1.5 text-xs font-semibold text-brand-muted hover:text-white rounded-md transition-colors">Team availability</button>
          </div>
          <button
            onClick={() => setShowNewSchedule(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* New Schedule Modal-like row */}
      {showNewSchedule && (
        <div className="p-6 bg-brand-secondary border border-brand-border rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-base font-semibold mb-4">Create a new schedule</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              placeholder="e.g. Working hours"
              className="flex-1 px-4 py-2 bg-black border border-brand-border text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-all"
            />
            <button
              onClick={createSchedule}
              className="btn-primary"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewSchedule(false)}
              className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule Manager */}
      {selectedSchedule && currentSchedule && (
        <div className="bg-brand-secondary border border-brand-border rounded-xl overflow-hidden shadow-sm">
          {/* Schedule Title/Selector */}
          <div className="px-6 py-5 border-b border-brand-border bg-[#111111] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-hover rounded-lg border border-brand-border">
                <Clock size={18} className="text-brand-muted" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">{currentSchedule.name}</h3>
                  <span className="px-2 py-0.5 bg-brand-hover border border-brand-border text-[#71717a] text-[10px] font-bold uppercase rounded-md">
                    Default
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-brand-muted font-medium">
                  {slots.length === 0 ? 'No hours set' : `${DAYS[slots[0]?.day_of_week]} - ${DAYS[slots[slots.length-1]?.day_of_week]}, ${slots[0]?.start_time.slice(0, 5)} - ${slots[0]?.end_time.slice(0, 5)}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-hover border border-brand-border rounded-lg group cursor-pointer">
                <Globe size={14} className="text-brand-muted group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold text-brand-muted group-hover:text-white transition-colors">Europe/London</span>
              </div>
              <button className="p-2 hover:bg-brand-hover rounded-lg transition-colors border border-transparent hover:border-brand-border text-brand-muted hover:text-white">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Slots List */}
            <div className="space-y-4 mb-10">
              {slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-brand-border rounded-xl bg-black/50">
                  <Clock size={32} className="text-brand-border mb-3" />
                  <p className="text-sm font-medium text-brand-muted mb-4 text-center">You haven't set any working hours for this schedule yet.</p>
                  <button
                    onClick={() => document.getElementById('add-hours-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary text-sm"
                  >
                    Set working hours
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-brand-border bg-black rounded-xl border border-brand-border">
                  {slots
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 group hover:bg-brand-hover transition-colors"
                      >
                        <div className="flex items-center gap-8">
                          <span className="text-sm font-bold text-white w-28 uppercase tracking-wider">{DAYS[slot.day_of_week]}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white px-3 py-1 bg-brand-secondary border border-brand-border rounded-md">
                              {slot.start_time.slice(0, 5)}
                            </span>
                            <span className="text-brand-muted">—</span>
                            <span className="text-sm font-medium text-white px-3 py-1 bg-brand-secondary border border-brand-border rounded-md">
                              {slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Add Hours Form */}
            <div id="add-hours-form" className="space-y-6 pt-8 border-t border-brand-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Add working hours</h4>
                  <p className="text-[13px] text-brand-muted mt-0.5 font-medium">Specify additional time slots for your availability.</p>
                </div>
                <div className="flex items-center gap-1 group cursor-pointer">
                  <span className="text-xs font-semibold text-brand-muted group-hover:text-white transition-colors uppercase tracking-wider">Troubleshooting?</span>
                  <ChevronRight size={14} className="text-brand-muted group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <div className="flex items-center flex-wrap gap-3 p-4 bg-black border border-brand-border rounded-xl">
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                  className="px-4 py-2 bg-brand-secondary border border-brand-border text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-white tracking-wide"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx} className="bg-brand-secondary uppercase">
                      {day}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="px-4 py-2 bg-brand-secondary border border-brand-border text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-white"
                  />
                  <span className="text-brand-muted text-sm font-bold">—</span>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="px-4 py-2 bg-brand-secondary border border-brand-border text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
                <button
                  onClick={addSlot}
                  className="btn-primary ml-auto flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Add slot</span>
                </button>
              </div>

              {/* Redirect Note */}
              <div className="pt-4 flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Temporarily out-of-office?</span>
                <button className="text-xs font-bold text-white hover:underline transition-all">
                  ADD A REDIRECT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Selector Link/List if multiple exist */}
      {schedules.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSchedule(s.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                selectedSchedule === s.id
                  ? 'bg-brand-secondary border-white ring-1 ring-white'
                  : 'bg-black border-brand-border hover:border-brand-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedSchedule === s.id ? 'bg-white text-black' : 'bg-brand-secondary text-brand-muted'}`}>
                  <Clock size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white leading-none tracking-tight uppercase">{s.name}</p>
                  <p className="text-[11px] text-brand-muted mt-1 font-semibold uppercase">{s.timezone}</p>
                </div>
              </div>
              {selectedSchedule === s.id && (
                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
