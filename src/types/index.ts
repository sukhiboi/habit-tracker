export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  completions: string[]; // Array of ISO date strings
}

export interface AppData {
  userName: string;
  habits: Habit[];
}

export interface HabitCompletion {
  habitId: string;
  date: string;
}

export interface WeightEntry {
  weight: number; // in kg
  timestamp: string; // ISO date string
  notes?: string;
}

export interface WeightData {
  enabled: boolean;
  currentWeight: number; // in kg
  goalWeight: number; // in kg
  startWeight: number; // in kg
  startDate: string; // ISO date string
  entries: WeightEntry[];
}

export type FoodUnit = 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'serving';

export interface FoodItem {
  id: string;
  name: string;
  defaultAmount: number;
  unit: FoodUnit;
  servingDescription?: string; // For 'serving' unit: "bowl", "plate", "cup"
  healthScore: number; // 0-100 (0 = unhealthy, 100 = healthy)
  lastUsedAt?: string; // ISO date string
  useCount: number; // For favorites
}

export interface FoodEntry {
  id: string;
  foodItemId: string;
  amount: number;
  timestamp: string; // ISO date string with time
  notes?: string;
}

export interface FoodData {
  enabled: boolean;
  foodItems: FoodItem[];
  entries: FoodEntry[];
}
