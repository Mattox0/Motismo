import { TFunction } from 'i18next';

import { IQuestionType } from '../../QuestionType';
import { createQuestionSchema } from '../createQuestionForm';

const mockT = ((key: string) => key) as unknown as TFunction;

describe('createQuestionSchema', () => {
  const schema = createQuestionSchema(mockT);

  it('should validate question with required fields', () => {
    const validQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
      ],
    };

    const result = schema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it('should reject question without title', () => {
    const invalidQuestion = {
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
      ],
    };

    const result = schema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('should reject choice-based question without choices', () => {
    const invalidQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
    };

    const result = schema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('should reject question with less than 2 choices', () => {
    const invalidQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [{ text: 'Choice 1', isCorrect: true }],
    };

    const result = schema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('should reject question with more than 6 choices', () => {
    const invalidQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
        { text: 'Choice 3', isCorrect: false },
        { text: 'Choice 4', isCorrect: false },
        { text: 'Choice 5', isCorrect: false },
        { text: 'Choice 6', isCorrect: false },
        { text: 'Choice 7', isCorrect: false },
      ],
    };

    const result = schema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('should validate question with image', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const validQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      image: mockFile,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
      ],
    };

    const result = schema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it('should reject image larger than 5MB', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const invalidQuestion = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      image: largeFile,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
      ],
    };

    const result = schema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });
});
