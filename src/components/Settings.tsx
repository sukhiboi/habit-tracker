import { useRef, useState } from 'react';
import { Button } from './ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';
import type { AppData, WeightData, FoodData } from '../types';
import { exportData, importData } from '../utils/storage';
import { exportWeightData, importWeightData } from '../utils/weightStorage';
import { exportFoodData, importFoodData } from '../utils/foodStorage';

interface SettingsProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onClearAll: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  weightData: WeightData | null;
  onWeightToggle: (enabled: boolean) => void;
  onWeightImport: (data: WeightData) => void;
  onWeightClear: () => void;
  foodData: FoodData | null;
  onFoodToggle: (enabled: boolean) => void;
  onFoodImport: (data: FoodData) => void;
  onFoodClear: () => void;
}

export const Settings = ({ data, onImport, onClearAll, theme, onToggleTheme, weightData, onWeightToggle, onWeightImport, onWeightClear, foodData, onFoodToggle, onFoodImport, onFoodClear }: SettingsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const weightFileInputRef = useRef<HTMLInputElement>(null);
  const foodFileInputRef = useRef<HTMLInputElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showWeightClearDialog, setShowWeightClearDialog] = useState(false);
  const [showFoodClearDialog, setShowFoodClearDialog] = useState(false);
  const [showImportError, setShowImportError] = useState(false);
  const [showWeightImportError, setShowWeightImportError] = useState(false);
  const [showFoodImportError, setShowFoodImportError] = useState(false);

  const handleExport = () => {
    exportData(data);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await importData(file);
        onImport(importedData);
      } catch {
        setShowImportError(true);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    onClearAll();
    setShowClearDialog(false);
  };

  const handleRefreshApp = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Force check for updates
          await registration.update();

          // If there's a waiting worker, activate it
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Reload the page to get the latest version
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Failed to refresh app:', error);
    }
  };

  // Weight tracking handlers
  const handleWeightExport = () => {
    if (weightData) {
      exportWeightData(weightData);
    }
  };

  const handleWeightImportClick = () => {
    weightFileInputRef.current?.click();
  };

  const handleWeightFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await importWeightData(file);
        onWeightImport(importedData);
      } catch {
        setShowWeightImportError(true);
      }
    }
    // Reset input
    if (weightFileInputRef.current) {
      weightFileInputRef.current.value = '';
    }
  };

  const handleWeightClear = () => {
    setShowWeightClearDialog(true);
  };

  const confirmWeightClear = () => {
    onWeightClear();
    setShowWeightClearDialog(false);
  };

  // Food tracking handlers
  const handleFoodExport = () => {
    if (foodData) {
      exportFoodData(foodData);
    }
  };

  const handleFoodImportClick = () => {
    foodFileInputRef.current?.click();
  };

  const handleFoodFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await importFoodData(file);
        onFoodImport(importedData);
      } catch {
        setShowFoodImportError(true);
      }
    }
    // Reset input
    if (foodFileInputRef.current) {
      foodFileInputRef.current.value = '';
    }
  };

  const handleFoodClear = () => {
    setShowFoodClearDialog(true);
  };

  const confirmFoodClear = () => {
    onFoodClear();
    setShowFoodClearDialog(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Welcome back, {data.userName}!</p>
      </div>

      <div className="space-y-3">
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Appearance</h3>
          <div className="space-y-2">
            <Button onClick={onToggleTheme} variant="outline" className="w-full justify-start">
              {theme === 'light' ? (
                <>
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
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  Dark Mode
                </>
              ) : (
                <>
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
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  Light Mode
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Features</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <span className="text-sm font-medium">Weight Tracking</span>
              </div>
              <button
                onClick={() => onWeightToggle(!weightData?.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  weightData?.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    weightData?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {weightData?.enabled && (
              <div className="ml-8 space-y-2">
                <Button onClick={handleWeightExport} variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Export Weight Data
                </Button>
                <Button onClick={handleWeightImportClick} variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Import Weight Data
                </Button>
                <Button onClick={handleWeightClear} variant="ghost" size="sm" className="w-full justify-start text-xs text-destructive">
                  Clear Weight Data
                </Button>
                <input
                  ref={weightFileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleWeightFileChange}
                  className="hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍽️</span>
                <span className="text-sm font-medium">Food Tracking</span>
              </div>
              <button
                onClick={() => onFoodToggle(!foodData?.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  foodData?.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    foodData?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {foodData?.enabled && (
              <div className="ml-8 space-y-2">
                <Button onClick={handleFoodExport} variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Export Food Data
                </Button>
                <Button onClick={handleFoodImportClick} variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Import Food Data
                </Button>
                <Button onClick={handleFoodClear} variant="ghost" size="sm" className="w-full justify-start text-xs text-destructive">
                  Clear Food Data
                </Button>
                <input
                  ref={foodFileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleFoodFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">App</h3>
          <div className="space-y-2">
            <Button onClick={handleRefreshApp} variant="outline" className="w-full justify-start">
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
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh App
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Data Management</h3>
          <div className="space-y-2">
            <Button onClick={handleExport} variant="outline" className="w-full justify-start">
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
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Export Data
            </Button>

            <Button onClick={handleImportClick} variant="outline" className="w-full justify-start">
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
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="w-full justify-start"
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Clear All Data
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary p-3 rounded-md">
              <p className="text-2xl font-bold">{data.habits.length}</p>
              <p className="text-xs text-muted-foreground">Total Habits</p>
            </div>
            <div className="bg-secondary p-3 rounded-md">
              <p className="text-2xl font-bold">
                {data.habits.reduce((sum, h) => sum + h.completions.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Completions</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will delete all your habits and progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={showWeightClearDialog} onOpenChange={setShowWeightClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Weight Data?</DialogTitle>
            <DialogDescription>
              This will delete all your weight tracking data and entries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWeightClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmWeightClear}>
              Clear Weight Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWeightImportError} onOpenChange={setShowWeightImportError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Failed</DialogTitle>
            <DialogDescription>
              Failed to import weight data. Please check that the file is a valid JSON export.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWeightImportError(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFoodClearDialog} onOpenChange={setShowFoodClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Food Data?</DialogTitle>
            <DialogDescription>
              This will delete all your food items and entries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFoodClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmFoodClear}>
              Clear Food Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFoodImportError} onOpenChange={setShowFoodImportError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Failed</DialogTitle>
            <DialogDescription>
              Failed to import food data. Please check that the file is a valid JSON export.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowFoodImportError(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
