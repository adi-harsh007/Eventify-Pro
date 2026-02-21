import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    className?: string;
    required?: boolean;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse current value or use today
    const parsedDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth());
    const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setCurrentMonth(d.getMonth());
                setCurrentYear(d.getFullYear());
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleSelectDate = (day: number) => {
        const date = new Date(Date.UTC(currentYear, currentMonth, day));
        onChange(date.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(Date.UTC(currentYear, currentMonth, i)).toISOString().split('T')[0];
            const isSelected = value === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectDate(i)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
                    ${isSelected ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25' :
                            isToday ? 'text-primary font-bold border border-primary/30 bg-primary/10' :
                                'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    const displayFormat = value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Select Date';

    return (
        <div className={`relative ${className || ''}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-input bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:bg-background"
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{displayFormat}</span>
                <CalendarIcon size={16} className="text-muted-foreground" />
            </button>

            {/* Hidden input to handle required natively if needed */}
            {required && (
                <input
                    type="text"
                    value={value}
                    onChange={() => { }}
                    required
                    className="absolute bottom-0 left-1/2 -z-10 w-0 h-0 opacity-0 bg-transparent"
                />
            )}

            {isOpen && (
                <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                        <button type="button" onClick={handlePrevMonth} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="font-semibold text-foreground">
                            {MONTHS[currentMonth]} {currentYear}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                        {DAYS.map(day => (
                            <div key={day} className="text-xs font-medium text-muted-foreground opacity-70">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};
