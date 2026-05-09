// Unit Tests for Invoice Generation Functions
// File: tests/unit/invoices.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildSequenceCode, nextInvoiceNumber, nextPaymentCode } from '@/lib/invoices';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: vi.fn(),
    payment: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Invoice Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildSequenceCode', () => {
    it('should build correct sequence code with padding', () => {
      expect(buildSequenceCode('MSL', 2026, 1)).toBe('MSL-2026-0001');
      expect(buildSequenceCode('MSL', 2026, 42)).toBe('MSL-2026-0042');
      expect(buildSequenceCode('MSL', 2026, 999)).toBe('MSL-2026-0999');
      expect(buildSequenceCode('MSL', 2026, 1234)).toBe('MSL-2026-1234');
    });

    it('should handle different prefixes', () => {
      expect(buildSequenceCode('PAY', 2026, 1)).toBe('PAY-2026-0001');
      expect(buildSequenceCode('INV', 2026, 1)).toBe('INV-2026-0001');
    });

    it('should handle different years', () => {
      expect(buildSequenceCode('MSL', 2025, 1)).toBe('MSL-2025-0001');
      expect(buildSequenceCode('MSL', 2027, 1)).toBe('MSL-2027-0001');
    });
  });

  describe('nextInvoiceNumber', () => {
    it('should generate first invoice number when no previous invoices exist', async () => {
      (prisma.payment.count as any).mockResolvedValue(0);

      const result = await nextInvoiceNumber('MSL', new Date('2026-05-09'));
      expect(result).toBe('MSL-2026-0001');
    });

    it('should increment sequence number when previous invoices exist', async () => {
      (prisma.payment.count as any).mockResolvedValue(42);

      const result = await nextInvoiceNumber('MSL', new Date('2026-05-09'));
      expect(result).toBe('MSL-2026-0043');
    });

    it('should handle year boundaries correctly', async () => {
      (prisma.payment.count as any).mockResolvedValue(0);

      const result = await nextInvoiceNumber('MSL', new Date('2027-01-01'));
      expect(result).toBe('MSL-2027-0001');
    });

    it('should use custom prefix', async () => {
      (prisma.payment.count as any).mockResolvedValue(0);

      const result = await nextInvoiceNumber('CUSTOM', new Date('2026-05-09'));
      expect(result).toBe('CUSTOM-2026-0001');
    });
  });

  describe('nextPaymentCode', () => {
    it('should generate first payment code when no previous payments exist', async () => {
      (prisma.payment.count as any).mockResolvedValue(0);

      const result = await nextPaymentCode(new Date('2026-05-09'));
      expect(result).toBe('PAY-2026-0001');
    });

    it('should increment sequence number when previous payments exist', async () => {
      (prisma.payment.count as any).mockResolvedValue(99);

      const result = await nextPaymentCode(new Date('2026-05-09'));
      expect(result).toBe('PAY-2026-0100');
    });
  });

  describe('Race Condition Prevention', () => {
    it('should query payment count for sequence generation', async () => {
      (prisma.payment.count as any).mockResolvedValue(5);

      const result = await nextInvoiceNumber('MSL', new Date('2026-05-09'));

      expect(prisma.payment.count).toHaveBeenCalledWith({
        where: {
          invoiceNumber: {
            startsWith: 'MSL-2026-',
          },
        },
      });
      expect(result).toBe('MSL-2026-0006');
    });
  });
});
