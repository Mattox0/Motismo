import { render, screen } from '@testing-library/react';

import { useAuth } from '@/hooks/useAuth';
import { useGetOneQuizQuery } from '@/services/quiz.service';

import { QuizzProvider, useQuizz } from '../QuizzProvider';

// Mock des dépendances
jest.mock('@/hooks/useAuth');
jest.mock('@/services/quiz.service');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseGetOneQuizQuery = useGetOneQuizQuery as jest.MockedFunction<typeof useGetOneQuizQuery>;

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const context = useQuizz();
  return (
    <div>
      <span data-testid="isLoading">{context.isLoading.toString()}</span>
      <span data-testid="isAuthor">{context.isAuthor.toString()}</span>
      <span data-testid="currentQuestion">{context.currentQuestion?.title || 'null'}</span>
      <button onClick={() => context.selectCurrentQuestion('2')}>Select Question 2</button>
    </div>
  );
};

describe('QuizzProvider', () => {
  const mockQuizz = {
    id: '1',
    title: 'Test Quiz',
    author: { id: 'user1' },
    questions: [
      { id: '1', title: 'Question 1' },
      { id: '2', title: 'Question 2' },
    ],
  };

  const mockSession = {
    user: { id: 'user1' },
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
    } as any);
    mockUseGetOneQuizQuery.mockReturnValue({
      data: mockQuizz,
      isLoading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should provide quizz context with correct values', () => {
    render(
      <QuizzProvider quizId="1">
        <TestComponent />
      </QuizzProvider>
    );

    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('isAuthor')).toHaveTextContent('true');
    expect(screen.getByTestId('currentQuestion')).toHaveTextContent('Question 1');
  });

  test('should set isAuthor to false when user is not the author', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'user2' } },
    } as any);

    render(
      <QuizzProvider quizId="1">
        <TestComponent />
      </QuizzProvider>
    );

    expect(screen.getByTestId('isAuthor')).toHaveTextContent('false');
  });

  test('should show loading state when isLoading is true', () => {
    mockUseGetOneQuizQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    render(
      <QuizzProvider quizId="1">
        <TestComponent />
      </QuizzProvider>
    );

    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
  });

  test('should throw error when useQuizz is used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useQuizz must be used within a QuizzProvider');
  });
});
