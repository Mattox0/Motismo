
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useCard } from '@/providers/CardProvider';
import { IQuizzType } from '@/types/model/IQuizzType';
import { CardGamePage } from '../CardGamePage';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/providers/CardProvider', () => ({
  useCard: jest.fn(),
}));

jest.mock('@/components/CardFlip', () => ({
  __esModule: true,
  default: ({ frontContent, backContent }: any) => (
    <div data-testid="card-flip">
      <div>Front: {frontContent}</div>
      <div>Back: {backContent}</div>
    </div>
  ),
}));
jest.mock('@/components/forms/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
jest.mock('../CustomErrorPage', () => ({
  CustomErrorPage: ({ title }: any) => <div data-testid="error-page">{title}</div>,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CardGamePage', () => {
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseCard   = useCard   as jest.MockedFunction<typeof useCard>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() } as any);
  });

  it('shows loading state when isLoading is true', () => {
    mockUseCard.mockReturnValue({
      quizz: null,
      isLoading: true,
    } as any);

    const { container } = render(<CardGamePage />);
    // .parent-loader should exist while loading
    expect(container.querySelector('.parent-loader')).toBeInTheDocument();
  });

  it('shows error page for non-card quiz type', () => {
    mockUseCard.mockReturnValue({
      quizz: { quizzType: IQuizzType.QUESTIONS, title: 'Test Quiz' },
      isLoading: false,
    } as any);

    render(<CardGamePage />);
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
    expect(screen.getByText('error.unauthorized.quizz')).toBeInTheDocument();
  });

  it('shows error page when no cards are available', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);
    expect(screen.getByTestId('error-page')).toBeInTheDocument();
    expect(screen.getByText('error.no.cards')).toBeInTheDocument();
  });

  it('renders card game with navigation when cards are available', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          { rectoText: 'Front 1', versoText: 'Back 1' },
          { rectoText: 'Front 2', versoText: 'Back 2' },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Test Cards')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'next' })).toBeInTheDocument();
  });
});
