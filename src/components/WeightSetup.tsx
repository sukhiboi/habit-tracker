import { useState, FormEvent } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { WeightData } from '../types';

interface WeightSetupProps {
  onComplete: (data: WeightData) => void;
}

export const WeightSetup = ({ onComplete }: WeightSetupProps) => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');

  const isButtonDisabled = !currentWeight.trim() || !goalWeight.trim();

  const handleComplete = (e: FormEvent) => {
    e.preventDefault();

    const current = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (isNaN(current) || isNaN(goal) || current <= 0 || goal <= 0) {
      return;
    }

    const weightData: WeightData = {
      enabled: true,
      currentWeight: current,
      goalWeight: goal,
      startWeight: current,
      startDate: new Date().toISOString(),
      entries: [{
        weight: current,
        timestamp: new Date().toISOString(),
        notes: 'Starting weight'
      }]
    };

    onComplete(weightData);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background overflow-y-auto">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">⚖️</span>
          <h1 className="text-3xl font-bold">Weight Tracking</h1>
          <p className="text-muted-foreground">Let's set up your weight goals</p>
        </div>

        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label htmlFor="current-weight" className="text-sm font-medium block mb-2">
              Current Weight (kg)
            </label>
            <Input
              id="current-weight"
              type="number"
              step="0.1"
              placeholder="e.g., 75.5"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="goal-weight" className="text-sm font-medium block mb-2">
              Goal Weight (kg)
            </label>
            <Input
              id="goal-weight"
              type="number"
              step="0.1"
              placeholder="e.g., 65.0"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full touch-manipulation"
            disabled={isButtonDisabled}
          >
            Start Tracking
          </Button>
        </form>
      </div>
    </div>
  );
};
