import type { FoodData } from '../types';

const FOOD_STORAGE_KEY = 'habit-tracker-food-data';

export const saveFoodData = (data: FoodData): void => {
  try {
    localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save food data:', error);
  }
};

export const loadFoodData = (): FoodData | null => {
  try {
    const data = localStorage.getItem(FOOD_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load food data:', error);
    return null;
  }
};

export const clearFoodData = (): void => {
  try {
    localStorage.removeItem(FOOD_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear food data:', error);
  }
};

export const exportFoodData = (data: FoodData): void => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `food-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export food data:', error);
  }
};

export const importFoodData = (file: File): Promise<FoodData> => {
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
