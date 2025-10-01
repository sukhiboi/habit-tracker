import { getToday, formatDate, isSameDay, getMonthDates, getDayKey } from '../date';

describe('Date utilities', () => {
  describe('getToday', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toBe('Jan 15, 2024');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same dates', () => {
      expect(isSameDay('2024-01-15', '2024-01-15')).toBe(true);
      expect(isSameDay('2024-01-15T10:00:00', '2024-01-15T15:00:00')).toBe(true);
    });

    it('should return false for different dates', () => {
      expect(isSameDay('2024-01-15', '2024-01-16')).toBe(false);
    });
  });

  describe('getMonthDates', () => {
    it('should return all dates for a month including padding', () => {
      const dates = getMonthDates(2024, 0); // January 2024
      expect(dates.length).toBeGreaterThanOrEqual(28);
      expect(dates.length).toBeLessThanOrEqual(42);
    });

    it('should start with Sunday', () => {
      const dates = getMonthDates(2024, 0);
      expect(dates[0].getDay()).toBe(0); // Sunday
    });

    it('should end with Saturday', () => {
      const dates = getMonthDates(2024, 0);
      expect(dates[dates.length - 1].getDay()).toBe(6); // Saturday
    });
  });

  describe('getDayKey', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T10:00:00');
      const key = getDayKey(date);
      expect(key).toBe('2024-01-15');
    });
  });
});
