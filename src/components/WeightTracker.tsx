import { useState, useMemo, FormEvent } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import type { WeightData, WeightEntry } from '../types';

interface WeightTrackerProps {
  data: WeightData;
  onUpdate: (data: WeightData) => void;
}

export const WeightTracker = ({ data, onUpdate }: WeightTrackerProps) => {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = (e: FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      return;
    }

    const newEntry: WeightEntry = {
      weight: weightValue,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined
    };

    const updatedData: WeightData = {
      ...data,
      currentWeight: weightValue,
      entries: [...data.entries, newEntry]
    };

    onUpdate(updatedData);
    setWeight('');
    setNotes('');
  };

  const handleDeleteEntry = (timestamp: string) => {
    const updatedEntries = data.entries.filter(e => e.timestamp !== timestamp);

    // Update current weight to the most recent entry
    const currentWeight = updatedEntries.length > 0
      ? updatedEntries[updatedEntries.length - 1].weight
      : data.startWeight;

    const updatedData: WeightData = {
      ...data,
      currentWeight,
      entries: updatedEntries
    };

    onUpdate(updatedData);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const toGo = data.currentWeight - data.goalWeight;
    const totalLost = data.startWeight - data.currentWeight;

    // Week change (last 7 days average vs previous 7 days average)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const lastWeekEntries = data.entries.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
    const prevWeekEntries = data.entries.filter(e => {
      const date = new Date(e.timestamp);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    });

    const lastWeekAvg = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, e) => sum + e.weight, 0) / lastWeekEntries.length
      : data.currentWeight;

    const prevWeekAvg = prevWeekEntries.length > 0
      ? prevWeekEntries.reduce((sum, e) => sum + e.weight, 0) / prevWeekEntries.length
      : data.startWeight;

    const weekChange = lastWeekAvg - prevWeekAvg;

    return { toGo, totalLost, weekChange };
  }, [data]);

  // Calculate 30-day chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentEntries = data.entries
      .filter(e => new Date(e.timestamp) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return recentEntries.length > 0 ? recentEntries : [data.entries[0]];
  }, [data.entries]);

  // Calculate weekly averages for bar chart (last 4 weeks)
  const weeklyAverages = useMemo(() => {
    const weeks: Array<{ label: string; average: number | null; color: boolean }> = [];
    const now = new Date();

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekEntries = data.entries.filter(e => {
        const date = new Date(e.timestamp);
        return date >= weekStart && date < weekEnd;
      });

      const avg = weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + e.weight, 0) / weekEntries.length
        : null;

      weeks.unshift({
        label: `W${4 - i}`,
        average: avg,
        color: i > 0 && avg !== null && weeks[0]?.average !== null && avg < weeks[0].average
      });
    }

    return weeks;
  }, [data.entries]);

  // Find min and max for chart scaling
  const chartMinMax = useMemo(() => {
    if (chartData.length === 0) return { min: data.goalWeight - 10, max: data.startWeight + 10 };

    const weights = chartData.map(e => e.weight);
    const min = Math.min(...weights, data.goalWeight) - 5;
    const max = Math.max(...weights, data.startWeight) + 5;

    return { min, max };
  }, [chartData, data.goalWeight, data.startWeight]);

  const recentEntries = [...data.entries].reverse().slice(0, 10);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Stats Card */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-3xl font-bold text-primary">{data.currentWeight.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Current (kg)</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{data.goalWeight.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Goal (kg)</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div>
            <div className={cn(
              'text-lg font-bold',
              stats.toGo > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
            )}>
              {stats.toGo > 0 ? `${stats.toGo.toFixed(1)}` : '✓'}
            </div>
            <div className="text-xs text-muted-foreground">To Go</div>
          </div>
          <div>
            <div className={cn(
              'text-lg font-bold',
              stats.weekChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            )}>
              {stats.weekChange > 0 ? '+' : ''}{stats.weekChange.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Week Δ</div>
          </div>
          <div>
            <div className={cn(
              'text-lg font-bold',
              stats.totalLost > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            )}>
              {stats.totalLost > 0 ? '-' : ''}{Math.abs(stats.totalLost).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Quick Entry */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Log Weight</h3>
        <form onSubmit={handleAddEntry} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!weight.trim()}>
              Save
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>
      </div>

      {/* 30-Day Line Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">30-Day Progress</h3>
        <div className="relative h-48">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{chartMinMax.max.toFixed(0)}</span>
            <span>{((chartMinMax.max + chartMinMax.min) / 2).toFixed(0)}</span>
            <span>{chartMinMax.min.toFixed(0)}</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-t border-border/30" />
              <div className="border-t border-border/30" />
              <div className="border-t border-border/30" />
            </div>

            {/* Goal line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-green-500/50"
              style={{
                top: `${((chartMinMax.max - data.goalWeight) / (chartMinMax.max - chartMinMax.min)) * 100}%`
              }}
            />

            {/* Line chart */}
            {chartData.length > 1 && (
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <polyline
                  points={chartData.map((e, i) => {
                    const x = (i / (chartData.length - 1)) * 100;
                    const y = ((chartMinMax.max - e.weight) / (chartMinMax.max - chartMinMax.min)) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Data points */}
                {chartData.map((e, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = ((chartMinMax.max - e.weight) / (chartMinMax.max - chartMinMax.min)) * 100;
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill="hsl(var(--primary))"
                    />
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Averages Bar Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Weekly Averages</h3>
        <div className="flex items-end justify-around h-32 gap-2">
          {weeklyAverages.map((week, i) => {
            if (week.average === null) return null;

            const maxWeight = Math.max(...weeklyAverages.filter(w => w.average !== null).map(w => w.average!));
            const minWeight = Math.min(...weeklyAverages.filter(w => w.average !== null).map(w => w.average!));
            const height = maxWeight === minWeight ? 50 : ((week.average - minWeight) / (maxWeight - minWeight)) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-medium">{week.average.toFixed(1)}</div>
                <div
                  className={cn(
                    'w-full rounded-t transition-all',
                    week.color ? 'bg-green-500' : 'bg-orange-500'
                  )}
                  style={{ height: `${Math.max(height, 20)}%` }}
                />
                <div className="text-xs text-muted-foreground">{week.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Recent Entries</h3>
        <div className="space-y-2">
          {recentEntries.map((entry) => (
            <div
              key={entry.timestamp}
              className="flex items-center justify-between p-3 bg-secondary rounded-md"
            >
              <div className="flex-1">
                <div className="font-semibold">{entry.weight.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</div>
                {entry.notes && (
                  <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteEntry(entry.timestamp)}
                className="text-destructive"
              >
                Delete
              </Button>
            </div>
          ))}
          {recentEntries.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No entries yet. Add your first weight above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
