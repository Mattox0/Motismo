/// <reference types="@testing-library/jest-dom" />

import { TFunction } from 'i18next';

import { createLoginSchema } from '../createLoginForm';

const mockT = ((key: string) => key) as unknown as TFunction;

describe('createLoginSchema', () => {
  let schema: ReturnType<typeof createLoginSchema>;

  beforeEach(() => {
    schema = createLoginSchema(mockT);
  });

  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user@domain.co.uk',
        'firstname.lastname@company.org',
      ];

      validEmails.forEach(email => {
        const result = schema.safeParse({ email, password: 'password123' });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = ['invalid-email', '@domain.com', 'user@', 'user..name@domain.com'];

      invalidEmails.forEach(email => {
        const result = schema.safeParse({ email, password: 'password123' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('validation.invalidEmail');
        }
      });
    });
  });

  describe('password validation', () => {
    it('should accept passwords with 8 or more characters', () => {
      const validPasswords = ['password', 'password123', 'longpasswordwithmanychars'];

      validPasswords.forEach(password => {
        const result = schema.safeParse({ email: 'test@example.com', password });
        expect(result.success).toBe(true);
      });
    });

    it('should reject passwords with less than 8 characters', () => {
      const invalidPasswords = ['', '1234567', 'short'];

      invalidPasswords.forEach(password => {
        const result = schema.safeParse({ email: 'test@example.com', password });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('validation.passwordMinLength');
        }
      });
    });
  });

  it('should validate complete valid form data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return multiple errors for invalid form data', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'short',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors).toHaveLength(2);
      expect(result.error.errors[0].message).toBe('validation.invalidEmail');
      expect(result.error.errors[1].message).toBe('validation.passwordMinLength');
    }
  });
});
