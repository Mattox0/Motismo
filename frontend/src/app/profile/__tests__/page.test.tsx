import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'card.questions' && params?.nbQuestions) {
        return `${params.nbQuestions} questions`;
      }
      if (key === 'card.cards' && params?.nbCards) {
        return `${params.nbCards} cards`;
      }
      if (key === 'error.no.cards') {
        return 'No cards available';
      }
      return key;
    },
  }),
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
  Card: ({ title, badge, onPresentationClick, onEditClick }: any) => (
    <div data-testid="card">
      <span>{title}</span>
      <span>{badge}</span>
      <button onClick={() => onPresentationClick('foo')}>presentation</button>
      <button onClick={onEditClick}>edit</button>
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

import { useGetQuizQuery, useCreateGameMutation } from '@/services/quiz.service';
import { IQuizzType } from '@/types/model/IQuizzType';
import { showToast } from '@/utils/toast';

import Profile from '../page';

describe('Profile page', () => {
  const mockGetQuiz = useGetQuizQuery as jest.MockedFunction<typeof useGetQuizQuery>;
  let mockCreate: jest.Mock;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.fn();
    mockPush = jest.fn();
    (useCreateGameMutation as jest.Mock).mockReturnValue([mockCreate, { isLoading: false }]);
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
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

  it('renders question and card quizzes and allows creating a game', async () => {
    const fakeData = [
      {
        id: 'q1',
        quizzType: IQuizzType.QUESTIONS,
        title: 'Quiz One',
        questions: [1, 2],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Quiz Two',
        cards: [{ order: 1 }],
        image: '/i2.png',
        creationDate: '2025-02-02',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);
    mockCreate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ code: 'ABC123' }) });

    render(<Profile />);

    expect(screen.getByTestId('ask-create')).toBeInTheDocument();

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Quiz One');
    expect(cards[1]).toHaveTextContent('Quiz Two');

    const presentationButtons = screen.getAllByText('presentation');
    await act(async () => {
      fireEvent.click(presentationButtons[0]);
    });

    expect(mockCreate).toHaveBeenCalledWith('q1');
    expect(mockPush).toHaveBeenCalledWith('/game/ABC123');
  });

  it('shows error toast when creating a game fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const unwrap = jest.fn().mockRejectedValue(new Error('fail'));
    mockCreate.mockReturnValue({ unwrap });
    mockGetQuiz.mockReturnValue({
      data: [{ id: 'x', quizzType: IQuizzType.QUESTIONS, title: 'X', questions: [] }],
      isLoading: false,
    } as any);

    render(<Profile />);
    const button = screen.getByText('presentation');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles card presentation with cards available', () => {
    const fakeData = [
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Card Quiz',
        cards: [{ order: 1 }, { order: 2 }],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    const presentationButtons = screen.getAllByText('presentation');
    fireEvent.click(presentationButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/card/game/c1');
  });

  it('shows error toast when card has no cards', () => {
    const fakeData = [
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Card Quiz',
        cards: [],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    const presentationButtons = screen.getAllByText('presentation');
    fireEvent.click(presentationButtons[0]);

    expect(showToast.error).toHaveBeenCalledWith('No cards available');
  });

  it('handles edit click for question quiz', () => {
    const fakeData = [
      {
        id: 'q1',
        quizzType: IQuizzType.QUESTIONS,
        title: 'Quiz One',
        questions: [1, 2],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    const editButtons = screen.getAllByText('edit');
    fireEvent.click(editButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/quiz/q1');
  });

  it('handles edit click for card quiz', () => {
    const fakeData = [
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Card Quiz',
        cards: [{ order: 1 }],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    const editButtons = screen.getAllByText('edit');
    fireEvent.click(editButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/card/c1');
  });

  it('displays correct badge for questions quiz', () => {
    const fakeData = [
      {
        id: 'q1',
        quizzType: IQuizzType.QUESTIONS,
        title: 'Quiz One',
        questions: [1, 2, 3],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    expect(screen.getByText('3 questions')).toBeInTheDocument();
  });

  it('displays correct badge for cards quiz', () => {
    const fakeData = [
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Card Quiz',
        cards: [{ order: 1 }, { order: 2 }],
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    expect(screen.getByText('2 cards')).toBeInTheDocument();
  });

  it('handles undefined questions and cards arrays', () => {
    const fakeData = [
      {
        id: 'q1',
        quizzType: IQuizzType.QUESTIONS,
        title: 'Quiz One',
        questions: undefined,
        image: '/i.png',
        creationDate: '2025-01-01',
      },
      {
        id: 'c1',
        quizzType: IQuizzType.CARDS,
        title: 'Card Quiz',
        cards: undefined,
        image: '/i.png',
        creationDate: '2025-01-01',
      },
    ];
    mockGetQuiz.mockReturnValue({ data: fakeData, isLoading: false } as any);

    render(<Profile />);

    expect(screen.getByText('card.questions')).toBeInTheDocument();
    expect(screen.getByText('card.cards')).toBeInTheDocument();
  });
});
