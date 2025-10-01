import { saveData, loadData, clearData } from '../storage';
import type { AppData } from '../../types';

describe('Storage utilities', () => {
  const mockData: AppData = {
    userName: 'Test User',
    habits: [
      {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: ['2024-01-01'],
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      saveData(mockData);
      const stored = localStorage.getItem('habit-tracker-data');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockData);
    });
  });

  describe('loadData', () => {
    it('should load data from localStorage', () => {
      localStorage.setItem('habit-tracker-data', JSON.stringify(mockData));
      const loaded = loadData();
      expect(loaded).toEqual(mockData);
    });

    it('should return null if no data exists', () => {
      const loaded = loadData();
      expect(loaded).toBeNull();
    });

    it('should return null if data is invalid', () => {
      localStorage.setItem('habit-tracker-data', 'invalid json');
      const loaded = loadData();
      expect(loaded).toBeNull();
    });
  });

  describe('clearData', () => {
    it('should clear data from localStorage', () => {
      localStorage.setItem('habit-tracker-data', JSON.stringify(mockData));
      clearData();
      expect(localStorage.getItem('habit-tracker-data')).toBeNull();
    });
  });
});
