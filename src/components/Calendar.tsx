import { useState } from 'react';
import { cn } from '../lib/utils';
import type { Habit } from '../types';
import { getMonthDates, getDayKey } from '../utils/date';
import { getDateProgress } from '../utils/habits';

interface CalendarProps {
  habits: Habit[];
}

export const Calendar = ({ habits }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dates = getMonthDates(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const dateKey = getDayKey(date);
          const progress = getDateProgress(habits, dateKey);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = dateKey === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateKey}
              className={cn(
                'aspect-square flex items-center justify-center relative',
                !isCurrentMonth && 'opacity-30'
              )}
            >
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray={`${progress * 2.51} 251`}
                  className="transition-all duration-300"
                />
              </svg>

              {/* Date number */}
              <span
                className={cn(
                  'text-sm font-medium relative z-10',
                  isToday && 'font-bold text-primary'
                )}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
