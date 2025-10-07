import { saveFoodData, loadFoodData, clearFoodData, exportFoodData, importFoodData } from '../foodStorage';
import type { FoodData } from '../../types';

describe('Food Storage utilities', () => {
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
      {
        id: '2',
        name: 'Chicken Breast',
        defaultAmount: 150,
        unit: 'g',
        healthScore: 85,
        useCount: 3,
        lastUsedAt: '2024-01-14T00:00:00.000Z',
      },
      {
        id: '3',
        name: 'Rice',
        defaultAmount: 1,
        unit: 'serving',
        servingDescription: 'bowl',
        healthScore: 70,
        useCount: 10,
        lastUsedAt: '2024-01-15T12:00:00.000Z',
      },
    ],
    entries: [
      {
        id: 'e1',
        foodItemId: '1',
        amount: 2,
        timestamp: '2024-01-15T08:00:00.000Z',
      },
      {
        id: 'e2',
        foodItemId: '2',
        amount: 150,
        timestamp: '2024-01-15T12:00:00.000Z',
        notes: 'Lunch',
      },
      {
        id: 'e3',
        foodItemId: '3',
        amount: 1,
        timestamp: '2024-01-15T12:05:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveFoodData', () => {
    it('should save food data to localStorage', () => {
      saveFoodData(mockFoodData);
      const stored = localStorage.getItem('habit-tracker-food-data');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockFoodData);
    });

    it('should overwrite existing food data', () => {
      saveFoodData(mockFoodData);
      const updatedData = { ...mockFoodData, foodItems: [] };
      saveFoodData(updatedData);

      const stored = localStorage.getItem('habit-tracker-food-data');
      expect(JSON.parse(stored!).foodItems).toHaveLength(0);
    });
  });

  describe('loadFoodData', () => {
    it('should load food data from localStorage', () => {
      localStorage.setItem('habit-tracker-food-data', JSON.stringify(mockFoodData));
      const loaded = loadFoodData();
      expect(loaded).toEqual(mockFoodData);
    });

    it('should return null if no food data exists', () => {
      const loaded = loadFoodData();
      expect(loaded).toBeNull();
    });

    it('should return null if food data is invalid', () => {
      localStorage.setItem('habit-tracker-food-data', 'invalid json');
      const loaded = loadFoodData();
      expect(loaded).toBeNull();
    });

    it('should preserve enabled state', () => {
      const disabledData = { ...mockFoodData, enabled: false };
      localStorage.setItem('habit-tracker-food-data', JSON.stringify(disabledData));
      const loaded = loadFoodData();
      expect(loaded?.enabled).toBe(false);
    });

    it('should preserve all food item properties', () => {
      localStorage.setItem('habit-tracker-food-data', JSON.stringify(mockFoodData));
      const loaded = loadFoodData();

      expect(loaded?.foodItems[2].servingDescription).toBe('bowl');
      expect(loaded?.foodItems[0].healthScore).toBe(90);
      expect(loaded?.foodItems[1].useCount).toBe(3);
    });
  });

  describe('clearFoodData', () => {
    it('should clear food data from localStorage', () => {
      localStorage.setItem('habit-tracker-food-data', JSON.stringify(mockFoodData));
      clearFoodData();
      expect(localStorage.getItem('habit-tracker-food-data')).toBeNull();
    });

    it('should not affect other storage keys', () => {
      localStorage.setItem('habit-tracker-data', JSON.stringify({ userName: 'Test' }));
      localStorage.setItem('habit-tracker-food-data', JSON.stringify(mockFoodData));

      clearFoodData();

      expect(localStorage.getItem('habit-tracker-food-data')).toBeNull();
      expect(localStorage.getItem('habit-tracker-data')).toBeTruthy();
    });
  });

  describe('exportFoodData', () => {
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
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as Node);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as Node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should export food data as JSON file', () => {
      exportFoodData(mockFoodData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('food-data-');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should create downloadable file with correct name', () => {
      exportFoodData(mockFoodData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/food-data-\d{4}-\d{2}-\d{2}\.json/);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('importFoodData', () => {
    it('should import valid food data', async () => {
      const file = new File([JSON.stringify(mockFoodData)], 'food-data.json', { type: 'application/json' });
      const result = await importFoodData(file);

      expect(result).toEqual(mockFoodData);
      expect(result.enabled).toBe(true);
      expect(result.foodItems).toHaveLength(3);
      expect(result.entries).toHaveLength(3);
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json'], 'food-data.json', { type: 'application/json' });

      await expect(importFoodData(file)).rejects.toThrow('Invalid JSON file');
    });

    it('should import food data with disabled state', async () => {
      const disabledData = { ...mockFoodData, enabled: false };
      const file = new File([JSON.stringify(disabledData)], 'food-data.json', { type: 'application/json' });
      const result = await importFoodData(file);

      expect(result.enabled).toBe(false);
    });

    it('should preserve all food item details', async () => {
      const file = new File([JSON.stringify(mockFoodData)], 'food-data.json', { type: 'application/json' });
      const result = await importFoodData(file);

      const riceItem = result.foodItems.find(item => item.name === 'Rice');
      expect(riceItem?.servingDescription).toBe('bowl');
      expect(riceItem?.unit).toBe('serving');
      expect(riceItem?.healthScore).toBe(70);
    });

    it('should preserve all entry notes and timestamps', async () => {
      const file = new File([JSON.stringify(mockFoodData)], 'food-data.json', { type: 'application/json' });
      const result = await importFoodData(file);

      expect(result.entries[1].notes).toBe('Lunch');
      expect(result.entries[0].amount).toBe(2);
      expect(result.entries).toHaveLength(3);
    });

    it('should handle empty foodItems and entries', async () => {
      const emptyData: FoodData = {
        enabled: true,
        foodItems: [],
        entries: [],
      };

      const file = new File([JSON.stringify(emptyData)], 'food-data.json', { type: 'application/json' });
      const result = await importFoodData(file);

      expect(result.foodItems).toHaveLength(0);
      expect(result.entries).toHaveLength(0);
      expect(result.enabled).toBe(true);
    });
  });
});
