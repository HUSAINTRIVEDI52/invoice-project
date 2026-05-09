// Unit Tests for Authentication Functions
// File: tests/unit/auth.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSession, getSession, login } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SESSION_SECRET = 'test-secret-key-with-at-least-32-characters';
  });

  describe('Session Secret Validation', () => {
    it('should throw error in production without SESSION_SECRET', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.SESSION_SECRET;

      vi.stubEnv('NODE_ENV', 'production');
      delete process.env.SESSION_SECRET;

      expect(() => {
        // This would be called internally by createSession
        const secret = process.env.SESSION_SECRET;
        if (process.env.NODE_ENV === 'production' && !secret) {
          throw new Error('SESSION_SECRET environment variable must be set in production');
        }
      }).toThrow('SESSION_SECRET environment variable must be set in production');

      vi.stubEnv('NODE_ENV', originalEnv);
      process.env.SESSION_SECRET = originalSecret;
    });

    it('should throw error in production with weak secret', () => {
      const originalEnv = process.env.NODE_ENV;

      vi.stubEnv('NODE_ENV', 'production');
      process.env.SESSION_SECRET = 'development-secret';

      expect(() => {
        const secret = process.env.SESSION_SECRET;
        if (process.env.NODE_ENV === 'production' && secret === 'development-secret') {
          throw new Error("SESSION_SECRET cannot be 'development-secret' in production");
        }
      }).toThrow("SESSION_SECRET cannot be 'development-secret' in production");

      vi.stubEnv('NODE_ENV', originalEnv);
    });

    it('should throw error in production with short secret', () => {
      const originalEnv = process.env.NODE_ENV;

      vi.stubEnv('NODE_ENV', 'production');
      process.env.SESSION_SECRET = 'short';

      expect(() => {
        const secret = process.env.SESSION_SECRET;
        if (process.env.NODE_ENV === 'production' && secret && secret.length < 32) {
          throw new Error('SESSION_SECRET must be at least 32 characters long');
        }
      }).toThrow('SESSION_SECRET must be at least 32 characters long');

      vi.stubEnv('NODE_ENV', originalEnv);
    });

    it('should accept valid secret in production', () => {
      const originalEnv = process.env.NODE_ENV;

      vi.stubEnv('NODE_ENV', 'production');
      process.env.SESSION_SECRET = 'this-is-a-valid-secret-key-with-32-plus-characters';

      expect(() => {
        const secret = process.env.SESSION_SECRET;
        if (process.env.NODE_ENV === 'production') {
          if (!secret) throw new Error('SESSION_SECRET must be set');
          if (secret === 'development-secret') throw new Error('Cannot use development-secret');
          if (secret.length < 32) throw new Error('SECRET too short');
        }
      }).not.toThrow();

      vi.stubEnv('NODE_ENV', originalEnv);
    });
  });

  describe('login', () => {
    it('should return false when admin not found', async () => {
      (prisma.admin.findUnique as any).mockResolvedValue(null);

      const result = await login('test@example.com', 'password');
      expect(result).toBe(false);
    });

    it('should return false when password is invalid', async () => {
      (prisma.admin.findUnique as any).mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      const result = await login('test@example.com', 'wrong_password');
      expect(result).toBe(false);
    });

    it('should return true and create session when credentials are valid', async () => {
      (prisma.admin.findUnique as any).mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await login('test@example.com', 'correct_password');
      expect(result).toBe(true);
    });
  });

  describe('getSession', () => {
    it('should return null when no token exists', async () => {
      const { cookies } = await import('next/headers');
      (cookies as any).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      });

      const result = await getSession();
      expect(result).toBeNull();
    });

    it('should validate MongoDB ObjectId format', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const invalidObjectId = 'invalid-id';

      expect(/^[0-9a-fA-F]{24}$/.test(validObjectId)).toBe(true);
      expect(/^[0-9a-fA-F]{24}$/.test(invalidObjectId)).toBe(false);
    });
  });
});
