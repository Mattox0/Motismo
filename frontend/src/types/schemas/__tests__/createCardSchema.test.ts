import { cardSchema } from '../createCardSchema';

describe('cardSchema', () => {
  it('should validate card with text only', () => {
    const validCard = {
      term: 'Test Term',
      definition: 'Test Definition',
    };

    const result = cardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('should validate card with images only', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const validCard = {
      rectoImage: mockFile,
      versoImage: mockFile,
    };

    const result = cardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('should reject card with neither term nor rectoImage', () => {
    const invalidCard = {
      definition: 'Test Definition',
    };

    const result = cardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject card with neither definition nor versoImage', () => {
    const invalidCard = {
      term: 'Test Term',
    };

    const result = cardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject file larger than 5MB', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const invalidCard = {
      rectoImage: largeFile,
      versoImage: largeFile,
    };

    const result = cardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject unsupported file type', () => {
    const unsupportedFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const invalidCard = {
      rectoImage: unsupportedFile,
      versoImage: unsupportedFile,
    };

    const result = cardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });
});
