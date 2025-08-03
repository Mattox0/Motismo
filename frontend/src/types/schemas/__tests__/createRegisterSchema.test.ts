/// <reference types="@testing-library/jest-dom" />

import { TFunction } from 'i18next';

import { createRegisterSchema } from '../createRegisterSchema';

const mockT = ((key: string) => key) as unknown as TFunction;

describe('createRegisterSchema', () => {
  let schema: ReturnType<typeof createRegisterSchema>;

  beforeEach(() => {
    schema = createRegisterSchema(mockT);
  });

  describe('name validation', () => {
    it('should accept valid names with 2 or more characters', () => {
      const validNames = ['John', 'Jane Doe', 'A-B', 'François'];

      validNames.forEach(name => {
        const result = schema.safeParse({
          name,
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject names with less than 2 characters', () => {
      const invalidNames = ['', 'A'];

      invalidNames.forEach(name => {
        const result = schema.safeParse({
          name,
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some(e => e.message === 'validation.nameRequired')).toBe(true);
        }
      });
    });
  });

  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'validation.invalidEmail')).toBe(true);
      }
    });
  });

  describe('password validation', () => {
    it('should accept passwords with 8 or more characters', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject passwords with less than 8 characters', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'validation.passwordMinLength')).toBe(
          true
        );
      }
    });
  });

  describe('password confirmation validation', () => {
    it('should accept matching passwords', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = schema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'validation.passwordsMustMatch')).toBe(
          true
        );
        expect(result.error.errors.some(e => e.path.includes('confirmPassword'))).toBe(true);
      }
    });
  });

  it('should validate complete valid form data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return multiple errors for invalid form data', () => {
    const invalidData = {
      name: 'A',
      email: 'invalid-email',
      password: 'short',
      confirmPassword: 'different',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(1);
    }
  });
});
