// Unit Tests for Format Utilities
// File: tests/unit/format.test.ts

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, currentPeriod } from '@/lib/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format INR currency correctly', () => {
      expect(formatCurrency(1000, 'INR')).toBe('₹1,000');
      expect(formatCurrency(50000, 'INR')).toBe('₹50,000');
      expect(formatCurrency(0, 'INR')).toBe('₹0');
    });

    it('should format USD currency correctly', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000');
      expect(formatCurrency(50000, 'USD')).toBe('$50,000');
    });

    it('should handle decimal values', () => {
      // Note: formatCurrency uses maximumFractionDigits: 0, so decimals are rounded
      expect(formatCurrency(1000.50, 'INR')).toBe('₹1,001');
      expect(formatCurrency(999.99, 'INR')).toBe('₹1,000');
      expect(formatCurrency(1000.49, 'INR')).toBe('₹1,000');
    });

    it('should default to INR when currency not specified', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-1000, 'INR')).toBe('-₹1,000');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-05-09');
      const formatted = formatDate(date);
      // en-IN locale formats as "9 May 2026"
      expect(formatted).toBe('9 May 2026');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2026-05-09');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-12-25');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });
  });

  describe('currentPeriod', () => {
    it('should return current month and year', () => {
      const period = currentPeriod();
      expect(period).toMatch(/\w+ \d{4}/); // e.g., "May 2026"
    });

    it('should be consistent format', () => {
      const period1 = currentPeriod();
      const period2 = currentPeriod();
      expect(period1).toBe(period2);
    });
  });
});
