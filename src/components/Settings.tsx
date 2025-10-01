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
import type { AppData } from '../types';
import { exportData, importData } from '../utils/storage';

interface SettingsProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onClearAll: () => void;
}

export const Settings = ({ data, onImport, onClearAll }: SettingsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportError, setShowImportError] = useState(false);

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

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Welcome back, {data.userName}!</p>
      </div>

      <div className="space-y-3">
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
    </div>
  );
};
