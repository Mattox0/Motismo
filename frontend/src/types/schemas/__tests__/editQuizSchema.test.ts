import { editQuizSchema } from '../editQuizSchema';

describe('editQuizSchema', () => {
  it('validates valid quiz data', () => {
    const validData = { title: 'Test Quiz' };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates minimum title length', () => {
    const invalidData = { title: 'AB' };
    const result = editQuizSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_quiz.validation.title_min_length');
    }
  });

  it('validates maximum title length', () => {
    const longTitle = 'A'.repeat(51);
    const invalidData = { title: longTitle };
    const result = editQuizSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_quiz.validation.title_max_length');
    }
  });

  it('validates valid image file', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const validData = {
      title: 'Test Quiz',
      image: file,
    };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates image file size limit', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const invalidData = {
      title: 'Test Quiz',
      image: largeFile,
    };
    const result = editQuizSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_quiz.validation.image_size');
    }
  });

  it('validates image file type', () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const invalidData = {
      title: 'Test Quiz',
      image: invalidFile,
    };
    const result = editQuizSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_quiz.validation.image_type');
    }
  });

  it('validates PNG image file', () => {
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
    const validData = {
      title: 'Test Quiz',
      image: pngFile,
    };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates GIF image file', () => {
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
    const validData = {
      title: 'Test Quiz',
      image: gifFile,
    };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates without image', () => {
    const validData = { title: 'Test Quiz' };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates exactly 3 characters title', () => {
    const validData = { title: 'ABC' };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates exactly 50 characters title', () => {
    const validData = { title: 'A'.repeat(50) };
    const result = editQuizSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('validates empty title', () => {
    const invalidData = { title: '' };
    const result = editQuizSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('edit_quiz.validation.title_min_length');
    }
  });
});
