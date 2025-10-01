import { useState, FormEvent, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';
import type { AppData } from '../types';
import { createHabit } from '../utils/habits';
import { importData } from '../utils/storage';

interface SetupProps {
  onComplete: (data: AppData) => void;
}

export const Setup = ({ onComplete }: SetupProps) => {
  const [userName, setUserName] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [showImportError, setShowImportError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isButtonDisabled = !userName.trim() || habits.length === 0;

  const handleAddHabit = (e: FormEvent) => {
    e.preventDefault();
    if (habitName.trim()) {
      setHabits([...habits, habitName.trim()]);
      setHabitName('');
    }
  };

  const handleRemoveHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (userName.trim() && habits.length > 0) {
      const appData: AppData = {
        userName: userName.trim(),
        habits: habits.map(createHabit)
      };
      onComplete(appData);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await importData(file);
        // Populate the form with imported data
        setUserName(importedData.userName);
        setHabits(importedData.habits.map(h => h.name));
      } catch {
        setShowImportError(true);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background overflow-y-auto">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <p className="text-muted-foreground">Let's get you started with habit tracking</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium block mb-2">
              What's your name?
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="habit" className="text-sm font-medium block mb-2">
              Add your first habits
            </label>
            <form onSubmit={handleAddHabit} className="flex gap-2">
              <Input
                id="habit"
                placeholder="e.g., Exercise, Read, Meditate"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
              <Button type="submit" size="sm">Add</Button>
            </form>
          </div>

          {habits.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your habits:</p>
              <div className="space-y-2">
                {habits.map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-md"
                  >
                    <span>{habit}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHabit(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="button"
            className="w-full touch-manipulation"
            onClick={handleComplete}
            disabled={isButtonDisabled}
          >
            Get Started
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleImportClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            Import Habits from File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <Dialog open={showImportError} onOpenChange={setShowImportError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Failed</DialogTitle>
            <DialogDescription>
              Failed to import data. Please check that the file is a valid JSON export.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowImportError(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
