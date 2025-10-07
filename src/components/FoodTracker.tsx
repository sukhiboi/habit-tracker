import { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AddFoodItem } from './AddFoodItem';
import { cn } from '../lib/utils';
import { generateUUID } from '../utils/habits';
import type { FoodData, FoodItem, FoodEntry } from '../types';

interface FoodTrackerProps {
  data: FoodData;
  onUpdate: (data: FoodData) => void;
}

export const FoodTracker = ({ data, onUpdate }: FoodTrackerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [prefilledName, setPrefilledName] = useState('');

  // Get current hour for time-based suggestions
  const currentHour = new Date().getHours();

  // Time-based suggestions (±1 hour from yesterday)
  const timeSuggestions = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.toISOString().split('T')[0];

    const relevantEntries = data.entries.filter(entry => {
      const entryDate = entry.timestamp.split('T')[0];
      if (entryDate !== yesterdayStart) return false;

      const entryHour = new Date(entry.timestamp).getHours();
      return Math.abs(entryHour - currentHour) <= 1;
    });

    // Get unique food items from relevant entries
    const foodItemIds = [...new Set(relevantEntries.map(e => e.foodItemId))];
    return foodItemIds
      .map(id => data.foodItems.find(item => item.id === id))
      .filter((item): item is FoodItem => item !== undefined)
      .slice(0, 2);
  }, [data.entries, data.foodItems, currentHour]);

  // Favorites (top 2 healthy items by use count)
  const favorites = useMemo(() => {
    return [...data.foodItems]
      .filter(item => item.useCount > 0 && item.healthScore >= 50)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 2);
  }, [data.foodItems]);

  // Filtered food items
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.foodItems
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.foodItems, searchQuery]);

  // Today's entries grouped by time of day
  const todaysEntries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    console.log('Today date:', today);
    console.log('All entries:', data.entries);

    const entries = data.entries
      .filter(entry => {
        const matches = entry.timestamp.startsWith(today);
        console.log(`Entry ${entry.id} (${entry.timestamp}) matches today: ${matches}`);
        return matches;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log('Filtered today entries:', entries);

    const morning = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 5 && hour < 12;
    });

    const afternoon = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 12 && hour < 17;
    });

    const evening = entries.filter(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 17 || hour < 5;
    });

    console.log('Entries by time:', { morning: morning.length, afternoon: afternoon.length, evening: evening.length });

    return { morning, afternoon, evening };
  }, [data.entries]);

  const getFoodItem = (foodItemId: string) => {
    return data.foodItems.find(item => item.id === foodItemId);
  };

  const formatUnit = (item: FoodItem, amount: number) => {
    if (item.unit === 'serving' && item.servingDescription) {
      return `${amount} ${item.servingDescription}${amount !== 1 ? 's' : ''}`;
    }
    return `${amount} ${item.unit}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleQuickAdd = (foodItem: FoodItem) => {
    const newEntry: FoodEntry = {
      id: generateUUID(),
      foodItemId: foodItem.id,
      amount: foodItem.defaultAmount,
      timestamp: new Date().toISOString(),
    };

    console.log('Adding food entry:', newEntry);
    console.log('Current entries:', data.entries);

    // Update use count and last used
    const updatedItems = data.foodItems.map(item =>
      item.id === foodItem.id
        ? { ...item, useCount: item.useCount + 1, lastUsedAt: newEntry.timestamp }
        : item
    );

    const updatedData = {
      ...data,
      foodItems: updatedItems,
      entries: [...data.entries, newEntry],
    };

    console.log('Updated entries:', updatedData.entries);

    onUpdate(updatedData);
  };

  const handleAddNewItem = (itemData: Omit<FoodItem, 'id' | 'lastUsedAt' | 'useCount'>) => {
    try {
      console.log('Adding new food item:', itemData);
      const newItem: FoodItem = {
        ...itemData,
        id: generateUUID(),
        useCount: 0,
      };
      console.log('Generated food item with ID:', newItem.id);

      onUpdate({
        ...data,
        foodItems: [...data.foodItems, newItem],
      });

      setShowAddItem(false);
      setShowUnifiedModal(true);
      setSearchQuery('');
      setPrefilledName('');
    } catch (error) {
      console.error('Error adding food item:', error);
      alert('Failed to add food item. Please check console for details.');
    }
  };

  const handleOpenAddItemForm = () => {
    setPrefilledName(searchQuery);
    setShowUnifiedModal(false);
    setShowAddItem(true);
  };

  const handleCloseAddItemForm = () => {
    setShowAddItem(false);
    setPrefilledName('');
  };

  const handleDeleteEntry = (entryId: string) => {
    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) return;

    // Decrease use count
    const updatedItems = data.foodItems.map(item =>
      item.id === entry.foodItemId && item.useCount > 0
        ? { ...item, useCount: item.useCount - 1 }
        : item
    );

    onUpdate({
      ...data,
      foodItems: updatedItems,
      entries: data.entries.filter(e => e.id !== entryId),
    });
  };

  const handleStartEdit = (entry: FoodEntry) => {
    setEditingEntry(entry.id);
    setEditAmount(entry.amount.toString());
  };

  const handleSaveEdit = (entryId: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    onUpdate({
      ...data,
      entries: data.entries.map(e =>
        e.id === entryId ? { ...e, amount } : e
      ),
    });

    setEditingEntry(null);
    setEditAmount('');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditAmount('');
  };

  const renderEntry = (entry: FoodEntry) => {
    const foodItem = getFoodItem(entry.foodItemId);
    if (!foodItem) return null;

    const isEditing = editingEntry === entry.id;
    const isHealthy = foodItem.healthScore >= 50;

    return (
      <div
        key={entry.id}
        className={cn(
          'flex items-center justify-between p-3 rounded-md',
          isHealthy ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
        )}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatTime(entry.timestamp)}</span>
            <span className={cn('text-xl', isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>
              {isHealthy ? '✓' : '⚠️'}
            </span>
          </div>
          <div className="text-sm">
            {foodItem.name}
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  step="0.1"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-20 h-8 text-xs"
                />
                <span className="text-muted-foreground">{foodItem.unit}</span>
              </div>
            ) : (
              <span className="text-muted-foreground"> ({formatUnit(foodItem, entry.amount)})</span>
            )}
          </div>
          {entry.notes && <div className="text-xs text-muted-foreground mt-1">{entry.notes}</div>}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(entry.id)}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => handleStartEdit(entry)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteEntry(entry.id)}
                className="text-destructive"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderFoodItem = (foodItem: FoodItem, showQuickAdd = true) => {
    const isHealthy = foodItem.healthScore >= 50;

    return (
      <div
        key={foodItem.id}
        className="flex items-center justify-between p-3 bg-secondary rounded-md"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className={cn('text-xl', isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>
            {isHealthy ? '✓' : '⚠️'}
          </span>
          <div>
            <div className="text-sm font-medium">{foodItem.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatUnit(foodItem, foodItem.defaultAmount)}
            </div>
          </div>
        </div>
        {showQuickAdd && (
          <Button size="sm" onClick={() => handleQuickAdd(foodItem)}>
            Add
          </Button>
        )}
      </div>
    );
  };

  const todayEntryStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = data.entries.filter(e => e.timestamp.startsWith(today));

    const healthy = todayEntries.filter(e => {
      const item = data.foodItems.find(item => item.id === e.foodItemId);
      return item && item.healthScore >= 50;
    }).length;

    const unhealthy = todayEntries.filter(e => {
      const item = data.foodItems.find(item => item.id === e.foodItemId);
      return item && item.healthScore < 50;
    }).length;

    return { healthy, unhealthy, total: todayEntries.length };
  }, [data.entries, data.foodItems]);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
      {data.foodItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="text-6xl">🍎</div>
          <h2 className="text-xl font-semibold">Start Tracking Food</h2>
          <p className="text-muted-foreground max-w-xs">
            Click the + button below to add your first food item and start logging what you eat.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayEntryStats.healthy}</div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{todayEntryStats.unhealthy}</div>
                <div className="text-sm text-muted-foreground">Unhealthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{todayEntryStats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

      {/* Time-based suggestions */}
      {timeSuggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            🕐 Based on this time yesterday
          </h3>
          <div className="flex gap-2 overflow-x-auto">
            {timeSuggestions.map(item => (
              <div key={item.id} className="flex-1 min-w-[45%]">
                {renderFoodItem(item)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            ⭐ Favorites
          </h3>
          <div className="flex gap-2 overflow-x-auto">
            {favorites.map(item => (
              <div key={item.id} className="flex-1 min-w-[45%]">
                {renderFoodItem(item)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Log */}
      <div className="space-y-4 border-t pt-4">
        <h2 className="text-lg font-semibold">Today's Log</h2>

        {/* Morning */}
        <div>
          <h3 className="text-sm font-medium mb-2">🌅 Morning (5am - 12pm)</h3>
          {todaysEntries.morning.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No entries yet</div>
          ) : (
            <div className="space-y-2">
              {todaysEntries.morning.map(entry => renderEntry(entry))}
            </div>
          )}
        </div>

        {/* Afternoon */}
        <div>
          <h3 className="text-sm font-medium mb-2">🌞 Afternoon (12pm - 5pm)</h3>
          {todaysEntries.afternoon.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No entries yet</div>
          ) : (
            <div className="space-y-2">
              {todaysEntries.afternoon.map(entry => renderEntry(entry))}
            </div>
          )}
        </div>

        {/* Evening */}
        <div>
          <h3 className="text-sm font-medium mb-2">🌆 Evening (5pm - 5am)</h3>
          {todaysEntries.evening.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No entries yet</div>
          ) : (
            <div className="space-y-2">
              {todaysEntries.evening.map(entry => renderEntry(entry))}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowUnifiedModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
        aria-label="Add food"
      >
        +
      </button>

      {/* Add Food Item Modal */}
      {showAddItem && (
        <AddFoodItem
          onAdd={handleAddNewItem}
          onCancel={handleCloseAddItemForm}
          initialName={prefilledName}
        />
      )}

      {/* Unified Search/Add Modal */}
      {showUnifiedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background border border-border rounded-t-lg sm:rounded-lg p-6 w-full max-w-md max-h-[85vh] max-h-[85dvh] flex flex-col space-y-4">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-xl font-semibold">Add Food</h2>
              <button
                onClick={() => {
                  setShowUnifiedModal(false);
                  setSearchQuery('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="shrink-0">
              <Input
                type="text"
                placeholder="Search or add new food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredItems.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground py-4">
                    No items found
                  </div>
                  {searchQuery.trim() && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenAddItemForm}
                    >
                      + Add new item: "{searchQuery}"
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {filteredItems.map(item => renderFoodItem(item))}
                  {searchQuery.trim() && !filteredItems.some(item => item.name.toLowerCase() === searchQuery.toLowerCase()) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenAddItemForm}
                    >
                      + Add new item: "{searchQuery}"
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
