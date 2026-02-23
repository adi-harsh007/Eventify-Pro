import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { EventItem } from '../../types';
import { cn } from '../../lib/utils';
import { ParticleTextEffect } from './particle-text-effect';

interface CalendarViewProps {
  events: EventItem[]; // The events that the user is registered for (My Tickets)
  onEventClick?: (eventId: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get events for a specific date
  const eventsForDate = (day: number) => {
    return events.filter(e => {
        try {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                   eventDate.getMonth() === month &&
                   eventDate.getFullYear() === year;
        } catch {
            return false;
        }
    });
  };

  const selectedDateEvents = selectedDate ? eventsForDate(selectedDate.getDate()) : [];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 sm:h-28 border border-white/5 bg-transparent" />);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayEvents = eventsForDate(i);
    const hasEvents = dayEvents.length > 0;
    const isSelected = selectedDate?.getDate() === i;

    days.push(
      <button
        key={`day-${i}`}
        onClick={() => {
            if (hasEvents) {
                setSelectedDate(new Date(year, month, i));
            } else {
                setSelectedDate(null);
            }
        }}
        className={cn(
          "relative h-24 sm:h-28 border border-white/5 p-2 transition-all duration-300 flex flex-col items-start justify-start group hover:bg-white/[0.02]",
          hasEvents ? "cursor-pointer" : "cursor-default",
          isSelected ? "bg-indigo-500/10 border-indigo-500/30" : "bg-[#0B0F19]/50"
        )}
      >
        <span className={cn(
          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors",
          isSelected ? "bg-indigo-500 text-white" : "text-slate-400 group-hover:text-slate-200",
          hasEvents && !isSelected ? "text-white" : ""
        )}>
          {i}
        </span>
        
        {/* Indicators for events */}
        <div className="flex flex-col gap-1 w-full mt-1 overflow-hidden">
          {dayEvents.slice(0, 2).map((e, idx) => (
            <div key={idx} className="w-full text-left truncate text-[10px] sm:text-xs rounded-md px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {e.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-[10px] text-slate-500 pl-1 w-full text-left mt-0.5">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>

        {/* Selected date glow */}
        {isSelected && (
             <div className="absolute inset-0 bg-indigo-500/5 blur-xl -z-10 pointer-events-none" />
        )}
      </button>
    );
  }

  const formatTime = (timeStr: string) => {
    try {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
        return timeStr;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto items-start">
        {/* Calendar Grid Section */}
        <div className="flex-1 w-full rounded-3xl overflow-hidden border border-white/10"
             style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <CalendarIcon size={20} />
                     </div>
                     <div>
                         <h2 className="text-xl font-bold text-white tracking-tight">{monthName} {year}</h2>
                         <p className="text-sm text-slate-400">Manage your event schedule</p>
                     </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days row */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 ">
                {days}
            </div>
        </div>

        {/* Side Panel for Selected Date Events */}
        <div className={cn(
            "w-full xl:w-[400px] shrink-0 transition-all duration-500 overflow-hidden",
            selectedDate ? "opacity-100 max-h-[1000px] xl:max-w-[400px]" : "opacity-0 max-h-0 xl:max-h-[1000px] xl:max-w-0"
        )}>
           <div className="rounded-3xl border border-white/10 p-6 h-full min-h-[500px]"
                style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.8) 0%, rgba(11,15,25,0.95) 100%)', backdropFilter: 'blur(16px)' }}>
                {selectedDate && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                                <p className="text-indigo-400 text-sm">{selectedDateEvents.length} Event{selectedDateEvents.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
                            {selectedDateEvents.map((event) => (
                                <div key={event.id} 
                                     onClick={() => onEventClick?.(event.id)}
                                     className="group relative rounded-2xl p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    
                                    <h4 className="text-white font-medium mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">{event.title}</h4>
                                    
                                    <div className="space-y-2 mt-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock size={12} className="text-indigo-400" />
                                            <span>{formatTime(event.time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <MapPin size={12} className="text-purple-400" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Action button mock */}
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{event.category}</span>
                                        <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                            View details <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
           </div>
        </div>
    </div>
  );
};
