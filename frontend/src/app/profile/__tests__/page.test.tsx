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
  useUpdateQuizzMutation: jest.fn(),
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

import {
  useGetQuizQuery,
  useCreateGameMutation,
  useUpdateQuizzMutation,
} from '@/services/quiz.service';
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
    (useUpdateQuizzMutation as jest.Mock).mockReturnValue([jest.fn(), { isLoading: false }]);
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('shows loader when data is still loading', () => {
    mockGetQuiz.mockReturnValue({ data: undefined, isLoading: true } as any);
    const { container } = render(<Profile />);
    expect(container.querySelector('.loader')).toBeInTheDocument();
  });

  it('renders profile page with data', () => {
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

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
