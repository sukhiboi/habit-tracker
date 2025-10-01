import type { WeightData } from '../types';

const WEIGHT_STORAGE_KEY = 'habit-tracker-weight-data';

export const saveWeightData = (data: WeightData): void => {
  try {
    localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save weight data:', error);
  }
};

export const loadWeightData = (): WeightData | null => {
  try {
    const data = localStorage.getItem(WEIGHT_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load weight data:', error);
    return null;
  }
};

export const clearWeightData = (): void => {
  try {
    localStorage.removeItem(WEIGHT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear weight data:', error);
  }
};

export const exportWeightData = (data: WeightData): void => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weight-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export weight data:', error);
  }
};

export const importWeightData = (file: File): Promise<WeightData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
