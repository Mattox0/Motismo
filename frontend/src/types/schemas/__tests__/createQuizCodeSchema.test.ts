/// <reference types="@testing-library/jest-dom" />

import { TFunction } from 'i18next';

import { createQuizCodeSchema } from '../createQuizCodeSchema';

const mockT = ((key: string) => key) as unknown as TFunction;

describe('createQuizCodeSchema', () => {
  let schema: ReturnType<typeof createQuizCodeSchema>;

  beforeEach(() => {
    schema = createQuizCodeSchema(mockT);
  });

  describe('code validation', () => {
    it('should accept valid 6-character alphanumeric codes', () => {
      const validCodes = [
        'ABC123',
        '123ABC',
        'A1B2C3',
        'abcdef',
        '123456',
        'abc123',
      ];

      validCodes.forEach(code => {
        const result = schema.safeParse({ code });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.code).toBe(code.toUpperCase());
        }
      });
    });

    it('should reject codes with less than 6 characters', () => {
      const invalidCodes = ['', 'A', 'AB', 'ABC', 'ABCD', 'ABCDE'];

      invalidCodes.forEach(code => {
        const result = schema.safeParse({ code });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('validation.codeLength');
        }
      });
    });

    it('should reject codes with more than 6 characters', () => {
      const invalidCodes = ['ABCDEFG', '1234567', 'ABCDEFGHIJ'];

      invalidCodes.forEach(code => {
        const result = schema.safeParse({ code });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('validation.codeLength');
        }
      });
    });

    it('should transform lowercase to uppercase', () => {
      const result = schema.safeParse({ code: 'abc123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('ABC123');
      }
    });

    it('should transform mixed case to uppercase', () => {
      const result = schema.safeParse({ code: 'AbC123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('ABC123');
      }
    });

    it('should keep uppercase as uppercase', () => {
      const result = schema.safeParse({ code: 'ABC123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('ABC123');
      }
    });

    it('should handle numbers only', () => {
      const result = schema.safeParse({ code: '123456' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('123456');
      }
    });

    it('should handle letters only', () => {
      const result = schema.safeParse({ code: 'ABCDEF' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('ABCDEF');
      }
    });
  });

  it('should validate complete valid form data', () => {
    const validData = {
      code: 'ABC123',
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ code: 'ABC123' });
    }
  });

  it('should return error for invalid form data', () => {
    const invalidData = {
      code: 'ABC',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('validation.codeLength');
    }
  });

  it('should handle empty string', () => {
    const result = schema.safeParse({ code: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('validation.codeLength');
    }
  });

  it('should handle whitespace-only strings', () => {
    const result = schema.safeParse({ code: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('validation.codeLength');
    }
  });
}); 