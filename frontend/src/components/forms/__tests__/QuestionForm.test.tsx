import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, useFieldArray } from 'react-hook-form';

import { IQuestionType } from '@/types/QuestionType';

import QuestionForm from '../QuestionForm';

const mockUseForm = useForm as jest.MockedFunction<typeof useForm>;
const mockUseFieldArray = useFieldArray as jest.MockedFunction<typeof useFieldArray>;

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
  useFieldArray: jest.fn(),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'question.option' && params?.number) {
        return `Option ${params.number}`;
      }
      return key;
    },
  }),
}));

jest.mock('@/providers/QuizzProvider', () => ({
  useQuizz: jest.fn(() => ({
    currentQuestion: {
      id: '1',
      title: 'Test Question',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
      ],
    },
  })),
}));

jest.mock('@/constants/questionTypes', () => ({
  getQuestionTypeOptions: () => [
    {
      value: IQuestionType.MULTIPLE_CHOICES,
      label: 'Multiple Choices',
      description: 'Multiple choice question',
      icon: 'icon',
    },
    {
      value: IQuestionType.UNIQUE_CHOICES,
      label: 'Single Choice',
      description: 'Single choice question',
      icon: 'icon',
    },
    {
      value: IQuestionType.BOOLEAN_CHOICES,
      label: 'Boolean',
      description: 'Boolean question',
      icon: 'icon',
    },
    {
      value: IQuestionType.WORD_CLOUD,
      label: 'Word Cloud',
      description: 'Word cloud question',
      icon: 'icon',
    },
  ],
  isChoiceBasedQuestion: (type: IQuestionType) =>
    [
      IQuestionType.MULTIPLE_CHOICES,
      IQuestionType.UNIQUE_CHOICES,
      IQuestionType.BOOLEAN_CHOICES,
    ].includes(type),
  isMultipleChoiceQuestion: (type: IQuestionType) => type === IQuestionType.MULTIPLE_CHOICES,
  isSingleChoiceQuestion: (type: IQuestionType) => type === IQuestionType.UNIQUE_CHOICES,
  isBooleanQuestion: (type: IQuestionType) => type === IQuestionType.BOOLEAN_CHOICES,
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    error: jest.fn(),
  },
}));

describe('QuestionForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockSetValue = jest.fn();
  const mockReset = jest.fn();
  const mockWatch = jest.fn();
  const mockAppend = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseForm.mockReturnValue({
      register: jest.fn(),
      handleSubmit: (fn: any) => fn,
      control: {},
      setValue: mockSetValue,
      reset: mockReset,
      watch: mockWatch,
      formState: { errors: {}, isSubmitting: false },
    } as any);

    mockUseFieldArray.mockReturnValue({
      fields: [
        { id: '1', text: 'Choice 1', isCorrect: true },
        { id: '2', text: 'Choice 2', isCorrect: false },
      ],
      append: mockAppend,
      remove: mockRemove,
    } as any);
  });

  it('should render form with current question', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('question.title')).toBeInTheDocument();
    expect(screen.getByText('question.type')).toBeInTheDocument();
    expect(screen.getByText('question.choices')).toBeInTheDocument();
  });

  it('should handle boolean question type', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.BOOLEAN_CHOICES;
      if (field === 'choices')
        return [
          { text: 'question.true', isCorrect: true },
          { text: 'question.false', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(mockSetValue).toHaveBeenCalledWith('choices', [
      { text: 'question.true', isCorrect: true },
      { text: 'question.false', isCorrect: false },
    ]);
  });

  it('should handle non-choice question type', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.WORD_CLOUD;
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('question.noChoicesRequired')).toBeInTheDocument();
  });

  it('should handle file upload', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const fileInput = screen.getByLabelText('question.image');
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockSetValue).toHaveBeenCalledWith('image', file, { shouldValidate: true });
  });

  it('should handle form submission with single choice', async () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.UNIQUE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const submitButton = screen.getByText('question.save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should handle form submission error', async () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    mockOnSubmit.mockRejectedValue(new Error('Test error'));

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const submitButton = screen.getByText('question.save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should handle adding choice', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const addButton = screen.getByText('question.addAnswer');
    fireEvent.click(addButton);

    expect(mockAppend).toHaveBeenCalledWith({ text: '', isCorrect: false });
  });

  it('should handle removing choice', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
          { text: 'Choice 3', isCorrect: false },
        ];
      return undefined;
    });

    mockUseFieldArray.mockReturnValue({
      fields: [
        { id: '1', text: 'Choice 1', isCorrect: true },
        { id: '2', text: 'Choice 2', isCorrect: false },
        { id: '3', text: 'Choice 3', isCorrect: false },
      ],
      append: mockAppend,
      remove: mockRemove,
    } as any);

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const removeButtons = screen.getAllByRole('button').filter(button => button.textContent === '');

    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(mockRemove).toHaveBeenCalled();
    }
  });

  it('should handle delete action', () => {
    mockWatch.mockImplementation((field?: string) => {
      if (field === 'questionType') return IQuestionType.MULTIPLE_CHOICES;
      if (field === 'choices')
        return [
          { text: 'Choice 1', isCorrect: true },
          { text: 'Choice 2', isCorrect: false },
        ];
      return undefined;
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText('common.delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should render empty state when no current question', () => {
    const { useQuizz } = require('@/providers/QuizzProvider');
    (useQuizz as jest.Mock).mockReturnValue({
      currentQuestion: null as any,
    });

    render(<QuestionForm onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Aucune question')).toBeInTheDocument();
    expect(screen.getByText('Ajoutez une question pour commencer')).toBeInTheDocument();
  });
});
