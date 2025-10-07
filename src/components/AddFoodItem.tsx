import { useState, FormEvent, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { FoodItem, FoodUnit } from '../types';

interface AddFoodItemProps {
  onAdd: (item: Omit<FoodItem, 'id' | 'lastUsedAt' | 'useCount'>) => void;
  onCancel: () => void;
  initialName?: string;
}

export const AddFoodItem = ({ onAdd, onCancel, initialName = '' }: AddFoodItemProps) => {
  const [name, setName] = useState(initialName);
  const [defaultAmount, setDefaultAmount] = useState('');
  const [unit, setUnit] = useState<FoodUnit>('pcs');
  const [servingDescription, setServingDescription] = useState('');
  const [isHealthy, setIsHealthy] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Small delay to let keyboard animation start
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { name, defaultAmount, unit, servingDescription, isHealthy });

    const amount = parseFloat(defaultAmount);
    if (!name.trim() || isNaN(amount) || amount <= 0) {
      console.log('Validation failed:', { name: name.trim(), amount, isNaN: isNaN(amount) });
      return;
    }

    console.log('Calling onAdd with data');
    onAdd({
      name: name.trim(),
      defaultAmount: amount,
      unit,
      servingDescription: unit === 'serving' ? servingDescription.trim() : undefined,
      healthScore: isHealthy ? 100 : 0,
    });
    console.log('onAdd called successfully');
  };

  const unitOptions: Array<{ value: FoodUnit; label: string }> = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'serving', label: 'Serving' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div ref={formRef} className="bg-background border border-border rounded-t-lg sm:rounded-lg p-6 w-full max-w-md space-y-4 max-h-[60vh] max-h-[60dvh] overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-background pb-2 -mt-2 pt-2">
          <h2 className="text-xl font-semibold">Add New Food Item</h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-safe">
          <div>
            <label htmlFor="name" className="text-sm font-medium block mb-2">
              Food Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Samosa, Chai, Apple"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={handleInputFocus}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="text-sm font-medium block mb-2">
                Default Amount
              </label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                placeholder="1"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                onFocus={handleInputFocus}
              />
            </div>

            <div>
              <label htmlFor="unit" className="text-sm font-medium block mb-2">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as FoodUnit)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {unit === 'serving' && (
            <div>
              <label htmlFor="serving-desc" className="text-sm font-medium block mb-2">
                Serving Description
              </label>
              <Input
                id="serving-desc"
                placeholder="e.g., bowl, plate, cup"
                value={servingDescription}
                onChange={(e) => setServingDescription(e.target.value)}
                onFocus={handleInputFocus}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
            <span className="text-sm font-medium">Healthy?</span>
            <button
              type="button"
              onClick={() => setIsHealthy(!isHealthy)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isHealthy ? 'bg-green-500' : 'bg-orange-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHealthy ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !defaultAmount}
              className="flex-1"
            >
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
