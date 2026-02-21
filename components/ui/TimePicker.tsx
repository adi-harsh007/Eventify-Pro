import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
    value: string; // HH:mm
    onChange: (time: string) => void;
    className?: string;
    required?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse HH:mm
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');
    const [period, setPeriod] = useState('PM');

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            if (h && m) {
                let hNum = parseInt(h, 10);
                const ampm = hNum >= 12 ? 'PM' : 'AM';
                hNum = hNum % 12;
                if (hNum === 0) hNum = 12;
                setHours(hNum.toString().padStart(2, '0'));
                setMinutes(m);
                setPeriod(ampm);
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

    const handleApply = (h: string, m: string, p: string) => {
        let hNum = parseInt(h, 10);
        if (p === 'PM' && hNum !== 12) hNum += 12;
        if (p === 'AM' && hNum === 12) hNum = 0;
        onChange(`${hNum.toString().padStart(2, '0')}:${m}`);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setHours(e.target.value);
        handleApply(e.target.value, minutes, period);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMinutes(e.target.value);
        handleApply(hours, e.target.value, period);
    };

    const handlePeriodChange = (val: string) => {
        setPeriod(val);
        handleApply(hours, minutes, val);
    };

    const displayFormat = value ? `${hours}:${minutes} ${period}` : 'Select Time';

    const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    // Increment by 5 for cleaner minutes, or 1 for precision. Let's do 15 minute intervals + custom? 
    // Native time pickers usually allow minute precision. Let's provide 00-59.
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className={`relative ${className || ''}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-input bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:bg-background"
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{displayFormat}</span>
                <Clock size={16} className="text-muted-foreground" />
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
                <div className="absolute z-50 mt-2 flex w-[280px] items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col items-center flex-1">
                        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hour</span>
                        <select
                            size={5}
                            value={hours}
                            onChange={handleHourChange}
                            className="h-32 w-16 rounded-xl border border-border/50 bg-background/40 p-1 text-center text-sm font-medium text-foreground outline-none transition-all hover:border-border cursor-pointer [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                        >
                            {hourOptions.map(h => <option key={h} value={h} className="py-1 cursor-pointer hover:bg-muted">{h}</option>)}
                        </select>
                    </div>

                    <div className="text-xl font-bold text-muted-foreground opacity-50 mb-[-16px] px-2">:</div>

                    <div className="flex flex-col items-center flex-1">
                        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minute</span>
                        <select
                            size={5}
                            value={minutes}
                            onChange={handleMinuteChange}
                            className="h-32 w-16 rounded-xl border border-border/50 bg-background/40 p-1 text-center text-sm font-medium text-foreground outline-none transition-all hover:border-border cursor-pointer [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                        >
                            {minuteOptions.map(m => <option key={m} value={m} className="py-1 cursor-pointer hover:bg-muted">{m}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col items-center ml-3">
                        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</span>
                        <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-background/40 p-1.5">
                            <button
                                type="button"
                                onClick={() => handlePeriodChange('AM')}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${period === 'AM' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePeriodChange('PM')}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${period === 'PM' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
