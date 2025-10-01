// Light pastel colors for habit cards
const PASTEL_COLORS = [
  'bg-red-50 border-red-100',
  'bg-orange-50 border-orange-100',
  'bg-amber-50 border-amber-100',
  'bg-yellow-50 border-yellow-100',
  'bg-lime-50 border-lime-100',
  'bg-green-50 border-green-100',
  'bg-emerald-50 border-emerald-100',
  'bg-teal-50 border-teal-100',
  'bg-cyan-50 border-cyan-100',
  'bg-sky-50 border-sky-100',
  'bg-blue-50 border-blue-100',
  'bg-indigo-50 border-indigo-100',
  'bg-violet-50 border-violet-100',
  'bg-purple-50 border-purple-100',
  'bg-fuchsia-50 border-fuchsia-100',
  'bg-pink-50 border-pink-100',
  'bg-rose-50 border-rose-100',
];

// Simple hash function to convert string to number
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get a consistent color for a given ID
export const getHabitColor = (id: string): string => {
  const index = hashString(id) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
};
