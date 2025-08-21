import { createClasseSchema } from '../createClasseSchema';

describe('createClasseSchema', () => {
  it('validates valid class name', () => {
    const validData = { name: 'Test Class' };
    const result = createClasseSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates minimum length requirement', () => {
    const invalidData = { name: 'AB' };
    const result = createClasseSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Le nom de la classe doit contenir au moins 3 caractères'
      );
    }
  });

  it('validates empty string', () => {
    const invalidData = { name: '' };
    const result = createClasseSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Le nom de la classe doit contenir au moins 3 caractères'
      );
    }
  });

  it('validates exactly 3 characters', () => {
    const validData = { name: 'ABC' };
    const result = createClasseSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates long class name', () => {
    const validData = { name: 'Very Long Class Name With Many Characters' };
    const result = createClasseSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates class name with special characters', () => {
    const validData = { name: 'Class-123 & More!' };
    const result = createClasseSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates class name with numbers', () => {
    const validData = { name: 'Class 2024' };
    const result = createClasseSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });
});
