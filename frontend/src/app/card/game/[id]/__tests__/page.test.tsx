import { render, screen } from '@testing-library/react';

import CardGame from '../page';

jest.mock('@/containers/CardGamePage', () => ({
  CardGamePage: () => <div data-testid="card-game-page">Card Game Page</div>,
}));

jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="global-layout">{children}</div>
  ),
}));

jest.mock('@/providers/CardProvider', () => ({
  CardProvider: ({ children, quizId }: { children: React.ReactNode; quizId: string }) => (
    <div data-testid="card-provider" data-quiz-id={quizId}>
      {children}
    </div>
  ),
}));

describe('CardGame', () => {
  it('renders the page with correct quiz ID', async () => {
    const params = { id: 'test-quiz-id' };
    
    render(await CardGame({ params }));
    
    expect(screen.getByTestId('card-game-page')).toBeInTheDocument();
    expect(screen.getByTestId('card-provider')).toHaveAttribute('data-quiz-id', 'test-quiz-id');
  });

  it('renders global layout', async () => {
    const params = { id: 'test-quiz-id' };
    
    render(await CardGame({ params }));
    
    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
  });

  it('renders card provider with quiz ID', async () => {
    const params = { id: 'another-quiz-id' };
    
    render(await CardGame({ params }));
    
    const cardProvider = screen.getByTestId('card-provider');
    expect(cardProvider).toBeInTheDocument();
    expect(cardProvider).toHaveAttribute('data-quiz-id', 'another-quiz-id');
  });
}); 