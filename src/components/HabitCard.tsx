import { useState, useRef, TouchEvent } from 'react';
import { cn } from '../lib/utils';
import type { Habit } from '../types';
import { isHabitCompletedToday } from '../utils/habits';

interface HabitCardProps {
  habit: Habit;
  isFirst?: boolean;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard = ({ habit, isFirst, onToggle, onDelete }: HabitCardProps) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const isCompleted = isHabitCompletedToday(habit);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setSwipeX(Math.max(-100, Math.min(100, diff)));
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(swipeX) > 50) {
      onToggle(habit.id);
    }
    setSwipeX(0);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-card border border-border',
        isFirst ? 'h-48' : 'h-16'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator backgrounds */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-start pl-6 text-white font-medium transition-opacity',
          swipeX > 0 ? 'bg-green-500 opacity-100' : 'bg-green-500 opacity-0'
        )}
      >
        ✓ Complete
      </div>
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-end pr-6 text-white font-medium transition-opacity',
          swipeX < 0 ? 'bg-red-500 opacity-100' : 'bg-red-500 opacity-0'
        )}
      >
        ✗ Undo
      </div>

      {/* Main card content */}
      <div
        className={cn(
          'absolute inset-0 bg-card flex items-center justify-between px-6 transition-transform',
          isCompleted && 'opacity-60'
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
      >
        <div className={cn('flex-1', isFirst && 'flex flex-col justify-center')}>
          <h3
            className={cn(
              'font-semibold',
              isFirst ? 'text-2xl' : 'text-lg',
              isCompleted && 'line-through'
            )}
          >
            {habit.name}
          </h3>
          {isFirst && (
            <p className="text-sm text-muted-foreground mt-2">
              Swipe right to complete, left to undo
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isCompleted && (
            <div className="text-green-500 text-2xl">✓</div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id);
            }}
            className="text-destructive hover:text-destructive/80 transition-colors"
            aria-label="Delete habit"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
