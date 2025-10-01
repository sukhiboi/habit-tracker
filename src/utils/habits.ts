import type { Habit } from '../types';
import { getToday } from './date';

// Fallback UUID generator for browsers that don't support crypto.randomUUID
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate a simple UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createHabit = (name: string): Habit => {
  return {
    id: generateUUID(),
    name,
    createdAt: new Date().toISOString(),
    completions: []
  };
};

export const isHabitCompletedToday = (habit: Habit): boolean => {
  const today = getToday();
  return habit.completions.some(date => date.startsWith(today));
};

export const toggleHabitCompletion = (habit: Habit, date?: string): Habit => {
  const targetDate = date || getToday();
  const isCompleted = habit.completions.some(d => d.startsWith(targetDate));

  if (isCompleted) {
    return {
      ...habit,
      completions: habit.completions.filter(d => !d.startsWith(targetDate))
    };
  } else {
    return {
      ...habit,
      completions: [...habit.completions, targetDate]
    };
  }
};

export const getTodayProgress = (habits: Habit[]): number => {
  if (habits.length === 0) return 0;
  const completedCount = habits.filter(isHabitCompletedToday).length;
  return Math.round((completedCount / habits.length) * 100);
};

export const getDateProgress = (habits: Habit[], date: string): number => {
  if (habits.length === 0) return 0;
  const completedCount = habits.filter(habit =>
    habit.completions.some(d => d.startsWith(date))
  ).length;
  return Math.round((completedCount / habits.length) * 100);
};
