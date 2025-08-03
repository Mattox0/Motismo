import { initializeQuestion } from '../initializeQuestion';
import { IQuestionType } from '@/types/QuestionType';

describe('initializeQuestion', () => {
  it('should return a FormData object', () => {
    const result = initializeQuestion();
    expect(result).toBeInstanceOf(FormData);
  });

  it('should append title with empty string', () => {
    const result = initializeQuestion();
    expect(result.get('title')).toBe('');
  });

  it('should append questionType with default value', () => {
    const result = initializeQuestion();
    expect(result.get('questionType')).toBe(IQuestionType.MULTIPLE_CHOICES);
  });

  it('should append questionType with provided value', () => {
    const result = initializeQuestion(IQuestionType.UNIQUE_CHOICES);
    expect(result.get('questionType')).toBe(IQuestionType.UNIQUE_CHOICES);
  });

  it('should append choices for choice-based questions', () => {
    const result = initializeQuestion(IQuestionType.MULTIPLE_CHOICES);
    const choices = result.get('choices');
    expect(choices).toBeDefined();
    
    if (choices) {
      const parsedChoices = JSON.parse(choices as string);
      expect(parsedChoices).toHaveLength(2);
      expect(parsedChoices[0]).toEqual({ text: '', isCorrect: false });
      expect(parsedChoices[1]).toEqual({ text: '', isCorrect: false });
    }
  });

  it('should append choices for unique choice questions', () => {
    const result = initializeQuestion(IQuestionType.UNIQUE_CHOICES);
    const choices = result.get('choices');
    expect(choices).toBeDefined();
  });

  it('should append choices for boolean questions', () => {
    const result = initializeQuestion(IQuestionType.BOOLEAN_CHOICES);
    const choices = result.get('choices');
    expect(choices).toBeDefined();
  });

  it('should not append choices for non-choice questions', () => {
    const result = initializeQuestion(IQuestionType.WORD_CLOUD);
    const choices = result.get('choices');
    expect(choices).toBeNull();
  });

  it('should have correct number of entries for choice-based questions', () => {
    const result = initializeQuestion(IQuestionType.MULTIPLE_CHOICES);
    const entries = Array.from(result.entries());
    expect(entries).toHaveLength(3);
  });

  it('should have correct number of entries for non-choice questions', () => {
    const result = initializeQuestion(IQuestionType.WORD_CLOUD);
    const entries = Array.from(result.entries());
    expect(entries).toHaveLength(2);
  });

  it('should return a new FormData instance each time', () => {
    const result1 = initializeQuestion();
    const result2 = initializeQuestion();
    expect(result1).not.toBe(result2);
  });
}); 