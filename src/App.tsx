import { useState, useEffect } from 'react';
import { Setup } from './components/Setup';
import { ProgressBar } from './components/ProgressBar';
import { HabitList } from './components/HabitList';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import { WeightSetup } from './components/WeightSetup';
import { WeightTracker } from './components/WeightTracker';
import { FoodTracker } from './components/FoodTracker';
import { loadData, saveData, clearData } from './utils/storage';
import { loadWeightData, saveWeightData, clearWeightData } from './utils/weightStorage';
import { loadFoodData, saveFoodData, clearFoodData } from './utils/foodStorage';
import { createHabit, toggleHabitCompletion } from './utils/habits';
import { useTheme } from './hooks/useTheme';
import type { AppData, WeightData, FoodData, UnifiedAppData } from './types';

type View = 'habits' | 'calendar' | 'weight' | 'food' | 'settings';

export const App = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [currentView, setCurrentView] = useState<View>('habits');
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Load data on mount
  useEffect(() => {
    const savedData = loadData();
    const savedWeightData = loadWeightData();
    const savedFoodData = loadFoodData();
    setData(savedData);
    setWeightData(savedWeightData);
    setFoodData(savedFoodData);
    setIsLoading(false);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (data) {
      saveData(data);
    }
  }, [data]);

  // Save weight data whenever it changes
  useEffect(() => {
    if (weightData) {
      saveWeightData(weightData);
    }
  }, [weightData]);

  // Save food data whenever it changes
  useEffect(() => {
    if (foodData) {
      saveFoodData(foodData);
    }
  }, [foodData]);

  const handleSetupComplete = (newData: AppData) => {
    setData(newData);
  };

  const handleAddHabit = (name: string) => {
    if (!data) return;
    const newHabit = createHabit(name);
    setData({
      ...data,
      habits: [...data.habits, newHabit],
    });
  };

  const handleToggleHabit = (habitId: string) => {
    if (!data) return;
    setData({
      ...data,
      habits: data.habits.map((habit) =>
        habit.id === habitId ? toggleHabitCompletion(habit) : habit
      ),
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!data) return;
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setData({
        ...data,
        habits: data.habits.filter((habit) => habit.id !== habitId),
      });
    }
  };

  const handleImport = (importedData: AppData) => {
    setData(importedData);
    setCurrentView('habits');
  };

  const handleImportAll = (importedData: UnifiedAppData) => {
    // Import habits data
    setData(importedData.habits);

    // Import weight data if present
    if (importedData.weight) {
      setWeightData(importedData.weight);
    }

    // Import food data if present
    if (importedData.food) {
      setFoodData(importedData.food);
    }

    setCurrentView('habits');
  };

  const handleClearAll = () => {
    clearData();
    setData(null);
    setCurrentView('habits');
  };

  // Weight tracking handlers
  const handleWeightSetupComplete = (newWeightData: WeightData) => {
    setWeightData(newWeightData);
  };

  const handleWeightUpdate = (updatedWeightData: WeightData) => {
    setWeightData(updatedWeightData);
  };

  const handleWeightToggle = (enabled: boolean) => {
    if (enabled) {
      // Switching weight tracking on - show weight setup
      setCurrentView('weight');
    } else {
      // Switching weight tracking off
      if (weightData) {
        setWeightData({ ...weightData, enabled: false });
      }
    }
  };

  const handleWeightImport = (importedWeightData: WeightData) => {
    setWeightData(importedWeightData);
  };

  const handleWeightClear = () => {
    clearWeightData();
    setWeightData(null);
  };

  // Food tracking handlers
  const handleFoodUpdate = (updatedFoodData: FoodData) => {
    setFoodData(updatedFoodData);
  };

  const handleFoodToggle = (enabled: boolean) => {
    if (enabled) {
      // Enable food tracking
      setFoodData({
        enabled: true,
        foodItems: [],
        entries: [],
      });
      setCurrentView('food');
    } else {
      // Disable food tracking
      if (foodData) {
        setFoodData({ ...foodData, enabled: false });
      }
    }
  };

  const handleFoodImport = (importedFoodData: FoodData) => {
    setFoodData(importedFoodData);
  };

  const handleFoodClear = () => {
    clearFoodData();
    setFoodData(null);
  };

  // Check if device is mobile (only once on mount)
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      setIsMobileDevice(isMobile);
    };

    checkMobile();
  }, []);

  if (!isMobileDevice) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-3">Mobile Only</h1>
          <p className="text-muted-foreground">
            This app is designed for mobile devices only. Please open it on your phone or reduce your browser width.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Show setup if no data
  if (!data) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {currentView === 'habits' && <ProgressBar habits={data.habits} />}

      <div className="flex-1 overflow-hidden">
        {currentView === 'habits' && (
          <HabitList
            habits={data.habits}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onAdd={handleAddHabit}
          />
        )}
        {currentView === 'calendar' && <Calendar habits={data.habits} />}
        {currentView === 'weight' && (
          <>
            {!weightData || !weightData.enabled ? (
              <WeightSetup onComplete={handleWeightSetupComplete} />
            ) : (
              <WeightTracker data={weightData} onUpdate={handleWeightUpdate} />
            )}
          </>
        )}
        {currentView === 'food' && foodData && foodData.enabled && (
          <FoodTracker data={foodData} onUpdate={handleFoodUpdate} />
        )}
        {currentView === 'settings' && (
          <Settings
            data={data}
            onImport={handleImport}
            onImportAll={handleImportAll}
            onClearAll={handleClearAll}
            theme={theme}
            onToggleTheme={toggleTheme}
            weightData={weightData}
            onWeightToggle={handleWeightToggle}
            onWeightImport={handleWeightImport}
            onWeightClear={handleWeightClear}
            foodData={foodData}
            onFoodToggle={handleFoodToggle}
            onFoodImport={handleFoodImport}
            onFoodClear={handleFoodClear}
          />
        )}
      </div>

      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        weightEnabled={weightData?.enabled ?? false}
        foodEnabled={foodData?.enabled ?? false}
      />
    </div>
  );
};
