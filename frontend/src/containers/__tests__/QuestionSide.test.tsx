import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { useQuizz } from '@/providers/QuizzProvider';
import { useAddQuestionMutation, useDeleteQuestionMutation } from '@/services/question.service';
import { useCreateGameMutation } from '@/services/quiz.service';
import { showToast } from '@/utils/toast';

import { QuestionSide } from '../QuestionSide';

jest.mock('@/providers/QuizzProvider', () => ({
  useQuizz: jest.fn(),
}));

jest.mock('@/services/question.service', () => ({
  useAddQuestionMutation: jest.fn(),
  useDeleteQuestionMutation: jest.fn(),
}));

jest.mock('@/services/quiz.service', () => ({
  useCreateGameMutation: jest.fn(),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/QuestionItem', () => ({
  QuestionItem: ({ question, onDelete }: any) => (
    <div data-testid={`question-${question.id}`}>
      <span>{question.title}</span>
      <button onClick={() => onDelete(question.id)}>Delete</button>
    </div>
  ),
}));

jest.mock('@/components/forms/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('QuestionSide', () => {
  const mockUseQuizz = useQuizz as jest.MockedFunction<typeof useQuizz>;
  const mockAddQuestion = jest.fn();
  const mockDeleteQuestion = jest.fn();
  const mockCreateGame = jest.fn();
  const mockShowToast = showToast as jest.Mocked<typeof showToast>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuizz.mockReturnValue({
      quizz: {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [],
      },
      currentQuestion: null,
    } as any);
    (useAddQuestionMutation as jest.Mock).mockReturnValue([mockAddQuestion]);
    (useDeleteQuestionMutation as jest.Mock).mockReturnValue([mockDeleteQuestion]);
    (useCreateGameMutation as jest.Mock).mockReturnValue([mockCreateGame]);
  });

  it('renders empty state when no questions', () => {
    render(<QuestionSide quizzId="quiz-1" />);

    expect(screen.getByText('quiz.noQuestions')).toBeInTheDocument();
    expect(screen.getByText('quiz.noQuestionsDesc')).toBeInTheDocument();
  });

  it('renders questions when available', () => {
    mockUseQuizz.mockReturnValue({
      quizz: {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [
          { id: 'q1', title: 'Question 1' },
          { id: 'q2', title: 'Question 2' },
        ],
      },
      currentQuestion: null,
    } as any);

    render(<QuestionSide quizzId="quiz-1" />);

    expect(screen.getByTestId('question-q1')).toBeInTheDocument();
    expect(screen.getByTestId('question-q2')).toBeInTheDocument();
  });

  it('handles add question', async () => {
    mockAddQuestion.mockResolvedValue({ data: {} });

    render(<QuestionSide quizzId="quiz-1" />);

    const addButton = screen.getByText('edit_quiz.add.question');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddQuestion).toHaveBeenCalledWith({
        quizzId: 'quiz-1',
        question: expect.any(FormData),
      });
    });
  });

  it('handles delete question', async () => {
    mockUseQuizz.mockReturnValue({
      quizz: {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [{ id: 'q1', title: 'Question 1' }],
      },
      currentQuestion: null,
    } as any);

    render(<QuestionSide quizzId="quiz-1" />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteQuestion).toHaveBeenCalledWith({
        quizzId: 'quiz-1',
        questionId: 'q1',
      });
    });
  });

  it('prevents launch when no questions', () => {
    mockUseQuizz.mockReturnValue({
      quizz: {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [],
      },
      currentQuestion: null,
    } as any);

    render(<QuestionSide quizzId="quiz-1" />);

    const launchButton = screen.getByText('quiz.launchButton');
    expect(launchButton).toBeDisabled();
    expect(mockCreateGame).not.toHaveBeenCalled();
  });

  it('prevents launch when quizz is null', () => {
    mockUseQuizz.mockReturnValue({
      quizz: null,
      currentQuestion: null,
    } as any);

    render(<QuestionSide quizzId="quiz-1" />);

    const launchButton = screen.getByText('quiz.launchButton');
    expect(launchButton).toBeDisabled();
    expect(mockCreateGame).not.toHaveBeenCalled();
  });
});
