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
