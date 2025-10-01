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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
    <div className="p-4 space-y-4 overflow-y-auto h-full">
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
          const today = new Date();
          const todayKey = getDayKey(today);
          const isToday = dateKey === todayKey;

          const handleDateClick = () => {
            const completedHabits = habits.filter(habit =>
              habit.completions.some(d => d.startsWith(dateKey))
            );
            const info = `Date: ${dateKey}\nHabits: ${habits.length}\nCompleted: ${completedHabits.length}\nProgress: ${progress}%\n\nCompleted Habits:\n${completedHabits.map(h => `- ${h.name}`).join('\n')}\n\nAll completions for this date:\n${habits.map(h => {
              const completion = h.completions.find(d => d.startsWith(dateKey));
              return `${h.name}: ${completion || 'not completed'}`;
            }).join('\n')}`;
            setDebugInfo(info);
          };

          // Calculate circle circumference (2 * π * r), with r=40 in viewBox 100x100
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference - (progress / 100) * circumference;

          return (
            <div
              key={dateKey}
              onClick={handleDateClick}
              className={cn(
                'aspect-square flex items-center justify-center relative cursor-pointer hover:bg-accent/20',
                !isCurrentMonth && 'opacity-30'
              )}
            >
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
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

      {/* Debug info panel */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-yellow-900">🐛 Debug Info (Tap date to see details)</h4>
            <button
              onClick={() => setDebugInfo(null)}
              className="text-yellow-700 hover:text-yellow-900"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs text-yellow-900 whitespace-pre-wrap font-mono">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
};
