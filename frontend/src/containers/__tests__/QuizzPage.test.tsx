import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

import QuestionForm from '@/components/forms/QuestionForm';
import { CustomErrorPage } from '@/containers/CustomErrorPage';
import { QuestionSide } from '@/containers/QuestionSide';
import { useQuizz } from '@/providers/QuizzProvider';
import { useDeleteQuestionMutation, useUpdateQuestionMutation } from '@/services/question.service';
import { showToast } from '@/utils/toast';

import { QuizzPage } from '../QuizzPage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/providers/QuizzProvider', () => ({
  useQuizz: jest.fn(),
}));
jest.mock('@/services/question.service', () => ({
  useUpdateQuestionMutation: jest.fn(),
  useDeleteQuestionMutation: jest.fn(),
}));
jest.mock('@/utils/toast', () => ({
  showToast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/SplashScreen', () => ({
  __esModule: true,
  SplashScreen: jest.fn(() => <div data-testid="splash-screen" />),
}));
jest.mock('@/containers/CustomErrorPage', () => ({
  __esModule: true,
  CustomErrorPage: jest.fn(props => <div data-testid="custom-error-page" {...props} />),
}));
jest.mock('@/containers/QuestionSide', () => ({
  __esModule: true,
  QuestionSide: jest.fn(props => <div data-testid="question-side" {...props} />),
}));
jest.mock('@/components/forms/QuestionForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="question-form" />),
}));

describe('QuizzPage', () => {
  const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseQuizz = useQuizz as jest.MockedFunction<typeof useQuizz>;
  const mockUpdateQ = useUpdateQuestionMutation as jest.MockedFunction<
    typeof useUpdateQuestionMutation
  >;
  const mockDeleteQ = useDeleteQuestionMutation as jest.MockedFunction<
    typeof useDeleteQuestionMutation
  >;
  const mockToast = showToast as typeof showToast & { success: jest.Mock; error: jest.Mock };
  const push = jest.fn();

  const currentQuestion = { id: 'q1', title: 'T', questionType: 'choice' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({ push } as any);
    mockUseQuizz.mockReturnValue({
      isLoading: false,
      isAuthor: true,
      currentQuestion,
      setCurrentQuestion: jest.fn(),
    } as any);
    mockUpdateQ.mockReturnValue([jest.fn(), { isLoading: false, error: null }] as any);
    mockDeleteQ.mockReturnValue([jest.fn(), { isLoading: false, error: null }] as any);
  });

  it('shows loader when quizz is loading', () => {
    mockUseQuizz.mockReturnValue({
      isLoading: true,
      isAuthor: false,
      currentQuestion: null,
      setCurrentQuestion: jest.fn(),
    } as any);

    render(<QuizzPage quizzId="quiz-1" />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  describe('authorization', () => {
    it('renders CustomErrorPage when not author', () => {
      mockUseQuizz.mockReturnValue({
        isLoading: false,
        isAuthor: false,
        currentQuestion: null,
        setCurrentQuestion: jest.fn(),
      } as any);

      render(<QuizzPage quizzId="quiz-1" />);

      // The custom‐error component should mount...
      expect(screen.getByTestId('custom-error-page')).toBeInTheDocument();

      // The component should be rendered
      expect(screen.getByTestId('custom-error-page')).toBeInTheDocument();
    });

    it('redirects home when error-page button clicked', () => {
      mockUseQuizz.mockReturnValue({
        isLoading: false,
        isAuthor: false,
        currentQuestion: null,
        setCurrentQuestion: jest.fn(),
      } as any);

      render(<QuizzPage quizzId="quiz-1" />);
      const mockCustom = CustomErrorPage as jest.Mock;
      const props = mockCustom.mock.calls[0][0];
      props.onClick();
      expect(push).toHaveBeenCalledWith('/');
    });
  });

  describe('main flow when authorized', () => {
    beforeEach(() => {
      mockUseQuizz.mockReturnValue({
        isLoading: false,
        isAuthor: true,
        currentQuestion,
        setCurrentQuestion: jest.fn(),
      } as any);
    });

    it('renders QuestionSide and QuestionForm', () => {
      render(<QuizzPage quizzId="quiz-1" />);
      expect(screen.getByTestId('question-side')).toBeInTheDocument();
      expect(screen.getByTestId('question-form')).toBeInTheDocument();
    });

    it('renders QuestionSide', () => {
      render(<QuizzPage quizzId="quiz-1" />);
      expect(screen.getByTestId('question-side')).toBeInTheDocument();
    });

    it('passes submit & delete handlers to QuestionForm', () => {
      render(<QuizzPage quizzId="quiz-1" />);
      const mockForm = QuestionForm as unknown as jest.Mock;
      const formProps = mockForm.mock.calls[0][0];

      expect(formProps.onSubmit).toEqual(expect.any(Function));
      expect(formProps.onDelete).toEqual(expect.any(Function));
    });

    it('handles a successful update', async () => {
      const upd = jest.fn().mockResolvedValue({ data: currentQuestion });
      mockUpdateQ.mockReturnValue([upd, { isLoading: false, error: null }] as any);

      render(<QuizzPage quizzId="quiz-1" />);
      const mockForm = QuestionForm as unknown as jest.Mock;
      const { onSubmit } = mockForm.mock.calls[0][0];

      await act(() => onSubmit({ title: 'New' }));
      expect(upd).toHaveBeenCalledWith({
        quizzId: 'quiz-1',
        questionId: 'q1',
        question: expect.any(FormData),
      });
      expect(mockToast.success).toHaveBeenCalledWith('question.updateSuccess');
    });

    it('handles an update error', async () => {
      const upd = jest.fn().mockResolvedValue({ error: { message: 'err' } });
      mockUpdateQ.mockReturnValue([upd, { isLoading: false, error: null }] as any);

      render(<QuizzPage quizzId="quiz-1" />);
      const mockForm = QuestionForm as unknown as jest.Mock;
      const { onSubmit } = mockForm.mock.calls[0][0];

      await act(() => onSubmit({ title: 'Fail' }));
      expect(mockToast.error).toHaveBeenCalledWith('question.updateError');
    });

    it('deletes the question when onDelete is called', async () => {
      const del = jest.fn();
      const setCurrent = jest.fn();
      mockDeleteQ.mockReturnValue([del, { isLoading: false, error: null }] as any);
      mockUseQuizz.mockReturnValue({
        isLoading: false,
        isAuthor: true,
        currentQuestion,
        setCurrentQuestion: setCurrent,
      } as any);

      render(<QuizzPage quizzId="quiz-1" />);
      const mockForm = QuestionForm as unknown as jest.Mock;
      const { onDelete } = mockForm.mock.calls[0][0];

      await act(() => onDelete());
      expect(setCurrent).toHaveBeenCalledWith(null);
      expect(del).toHaveBeenCalledWith({
        quizzId: 'quiz-1',
        questionId: 'q1',
      });
    });
  });
});
