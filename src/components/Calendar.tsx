import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
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

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    if (habits.length === 0) return { totalPossible: 0, totalCompleted: 0, percentage: 0 };

    const daysInMonth = dates.filter(d => d.getMonth() === month).length;
    const totalPossible = habits.length * daysInMonth;

    let totalCompleted = 0;
    dates.forEach(date => {
      if (date.getMonth() === month) {
        const dateKey = getDayKey(date);
        habits.forEach(habit => {
          if (habit.completions.some(d => d.startsWith(dateKey))) {
            totalCompleted++;
          }
        });
      }
    });

    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    return { totalPossible, totalCompleted, percentage };
  }, [habits, dates, month]);

  // Calculate current streak (7+ consecutive days with 100% completion)
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;

    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = getDayKey(checkDate);

      const completedCount = habits.filter(habit =>
        habit.completions.some(d => d.startsWith(dateKey))
      ).length;

      if (completedCount === habits.length) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [habits]);

  // Calculate daily completions for line chart
  const dailyCompletions = useMemo(() => {
    return dates
      .filter(d => d.getMonth() === month)
      .map(date => {
        const dateKey = getDayKey(date);
        const count = habits.filter(habit =>
          habit.completions.some(d => d.startsWith(dateKey))
        ).length;
        return { date: date.getDate(), count };
      });
  }, [habits, dates, month]);

  // Calculate per-habit monthly breakdown
  const habitBreakdown = useMemo(() => {
    const daysInMonth = dates.filter(d => d.getMonth() === month).length;

    return habits.map(habit => {
      let completedDays = 0;
      dates.forEach(date => {
        if (date.getMonth() === month) {
          const dateKey = getDayKey(date);
          if (habit.completions.some(d => d.startsWith(dateKey))) {
            completedDays++;
          }
        }
      });

      const percentage = daysInMonth > 0 ? Math.round((completedDays / daysInMonth) * 100) : 0;
      return { name: habit.name, completedDays, totalDays: daysInMonth, percentage };
    });
  }, [habits, dates, month]);

  // Get heat map color based on progress
  const getHeatMapColor = (progress: number) => {
    if (progress === 0) return '';
    if (progress <= 25) return 'bg-primary/10';
    if (progress <= 50) return 'bg-primary/30';
    if (progress <= 75) return 'bg-primary/50';
    return 'bg-primary/70';
  };

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
        <div className="flex gap-2">
          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Today
          </Button>
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
      </div>

      {/* Monthly Stats Card */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-primary">{monthlyStats.percentage}%</div>
            <div className="text-sm text-muted-foreground">
              {monthlyStats.totalCompleted}/{monthlyStats.totalPossible} habits completed
            </div>
          </div>
          {currentStreak >= 7 && (
            <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{currentStreak}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">day streak</div>
              </div>
            </div>
          )}
        </div>
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

          const heatMapColor = getHeatMapColor(progress);

          return (
            <div
              key={dateKey}
              onClick={handleDateClick}
              className={cn(
                'aspect-square flex items-center justify-center relative cursor-pointer hover:bg-accent/20 rounded-md transition-colors',
                !isCurrentMonth && 'opacity-30',
                heatMapColor
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

      {/* Line Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Daily Completions</h3>
        <div className="relative h-32">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{habits.length}</span>
            <span>{Math.floor(habits.length / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-6 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-t border-border/30" />
              <div className="border-t border-border/30" />
              <div className="border-t border-border/30" />
            </div>

            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <polyline
                points={dailyCompletions.map((d, i) => {
                  const x = (i / (dailyCompletions.length - 1)) * 100;
                  const y = 100 - (d.count / (habits.length || 1)) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Data points */}
              {dailyCompletions.map((d, i) => {
                const x = (i / (dailyCompletions.length - 1)) * 100;
                const y = 100 - (d.count / (habits.length || 1)) * 100;
                return (
                  <circle
                    key={i}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="2"
                    fill="hsl(var(--primary))"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Per-Habit Breakdown */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Habit Performance</h3>
        <div className="space-y-3">
          {habitBreakdown.map((habit, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{habit.name}</span>
                <span className="text-muted-foreground">
                  {habit.completedDays}/{habit.totalDays} - {habit.percentage}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${habit.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug info panel */}
      {debugInfo && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-yellow-900 dark:text-yellow-200">🐛 Debug Info (Tap date to see details)</h4>
            <button
              onClick={() => setDebugInfo(null)}
              className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap font-mono">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
};
