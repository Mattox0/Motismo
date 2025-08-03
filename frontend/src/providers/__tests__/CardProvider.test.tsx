import { render, screen } from '@testing-library/react';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useGetOneQuizQuery } from '@/services/quiz.service';
import { IQuizz } from '@/types/model/IQuizz';
import { IQuizzType } from '@/types/model/IQuizzType';

import { CardProvider, useCard } from '../CardProvider';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/quiz.service', () => ({
  useGetOneQuizQuery: jest.fn(),
}));

const TestComponent = () => {
  const { quizz, isLoading, error, isAuthor } = useCard();
  return (
    <div>
      <div data-testid="quizz-title">{quizz?.title || 'No title'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="is-author">{isAuthor ? 'Author' : 'Not author'}</div>
    </div>
  );
};

describe('CardProvider', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseGetOneQuizQuery = useGetOneQuizQuery as jest.MockedFunction<typeof useGetOneQuizQuery>;

  const mockQuizz: IQuizz = {
    id: '1',
    title: 'Test Quiz',
    image: '',
    questions: [],
    quizzType: IQuizzType.QUESTIONS,
    creationDate: new Date(),
    author: { id: 'user1', username: 'testuser', email: 'test@example.com', creationDate: new Date() },
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'user1', name: 'Test User' } },
    } as any);
    mockUseGetOneQuizQuery.mockReturnValue({
      data: mockQuizz,
      isLoading: false,
      error: undefined,
    } as any);
  });

  it('provides quiz data to children', () => {
    render(
      <CardProvider quizId="1">
        <TestComponent />
      </CardProvider>
    );

    expect(screen.getByTestId('quizz-title')).toHaveTextContent('Test Quiz');
  });

  it('indicates when user is the author', () => {
    render(
      <CardProvider quizId="1">
        <TestComponent />
      </CardProvider>
    );

    expect(screen.getByTestId('is-author')).toHaveTextContent('Author');
  });

  it('indicates when user is not the author', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'user2', name: 'Other User' } },
    } as any);

    render(
      <CardProvider quizId="1">
        <TestComponent />
      </CardProvider>
    );

    expect(screen.getByTestId('is-author')).toHaveTextContent('Not author');
  });
}); 