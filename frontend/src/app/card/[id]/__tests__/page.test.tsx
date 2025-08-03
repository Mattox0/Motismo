/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import CardEditionPage from '../page';

jest.mock('@/containers/CardPage', () => ({
  CardPage: ({ quizzId }: { quizzId: string }) => (
    <div data-testid="card-page">Card Page for quiz {quizzId}</div>
  ),
}));

jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children, screened }: { children: React.ReactNode; screened?: boolean }) => (
    <div data-testid="global-layout" data-screened={screened}>
      {children}
    </div>
  ),
}));

jest.mock('@/providers/CardProvider', () => ({
  CardProvider: ({ children, quizId }: { children: React.ReactNode; quizId: string }) => (
    <div data-testid="card-provider" data-quiz-id={quizId}>
      {children}
    </div>
  ),
}));

describe('CardEditionPage', () => {
  it('should render with correct props', async () => {
    const params = { id: 'test-quiz-id' };

    render(await CardEditionPage({ params }));

    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
    expect(screen.getByTestId('global-layout')).toHaveAttribute('data-screened', 'true');

    expect(screen.getByTestId('card-provider')).toBeInTheDocument();
    expect(screen.getByTestId('card-provider')).toHaveAttribute('data-quiz-id', 'test-quiz-id');

    expect(screen.getByTestId('card-page')).toBeInTheDocument();
    expect(screen.getByText('Card Page for quiz test-quiz-id')).toBeInTheDocument();
  });

  it('should pass quiz id to both CardProvider and CardPage', async () => {
    const params = { id: 'another-quiz-id' };

    render(await CardEditionPage({ params }));

    expect(screen.getByTestId('card-provider')).toHaveAttribute('data-quiz-id', 'another-quiz-id');
    expect(screen.getByText('Card Page for quiz another-quiz-id')).toBeInTheDocument();
  });
});
