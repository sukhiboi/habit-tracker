import { saveWeightData, loadWeightData, clearWeightData, exportWeightData, importWeightData } from '../weightStorage';
import type { WeightData } from '../../types';

describe('Weight Storage utilities', () => {
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
        weight: 78,
        timestamp: '2024-01-08T00:00:00.000Z',
        notes: 'Making good progress',
      },
      {
        weight: 75,
        timestamp: '2024-01-15T00:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveWeightData', () => {
    it('should save weight data to localStorage', () => {
      saveWeightData(mockWeightData);
      const stored = localStorage.getItem('habit-tracker-weight-data');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockWeightData);
    });

    it('should overwrite existing weight data', () => {
      saveWeightData(mockWeightData);
      const updatedData = { ...mockWeightData, currentWeight: 72 };
      saveWeightData(updatedData);

      const stored = localStorage.getItem('habit-tracker-weight-data');
      expect(JSON.parse(stored!).currentWeight).toBe(72);
    });
  });

  describe('loadWeightData', () => {
    it('should load weight data from localStorage', () => {
      localStorage.setItem('habit-tracker-weight-data', JSON.stringify(mockWeightData));
      const loaded = loadWeightData();
      expect(loaded).toEqual(mockWeightData);
    });

    it('should return null if no weight data exists', () => {
      const loaded = loadWeightData();
      expect(loaded).toBeNull();
    });

    it('should return null if weight data is invalid', () => {
      localStorage.setItem('habit-tracker-weight-data', 'invalid json');
      const loaded = loadWeightData();
      expect(loaded).toBeNull();
    });

    it('should preserve enabled state', () => {
      const disabledData = { ...mockWeightData, enabled: false };
      localStorage.setItem('habit-tracker-weight-data', JSON.stringify(disabledData));
      const loaded = loadWeightData();
      expect(loaded?.enabled).toBe(false);
    });
  });

  describe('clearWeightData', () => {
    it('should clear weight data from localStorage', () => {
      localStorage.setItem('habit-tracker-weight-data', JSON.stringify(mockWeightData));
      clearWeightData();
      expect(localStorage.getItem('habit-tracker-weight-data')).toBeNull();
    });

    it('should not affect other storage keys', () => {
      localStorage.setItem('habit-tracker-data', JSON.stringify({ userName: 'Test' }));
      localStorage.setItem('habit-tracker-weight-data', JSON.stringify(mockWeightData));

      clearWeightData();

      expect(localStorage.getItem('habit-tracker-weight-data')).toBeNull();
      expect(localStorage.getItem('habit-tracker-data')).toBeTruthy();
    });
  });

  describe('exportWeightData', () => {
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

    it('should export weight data as JSON file', () => {
      exportWeightData(mockWeightData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('weight-data-');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should create downloadable file with correct name', () => {
      exportWeightData(mockWeightData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/weight-data-\d{4}-\d{2}-\d{2}\.json/);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('importWeightData', () => {
    it('should import valid weight data', async () => {
      const file = new File([JSON.stringify(mockWeightData)], 'weight-data.json', { type: 'application/json' });
      const result = await importWeightData(file);

      expect(result).toEqual(mockWeightData);
      expect(result.enabled).toBe(true);
      expect(result.entries).toHaveLength(3);
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json'], 'weight-data.json', { type: 'application/json' });

      await expect(importWeightData(file)).rejects.toThrow('Invalid JSON file');
    });

    it('should import weight data with disabled state', async () => {
      const disabledData = { ...mockWeightData, enabled: false };
      const file = new File([JSON.stringify(disabledData)], 'weight-data.json', { type: 'application/json' });
      const result = await importWeightData(file);

      expect(result.enabled).toBe(false);
    });

    it('should preserve all weight entries and notes', async () => {
      const file = new File([JSON.stringify(mockWeightData)], 'weight-data.json', { type: 'application/json' });
      const result = await importWeightData(file);

      expect(result.entries[1].notes).toBe('Making good progress');
      expect(result.entries).toHaveLength(3);
    });
  });
});
