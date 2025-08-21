import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

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
  default: ({ frontContent, backContent, flipped, setFlipped }: any) => (
    <div data-testid="card-flip" onClick={() => setFlipped(!flipped)}>
      <div>Front: {frontContent}</div>
      <div>Back: {backContent}</div>
      <div>Flipped: {flipped ? 'Yes' : 'No'}</div>
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
  CustomErrorPage: ({ title, onClick }: any) => (
    <div data-testid="error-page">
      <span>{title}</span>
      <button onClick={onClick}>Error Button</button>
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe('CardGamePage', () => {
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseCard = useCard as jest.MockedFunction<typeof useCard>;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
  });

  it('shows loading state when isLoading is true', () => {
    mockUseCard.mockReturnValue({
      quizz: null,
      isLoading: true,
    } as any);

    const { container } = render(<CardGamePage />);
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

  it('redirects home when error page button is clicked for non-card quiz', () => {
    mockUseCard.mockReturnValue({
      quizz: { quizzType: IQuizzType.QUESTIONS, title: 'Test Quiz' },
      isLoading: false,
    } as any);

    render(<CardGamePage />);
    fireEvent.click(screen.getByText('Error Button'));
    expect(mockPush).toHaveBeenCalledWith('/');
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

  it('redirects to profile when error page button is clicked for no cards', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);
    fireEvent.click(screen.getByText('Error Button'));
    expect(mockPush).toHaveBeenCalledWith('/profile');
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
    expect(screen.getByRole('button', { name: 'common.previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.next' })).toBeInTheDocument();
  });

  it('handles navigation with previous and next buttons', () => {
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

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Front: Front 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByText('Front: Front 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.previous' }));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Front: Front 1')).toBeInTheDocument();
  });

  it('disables previous button on first card', () => {
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

    const prevButton = screen.getByRole('button', { name: 'common.previous' });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last card', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));

    const nextButton = screen.getByRole('button', { name: 'common.next' });
    expect(nextButton).toBeDisabled();
  });

  it('handles card flipping', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [{ rectoText: 'Front 1', versoText: 'Back 1' }],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    const cardFlip = screen.getByTestId('card-flip');
    expect(screen.getByText('Flipped: No')).toBeInTheDocument();

    fireEvent.click(cardFlip);
    expect(screen.getByText('Flipped: Yes')).toBeInTheDocument();

    fireEvent.click(cardFlip);
    expect(screen.getByText('Flipped: No')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
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

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'd' });
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'q' });
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ' });
    expect(screen.getByText('Flipped: Yes')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText('Flipped: No')).toBeInTheDocument();
  });

  it('handles image content correctly', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          {
            rectoImage: 'http://example.com/front.jpg',
            versoImage: 'http://example.com/back.jpg',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Front: http://example.com/front.jpg')).toBeInTheDocument();
    expect(screen.getByText('Back: http://example.com/back.jpg')).toBeInTheDocument();
  });

  it('handles mixed content (image and text)', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          {
            rectoImage: 'http://example.com/front.jpg',
            versoText: 'Back Text',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Front: http://example.com/front.jpg')).toBeInTheDocument();
    expect(screen.getByText('Back: Back Text')).toBeInTheDocument();
  });

  it('handles image content with different file extensions', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          {
            rectoImage: 'image.jpeg',
            versoImage: 'image.png',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Front: image.jpeg')).toBeInTheDocument();
    expect(screen.getByText('Back: image.png')).toBeInTheDocument();
  });

  it('handles image content with webp extension', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          {
            rectoImage: 'image.webp',
            versoImage: 'image.gif',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Front: image.webp')).toBeInTheDocument();
    expect(screen.getByText('Back: image.gif')).toBeInTheDocument();
  });

  it('handles non-image content correctly', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [
          {
            rectoImage: 'document.pdf',
            versoImage: 'file.txt',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByText('Front: document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Back: file.txt')).toBeInTheDocument();
  });

  it('handles animation variants correctly', () => {
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

    expect(screen.getByText('Front: Front 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByText('Front: Front 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.previous' }));
    expect(screen.getByText('Front: Front 1')).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    mockUseCard.mockReturnValue({
      quizz: {
        quizzType: IQuizzType.CARDS,
        title: 'Test Cards',
        cards: [{ rectoText: '', versoText: '' }],
      },
      isLoading: false,
    } as any);

    render(<CardGamePage />);

    expect(screen.getByTestId('card-flip')).toBeInTheDocument();
    expect(screen.getByText('Flipped: No')).toBeInTheDocument();
  });

  it('resets flip state when navigating to new card', () => {
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

    const cardFlip = screen.getByTestId('card-flip');
    fireEvent.click(cardFlip);
    expect(screen.getByText('Flipped: Yes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByText('Flipped: No')).toBeInTheDocument();
  });

  it('ignores repeated key presses', () => {
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

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'repeat', { value: true });

    fireEvent(window, event);
    expect(screen.getByText('1 / 2')).toBeInTheDocument(); // Should not navigate
  });
});
