import { useState, FormEvent } from 'react';
import { HabitCard } from './HabitCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { Habit } from '../types';
import { isHabitCompletedToday } from '../utils/habits';

interface HabitListProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onAdd: (name: string) => void;
}

export const HabitList = ({ habits, onToggle, onDelete, onAdd }: HabitListProps) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const pendingHabits = habits.filter(h => !isHabitCompletedToday(h));
  const completedHabits = habits.filter(h => isHabitCompletedToday(h));
  const allComplete = habits.length > 0 && pendingHabits.length === 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim());
      setNewHabitName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Add habit form */}
      {showAddForm ? (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter habit name"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            autoFocus
          />
          <Button type="submit" size="sm">Add</Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-4"
          variant="outline"
        >
          + Add New Habit
        </Button>
      )}

      {/* All done message */}
      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="text-lg font-semibold text-green-900">All Done for Today!</h3>
          <p className="text-sm text-green-700">Great job completing all your habits!</p>
        </div>
      )}

      {/* Pending habit cards - first one is 3x height */}
      {!allComplete && (
        <div className="space-y-3">
          {pendingHabits.map((habit, index) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isFirst={index === 0}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Completed habits button */}
      {completedHabits.length > 0 && (
        <div className="fixed bottom-20 right-4 z-20">
          <Button
            onClick={() => setShowCompleted(!showCompleted)}
            className="rounded-full shadow-lg h-14 px-6"
          >
            ✓ {completedHabits.length} Done
          </Button>
        </div>
      )}

      {/* Completed habits popup */}
      {showCompleted && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end">
          <div className="bg-background w-full rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Completed Today</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCompleted(false)}>
                Close
              </Button>
            </div>
            <div className="p-4 space-y-2">
              {completedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="line-through text-muted-foreground">{habit.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onToggle(habit.id);
                      if (completedHabits.length === 1) {
                        setShowCompleted(false);
                      }
                    }}
                  >
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {habits.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No habits yet. Add your first habit to get started!</p>
        </div>
      )}
    </div>
  );
};
