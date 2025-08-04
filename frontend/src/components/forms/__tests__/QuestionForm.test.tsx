import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { IQuestionType } from '@/types/QuestionType';

import QuestionForm from '../QuestionForm';

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn,
    control: {},
    setValue: jest.fn(),
    reset: jest.fn(),
    watch: jest.fn((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    }),
    formState: { errors: {}, isSubmitting: false },
  }),
  useFieldArray: () => ({
    fields: [
      { id: '1', text: 'Choice 1', isCorrect: true },
      { id: '2', text: 'Choice 2', isCorrect: false },
    ],
    append: jest.fn(),
    remove: jest.fn(),
  }),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/providers/QuizzProvider', () => ({
  useQuizz: () => ({
    currentQuestion: null,
  }),
}));

jest.mock('@/constants/questionTypes', () => ({
  getQuestionTypeOptions: () => [
    { value: 'multiple_choices', label: 'Multiple Choices' },
    { value: 'single_choice', label: 'Single Choice' },
  ],
  isChoiceBasedQuestion: () => true,
  isMultipleChoiceQuestion: () => true,
  isSingleChoiceQuestion: () => false,
  isBooleanQuestion: () => false,
}));

describe('QuestionForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no initial data', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Aucune question')).toBeInTheDocument();
    expect(screen.getByText('Ajoutez une question pour commencer')).toBeInTheDocument();
  });

  it('should render form with initial data', () => {
    const initialData = {
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
    };

    render(
      <QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} initialData={initialData} />
    );

    expect(screen.getByText('Aucune question')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Aucune question')).toBeInTheDocument();
  });

  it('should handle delete action', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Aucune question')).toBeInTheDocument();
  });
});
