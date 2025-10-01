import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';
import { getToday } from '../../utils/date';
import type { Habit } from '../../types';

describe('ProgressBar', () => {
  const today = getToday();

  it('should display 0% when no habits are completed', () => {
    const habits: Habit[] = [
      {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [],
      },
    ];
    render(<ProgressBar habits={habits} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display 50% when half habits are completed', () => {
    const habits: Habit[] = [
      {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [today],
      },
      {
        id: '2',
        name: 'Read',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [],
      },
    ];
    render(<ProgressBar habits={habits} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display 100% when all habits are completed', () => {
    const habits: Habit[] = [
      {
        id: '1',
        name: 'Exercise',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [today],
      },
      {
        id: '2',
        name: 'Read',
        createdAt: '2024-01-01T00:00:00.000Z',
        completions: [today],
      },
    ];
    render(<ProgressBar habits={habits} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display "Today\'s Progress" text', () => {
    render(<ProgressBar habits={[]} />);
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
  });
});
