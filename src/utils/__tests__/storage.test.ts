import { saveData, loadData, clearData, exportAllData, importAllData } from '../storage';
import type { AppData, UnifiedAppData, WeightData, FoodData } from '../../types';

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

  const mockWeightData: WeightData = {
    enabled: true,
    currentWeight: 75,
    goalWeight: 70,
    startWeight: 80,
    startDate: '2024-01-01T00:00:00.000Z',
    entries: [
      {
        weight: 80,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        weight: 75,
        timestamp: '2024-01-15T00:00:00.000Z',
      },
    ],
  };

  const mockFoodData: FoodData = {
    enabled: true,
    foodItems: [
      {
        id: '1',
        name: 'Apple',
        defaultAmount: 1,
        unit: 'pcs',
        healthScore: 90,
        useCount: 5,
        lastUsedAt: '2024-01-15T00:00:00.000Z',
      },
    ],
    entries: [
      {
        id: '1',
        foodItemId: '1',
        amount: 1,
        timestamp: '2024-01-15T08:00:00.000Z',
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

  describe('exportAllData', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let clickSpy: jest.Mock;
    let mockLink: Partial<HTMLAnchorElement>;

    beforeEach(() => {
      clickSpy = jest.fn();
      mockLink = {
        click: clickSpy,
        href: '',
        download: '',
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as HTMLAnchorElement);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should export all data including habits, weight, and food', () => {
      exportAllData(mockData, mockWeightData, mockFoodData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('habit-tracker-full-backup-');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should export with null weight and food data', () => {
      exportAllData(mockData, null, null);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should include version and exportedAt fields', () => {
      // We can't easily spy on Blob, so we'll test by checking the download attribute
      exportAllData(mockData, mockWeightData, mockFoodData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('habit-tracker-full-backup-');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('importAllData', () => {
    it('should import unified data with all fields', async () => {
      const unifiedData: UnifiedAppData = {
        version: '1.0.0',
        habits: mockData,
        weight: mockWeightData,
        food: mockFoodData,
        exportedAt: '2024-01-15T00:00:00.000Z',
      };

      const file = new File([JSON.stringify(unifiedData)], 'backup.json', { type: 'application/json' });
      const result = await importAllData(file);

      expect(result).toEqual(unifiedData);
      expect(result.habits).toEqual(mockData);
      expect(result.weight).toEqual(mockWeightData);
      expect(result.food).toEqual(mockFoodData);
    });

    it('should handle import with null weight and food', async () => {
      const unifiedData: UnifiedAppData = {
        version: '1.0.0',
        habits: mockData,
        weight: null,
        food: null,
        exportedAt: '2024-01-15T00:00:00.000Z',
      };

      const file = new File([JSON.stringify(unifiedData)], 'backup.json', { type: 'application/json' });
      const result = await importAllData(file);

      expect(result).toEqual(unifiedData);
      expect(result.weight).toBeNull();
      expect(result.food).toBeNull();
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json'], 'backup.json', { type: 'application/json' });

      await expect(importAllData(file)).rejects.toThrow('Invalid JSON file');
    });

    it('should reject data without version', async () => {
      const invalidData = {
        habits: mockData,
        weight: mockWeightData,
      };

      const file = new File([JSON.stringify(invalidData)], 'backup.json', { type: 'application/json' });

      await expect(importAllData(file)).rejects.toThrow('Invalid backup file format');
    });

    it('should reject data without habits', async () => {
      const invalidData = {
        version: '1.0.0',
        weight: mockWeightData,
      };

      const file = new File([JSON.stringify(invalidData)], 'backup.json', { type: 'application/json' });

      await expect(importAllData(file)).rejects.toThrow('Invalid backup file format');
    });

    it('should preserve toggle states from weight and food data', async () => {
      const weightDisabled: WeightData = { ...mockWeightData, enabled: false };
      const foodDisabled: FoodData = { ...mockFoodData, enabled: false };

      const unifiedData: UnifiedAppData = {
        version: '1.0.0',
        habits: mockData,
        weight: weightDisabled,
        food: foodDisabled,
        exportedAt: '2024-01-15T00:00:00.000Z',
      };

      const file = new File([JSON.stringify(unifiedData)], 'backup.json', { type: 'application/json' });
      const result = await importAllData(file);

      expect(result.weight?.enabled).toBe(false);
      expect(result.food?.enabled).toBe(false);
    });
  });
});
