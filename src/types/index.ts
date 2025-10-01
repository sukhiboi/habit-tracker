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
