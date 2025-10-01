import {
  createHabit,
  isHabitCompletedToday,
  toggleHabitCompletion,
  getTodayProgress,
  getDateProgress,
} from '../habits';
import { getToday } from '../date';
import type { Habit } from '../../types';

describe('Habit utilities', () => {
  describe('createHabit', () => {
    it('should create a new habit with correct properties', () => {
      const habit = createHabit('Exercise');
      expect(habit).toHaveProperty('id');
      expect(habit).toHaveProperty('name', 'Exercise');
      expect(habit).toHaveProperty('createdAt');
      expect(habit).toHaveProperty('completions', []);
      expect(habit.id).toBeTruthy();
    });
  });

  describe('isHabitCompletedToday', () => {
    const today = getToday();

    it('should return true if habit is completed today', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [today],
      };
      expect(isHabitCompletedToday(habit)).toBe(true);
    });

    it('should return false if habit is not completed today', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: ['2024-01-01'],
      };
      expect(isHabitCompletedToday(habit)).toBe(false);
    });

    it('should return false if habit has no completions', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [],
      };
      expect(isHabitCompletedToday(habit)).toBe(false);
    });
  });

  describe('toggleHabitCompletion', () => {
    it('should mark habit as completed for today', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [],
      };
      const updated = toggleHabitCompletion(habit);
      expect(updated.completions).toHaveLength(1);
      expect(updated.completions[0]).toContain(getToday());
    });

    it('should mark habit as incomplete if already completed', () => {
      const today = getToday();
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [today],
      };
      const updated = toggleHabitCompletion(habit);
      expect(updated.completions).toHaveLength(0);
    });

    it('should toggle completion for specific date', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [],
      };
      const updated = toggleHabitCompletion(habit, '2024-01-15');
      expect(updated.completions).toContain('2024-01-15');
    });
  });

  describe('getTodayProgress', () => {
    const today = getToday();

    it('should return 0 if no habits', () => {
      expect(getTodayProgress([])).toBe(0);
    });

    it('should calculate progress correctly', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: [today],
        },
        {
          id: '2',
          name: 'Read',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: [],
        },
      ];
      expect(getTodayProgress(habits)).toBe(50);
    });

    it('should return 100 if all habits completed', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: [today],
        },
        {
          id: '2',
          name: 'Read',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: [today],
        },
      ];
      expect(getTodayProgress(habits)).toBe(100);
    });
  });

  describe('getDateProgress', () => {
    it('should return 0 if no habits', () => {
      expect(getDateProgress([], '2024-01-15')).toBe(0);
    });

    it('should calculate progress for specific date', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: ['2024-01-15'],
        },
        {
          id: '2',
          name: 'Read',
          createdAt: '2024-01-01T00:00:00.000Z',
          completions: [],
        },
      ];
      expect(getDateProgress(habits, '2024-01-15')).toBe(50);
    });
  });
});
