import { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AddFoodItem } from './AddFoodItem';
import { cn } from '../lib/utils';
import type { FoodData, FoodItem, FoodEntry } from '../types';

interface FoodTrackerProps {
  data: FoodData;
  onUpdate: (data: FoodData) => void;
}

// UUID generator
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const FoodTracker = ({ data, onUpdate }: FoodTrackerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

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
      .slice(0, 3);
  }, [data.entries, data.foodItems, currentHour]);

  // Favorites (top 5 by use count)
  const favorites = useMemo(() => {
    return [...data.foodItems]
      .filter(item => item.useCount > 0)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5);
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
    const entries = data.entries
      .filter(entry => entry.timestamp.startsWith(today))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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

    // Update use count and last used
    const updatedItems = data.foodItems.map(item =>
      item.id === foodItem.id
        ? { ...item, useCount: item.useCount + 1, lastUsedAt: newEntry.timestamp }
        : item
    );

    onUpdate({
      ...data,
      foodItems: updatedItems,
      entries: [...data.entries, newEntry],
    });
  };

  const handleAddNewItem = (itemData: Omit<FoodItem, 'id' | 'lastUsedAt' | 'useCount'>) => {
    const newItem: FoodItem = {
      ...itemData,
      id: generateUUID(),
      useCount: 0,
    };

    onUpdate({
      ...data,
      foodItems: [...data.foodItems, newItem],
    });

    setShowAddItem(false);
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

  const healthyCount = todaysEntries.morning.length + todaysEntries.afternoon.length + todaysEntries.evening.length;
  const unhealthyCount = data.entries.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    if (!e.timestamp.startsWith(today)) return false;
    const item = getFoodItem(e.foodItemId);
    return item && item.healthScore < 50;
  }).length;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Stats */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyCount - unhealthyCount}</div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{unhealthyCount}</div>
            <div className="text-sm text-muted-foreground">Unhealthy</div>
          </div>
        </div>
      </div>

      {/* Time-based suggestions */}
      {timeSuggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            🕐 Based on this time yesterday
          </h3>
          <div className="space-y-2">
            {timeSuggestions.map(item => renderFoodItem(item))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            ⭐ Favorites
          </h3>
          <div className="space-y-2">
            {favorites.map(item => renderFoodItem(item))}
          </div>
        </div>
      )}

      {/* Search and All Items */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search food items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">📋 All Food Items</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)}>
              + Add New
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              {searchQuery ? 'No items found' : 'No food items yet. Add your first item!'}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredItems.map(item => renderFoodItem(item))}
            </div>
          )}
        </div>
      </div>

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

      {/* Add Food Item Modal */}
      {showAddItem && (
        <AddFoodItem
          onAdd={handleAddNewItem}
          onCancel={() => setShowAddItem(false)}
        />
      )}
    </div>
  );
};
