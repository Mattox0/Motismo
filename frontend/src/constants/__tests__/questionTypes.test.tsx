import { IQuestionType } from '@/types/QuestionType';

import {
  isChoiceBasedQuestion,
  isMultipleChoiceQuestion,
  isSingleChoiceQuestion,
  isBooleanQuestion,
  getQuestionTypeOptions,
} from '../questionTypes';
import { TFunction } from 'i18next';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('questionTypes', () => {
  describe('isChoiceBasedQuestion', () => {
    it('should return true for multiple choices question type', () => {
      expect(isChoiceBasedQuestion(IQuestionType.MULTIPLE_CHOICES)).toBe(true);
    });

    it('should return true for unique choices question type', () => {
      expect(isChoiceBasedQuestion(IQuestionType.UNIQUE_CHOICES)).toBe(true);
    });

    it('should return true for boolean choices question type', () => {
      expect(isChoiceBasedQuestion(IQuestionType.BOOLEAN_CHOICES)).toBe(true);
    });

    it('should return false for word cloud question type', () => {
      expect(isChoiceBasedQuestion(IQuestionType.WORD_CLOUD)).toBe(false);
    });
  });

  describe('isMultipleChoiceQuestion', () => {
    it('should return true only for multiple choices question type', () => {
      expect(isMultipleChoiceQuestion(IQuestionType.MULTIPLE_CHOICES)).toBe(true);
      expect(isMultipleChoiceQuestion(IQuestionType.UNIQUE_CHOICES)).toBe(false);
      expect(isMultipleChoiceQuestion(IQuestionType.BOOLEAN_CHOICES)).toBe(false);
    });
  });

  describe('isSingleChoiceQuestion', () => {
    it('should return true for unique choices question type', () => {
      expect(isSingleChoiceQuestion(IQuestionType.UNIQUE_CHOICES)).toBe(true);
    });

    it('should return true for boolean choices question type', () => {
      expect(isSingleChoiceQuestion(IQuestionType.BOOLEAN_CHOICES)).toBe(true);
    });

    it('should return false for multiple choices question type', () => {
      expect(isSingleChoiceQuestion(IQuestionType.MULTIPLE_CHOICES)).toBe(false);
    });
  });

  describe('isBooleanQuestion', () => {
    it('should return true only for boolean choices question type', () => {
      expect(isBooleanQuestion(IQuestionType.BOOLEAN_CHOICES)).toBe(true);
      expect(isBooleanQuestion(IQuestionType.UNIQUE_CHOICES)).toBe(false);
      expect(isBooleanQuestion(IQuestionType.MULTIPLE_CHOICES)).toBe(false);
    });
  });

  describe('getQuestionTypeOptions', () => {
    it('should return all question type options with correct structure', () => {
      const mockT = ((key: string) => key) as unknown as TFunction;
      const options = getQuestionTypeOptions(mockT);

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveProperty('value', IQuestionType.MULTIPLE_CHOICES);
      expect(options[0]).toHaveProperty('label');
      expect(options[0]).toHaveProperty('icon');
      expect(options[0]).toHaveProperty('description');
    });

    it('should include all question types', () => {
      const mockT = ((key: string) => key) as unknown as TFunction;

      const options = getQuestionTypeOptions(mockT);

      const values = options.map(option => option.value);
      expect(values).toContain(IQuestionType.MULTIPLE_CHOICES);
      expect(values).toContain(IQuestionType.UNIQUE_CHOICES);
      expect(values).toContain(IQuestionType.BOOLEAN_CHOICES);
      expect(values).toContain(IQuestionType.WORD_CLOUD);
      expect(values).toContain(IQuestionType.MATCHING);
    });
  });
}); 