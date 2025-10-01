import { Progress } from './ui/Progress';
import type { Habit } from '../types';
import { getTodayProgress } from '../utils/habits';

interface ProgressBarProps {
  habits: Habit[];
}

export const ProgressBar = ({ habits }: ProgressBarProps) => {
  const progress = getTodayProgress(habits);

  return (
    <div className="w-full bg-background border-b border-border p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Today's Progress</span>
        <span className="text-sm font-bold">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};
