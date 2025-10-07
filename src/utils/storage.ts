import type { AppData, UnifiedAppData, WeightData, FoodData } from '../types';

const STORAGE_KEY = 'habit-tracker-data';

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const loadData = (): AppData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
};

export const clearData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

// Legacy export for habits only (kept for backward compatibility)
export const exportData = (data: AppData): void => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habits-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
  }
};

// Legacy import for habits only (kept for backward compatibility)
export const importData = (file: File): Promise<AppData> => {
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

// Unified export - exports all data including habits, weight, and food
export const exportAllData = (
  habitsData: AppData,
  weightData: WeightData | null,
  foodData: FoodData | null
): void => {
  try {
    const unifiedData: UnifiedAppData = {
      version: '1.0.0',
      habits: habitsData,
      weight: weightData,
      food: foodData,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(unifiedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export all data:', error);
    throw error;
  }
};

// Unified import - imports all data and returns it
export const importAllData = (file: File): Promise<UnifiedAppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate the structure
        if (!data.version || !data.habits) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        // Ensure we have the right structure
        const unifiedData: UnifiedAppData = {
          version: data.version,
          habits: data.habits,
          weight: data.weight || null,
          food: data.food || null,
          exportedAt: data.exportedAt || new Date().toISOString(),
        };

        resolve(unifiedData);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
