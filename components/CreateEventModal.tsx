import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { apiCreateEvent, apiUpdateEvent, apiUploadImage } from '../apiService';
import { X, Sparkles, Loader2, Calendar, MapPin, Users, Type, Clock, Image as ImageIcon, Upload } from 'lucide-react';
import { generateEventDescription } from '../geminiService';
import { DatePicker } from './ui/DatePicker';
import { TimePicker } from './ui/TimePicker';

interface CreateEventModalProps {
  editingEvent?: EventItem | null;
  onClose: () => void;
  onEventCreated: () => void;
}

const CATEGORIES = [
  'Hackathon', 'Tech Competition', 'Sports Event', 'Cultural Fest',
  'Music Concert', 'Workshop', 'Conference', 'Meetup', 'Webinar', 'Social', 'Other'
];
const DEPARTMENTS = ['CSE', 'ECE', 'Mechanical', 'Arts', 'Sports', 'Management', 'Science', 'General'];
const DEPT_LABELS: Record<string, string> = {
  CSE: '💻 CSE', ECE: '⚡ ECE', Mechanical: '⚙️ Mechanical',
  Arts: '🎨 Arts', Sports: '🏆 Sports', Management: '📊 Management',
  Science: '🔬 Science', General: '📌 General',
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({ editingEvent, onClose, onEventCreated }) => {
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
    category: 'Workshop',
    department: 'General',
    imageUrl: '',
    is_team_event: false,
    max_team_size: 1,
    no_of_teams: 10,
  });

  useEffect(() => {
    if (editingEvent) {
      const isTeam = !!editingEvent.is_team_event;
      const maxSize = editingEvent.max_team_size || 1;
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
        capacity: editingEvent.capacity,
        category: editingEvent.category,
        department: editingEvent.department || 'General',
        imageUrl: editingEvent.image_url || '',
        is_team_event: isTeam,
        max_team_size: maxSize,
        no_of_teams: isTeam ? Math.max(1, Math.floor((editingEvent.capacity || 1) / maxSize)) : 10,
      });
    }
  }, [editingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      if (payload.is_team_event) {
        payload.capacity = payload.no_of_teams * payload.max_team_size;
      }

      if (editingEvent) {
        await apiUpdateEvent(editingEvent.id, payload);
      } else {
        await apiCreateEvent(payload);
      }
      onEventCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title) return;
    setAiGenerating(true);
    try {
      const description = await generateEventDescription(formData.title, formData.category);
      setFormData(prev => ({ ...prev, description }));
      setError('');
    } catch (err: any) {
      setError(err.message || 'AI generation failed');
    }
    setAiGenerating(false);
  };

  const isEditing = !!editingEvent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md transition-all"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#0B0F19]/95 shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-8 py-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-sm text-slate-400">
              {isEditing ? 'Update the details of your event below.' : 'Fill in the details to publish a new event.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <Type size={14} className="text-blue-400" /> Event Title
              </label>
              <input required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/20"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Design Systems Workshop"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <Calendar size={14} className="text-emerald-400" /> Date
              </label>
              <DatePicker
                value={formData.date}
                onChange={date => setFormData(p => ({ ...p, date }))}
                required
                className="[&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white hover:[&>button]:border-white/20 hover:[&>button]:bg-white/10 focus:[&>button]:border-blue-500/50 focus:[&>button]:ring-4 focus:[&>button]:ring-blue-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <Clock size={14} className="text-amber-400" /> Time
              </label>
              <TimePicker
                value={formData.time}
                onChange={time => setFormData(p => ({ ...p, time }))}
                required
                className="[&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white hover:[&>button]:border-white/20 hover:[&>button]:bg-white/10 focus:[&>button]:border-blue-500/50 focus:[&>button]:ring-4 focus:[&>button]:ring-blue-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <MapPin size={14} className="text-pink-400" /> Location / Link
              </label>
              <input required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/20"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="San Francisco or Zoom"
              />
            </div>

            {!formData.is_team_event && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  <Users size={14} className="text-indigo-400" /> Max Capacity
                </label>
                <input type="number" required min="1"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/20"
                  value={formData.capacity}
                  onChange={e => setFormData(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            )}

            {/* Team Event Toggles */}
            <div className={`space-y-4 md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_team_event}
                    onChange={(e) => setFormData(p => ({ ...p, is_team_event: e.target.checked, max_team_size: e.target.checked ? p.max_team_size : 1 }))}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_team_event ? 'bg-indigo-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_team_event ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="text-sm font-semibold text-white">This is a Team Event</div>
              </label>

              {formData.is_team_event && (
                <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      <Users size={14} className="text-indigo-400" /> No. of Teams
                    </label>
                    <input type="number" required min="1"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 hover:border-white/20"
                      value={formData.no_of_teams}
                      onChange={e => setFormData(p => ({ ...p, no_of_teams: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      <Users size={14} className="text-indigo-400" /> Max Members per Team
                    </label>
                    <input type="number" required min="2"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 hover:border-white/20"
                      value={formData.max_team_size}
                      onChange={e => setFormData(p => ({ ...p, max_team_size: parseInt(e.target.value) || 2 }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                <ImageIcon size={14} className="text-teal-400" /> Event Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input type="url"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/20"
                  value={formData.imageUrl}
                  onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white border border-white/10 whitespace-nowrap">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span className="hidden sm:inline">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    setError('');
                    try {
                      const res = await apiUploadImage(file);
                      // The local backend serves it from /uploads, construct full URL or use relative depending on setup.
                      // Assuming frontend runs on different port, append API base
                      const fullUrl = res.imageUrl.startsWith('http') ? res.imageUrl : `http://localhost:3000${res.imageUrl}`;
                      setFormData(p => ({ ...p, imageUrl: fullUrl }));
                    } catch (err: any) {
                      setError(err.message || 'Image upload failed');
                    } finally {
                      setUploadingImage(false);
                    }
                  }} />
                </label>
              </div>
              {formData.imageUrl && (
                <div className="mt-2 text-xs text-blue-400 truncate opacity-80">
                  Preview: {formData.imageUrl}
                </div>
              )}
            </div>

            {/* Department picker */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400">Department</label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map(dept => {
                  const isActive = formData.department === dept;
                  return (
                    <button key={dept} type="button"
                      onClick={() => setFormData(p => ({ ...p, department: dept }))}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.4)] border border-transparent'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}>
                      {DEPT_LABELS[dept]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category picker */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const isActive = formData.category === cat;
                  return (
                    <button key={cat} type="button"
                      onClick={() => setFormData(p => ({ ...p, category: cat }))}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)] border border-transparent'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400">Description</label>
                <button type="button" onClick={handleAiGenerate}
                  disabled={aiGenerating || !formData.title}
                  className={`flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 transition-all  ${(aiGenerating || !formData.title) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    }`}>
                  {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI Magic
                </button>
              </div>
              <textarea required rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/20 custom-scrollbar"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your event..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex gap-4 border-t border-white/10 pt-6">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 py-4 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white border border-white/10"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Adding custom scrollbar styling globally for this modal's scope */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default CreateEventModal;
