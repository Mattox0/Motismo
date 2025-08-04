import { createQuizSchema } from '../createQuizSchema';

describe('createQuizSchema', () => {
  it('validates correct quiz data', () => {
    const validData = {
      title: 'Test Quiz Title',
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    };

    const result = createQuizSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails validation for title too short', () => {
    const invalidData = {
      title: 'ab',
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    };

    const result = createQuizSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('create_quiz.validation.title_min_length');
    }
  });

  it('fails validation for invalid image type', () => {
    const invalidData = {
      title: 'Test Quiz Title',
      image: new File(['test'], 'test.txt', { type: 'text/plain' }),
    };

    const result = createQuizSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('create_quiz.validation.image_type');
    }
  });
});
