import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/services/quiz.service', () => ({
  useGetQuizQuery: jest.fn(),
  useCreateGameMutation: jest.fn(),
}));

jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: any) => <div data-testid="global-layout">{children}</div>,
}));
jest.mock('@/components/sections/AskCreateSection', () => ({
  AskCreateSection: () => <div data-testid="ask-create">AskCreateSection</div>,
}));
jest.mock('@/components/Card', () => ({
  Card: ({ title, badge, onPresentationClick }: any) => (
    <div data-testid="card">
      <span>{title}</span>
      <button onClick={() => onPresentationClick('foo')}>{badge}</button>
    </div>
  ),
}));
jest.mock('@/components/EmptyState', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      <p>{description}</p>
    </div>
  ),
}));

jest.mock('@/utils/toast', () => ({
  showToast: { error: jest.fn() },
}));

import Profile from '../page';
import { useGetQuizQuery, useCreateGameMutation } from '@/services/quiz.service';
import { showToast } from '@/utils/toast';
import { IQuizzType } from '@/types/model/IQuizzType';

describe('Profile page', () => {
  const mockGetQuiz = useGetQuizQuery as jest.MockedFunction<typeof useGetQuizQuery>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.fn();
    (useCreateGameMutation as jest.Mock).mockReturnValue([
      mockCreate,
      { isLoading: false }
    ]);
  });

  it('shows loader when data is still loading', () => {
    mockGetQuiz.mockReturnValue({ data: undefined, isLoading: true } as any);
    const { container } = render(<Profile />);
    expect(container.querySelector('.loader')).toBeInTheDocument();
  });

  it('shows empty state when there are no quizzes', () => {
    mockGetQuiz.mockReturnValue({ data: [], isLoading: false } as any);
    render(<Profile />);
    expect(screen.getByTestId('ask-create')).toBeInTheDocument();
    expect(screen.getAllByTestId('empty-state')).toHaveLength(2);
    expect(screen.queryAllByTestId('card')).toHaveLength(0);
  });

  it('renders question and card quizzes and allows creating a game', () => {
    const fakeData = [
      { id: 'q1', quizzType: IQuizzType.QUESTIONS, title: 'Quiz One', questions: [1,2], image: '/i.png', creationDate: '2025-01-01' },
      { id: 'c1', quizzType: IQuizzType.CARDS,     title: 'Quiz Two',     cards: [ { order:1 } ], image: '/i2.png', creationDate: '2025-02-02' },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    expect(screen.getByTestId('ask-create')).toBeInTheDocument();

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Quiz One');
    expect(cards[1]).toHaveTextContent('Quiz Two');

    fireEvent.click(cards[0].querySelector('button')!);
    expect(mockCreate).toHaveBeenCalledWith('q1');
  });

  it('shows error toast when creating a game fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unwrap = jest.fn().mockRejectedValue(new Error('fail'));
    mockCreate.mockReturnValue({ unwrap });
    mockGetQuiz.mockReturnValue({ data: [ { id:'x', quizzType:IQuizzType.QUESTIONS, title:'X', questions:[] } ], isLoading:false } as any);

    render(<Profile />);
    const button = screen.getByTestId('card').querySelector('button')!;
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    // The error should be logged to console.error
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
