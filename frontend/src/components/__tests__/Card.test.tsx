/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';

import { Card, ICardProps } from '../Card';

jest.mock('@mui/icons-material/EventNoteOutlined', () => {
  return function MockEventNoteOutlinedIcon() {
    return <div data-testid="event-note-icon" />;
  };
});

jest.mock('@/utils/formatDate', () => ({
  formatDate: jest.fn(() => '01/01/2023'),
}));

jest.mock('@/components/forms/Button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-testid={`button-${variant}`}>
      {children}
    </button>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Card component', () => {
  const defaultProps: ICardProps = {
    image: 'https://example.com/image.jpg',
    badge: '5 questions',
    title: 'Test Quiz',
    creationDate: new Date('2023-01-01'),
    onEditClick: jest.fn(),
    onPresentationClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all card elements', () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('5 questions')).toBeInTheDocument();
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
    expect(screen.getByTestId('event-note-icon')).toBeInTheDocument();
  });

  it('should render image with correct attributes', () => {
    render(<Card {...defaultProps} />);

    const image = screen.getByAltText('Test Quiz');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveClass('card-header__image');
  });

  it('should render empty image src when image is not provided', () => {
    const propsWithoutImage = { ...defaultProps, image: undefined };
    render(<Card {...propsWithoutImage} />);

    const image = screen.getByAltText('Test Quiz');
    expect(image).toBeInTheDocument();
  });

  it('should render both buttons with correct text', () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByTestId('button-primary')).toBeInTheDocument();
    expect(screen.getByTestId('button-secondary')).toBeInTheDocument();
    expect(screen.getByText('card.button.primary')).toBeInTheDocument();
    expect(screen.getByText('card.button.secondary')).toBeInTheDocument();
  });

  it('should call onEditClick when primary button is clicked', () => {
    render(<Card {...defaultProps} />);

    fireEvent.click(screen.getByTestId('button-primary'));
    expect(defaultProps.onEditClick).toHaveBeenCalledTimes(1);
  });

  it('should call onPresentationClick when secondary button is clicked', () => {
    render(<Card {...defaultProps} />);

    fireEvent.click(screen.getByTestId('button-secondary'));
    expect(defaultProps.onPresentationClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct CSS classes', () => {
    render(<Card {...defaultProps} />);

    const card = screen.getByText('Test Quiz').closest('.card');
    expect(card).toBeInTheDocument();

    const badge = screen.getByText('5 questions');
    expect(badge).toHaveClass('card-header__badge');

    const dateText = screen.getByText('01/01/2023');
    expect(dateText).toHaveClass('card-content__date-text');
  });

  it('should render with different props', () => {
    const differentProps: ICardProps = {
      badge: '10 cards',
      title: 'Another Quiz',
      creationDate: new Date('2023-12-25'),
      onEditClick: jest.fn(),
      onPresentationClick: jest.fn(),
    };

    render(<Card {...differentProps} />);

    expect(screen.getByText('Another Quiz')).toBeInTheDocument();
    expect(screen.getByText('10 cards')).toBeInTheDocument();
  });
});
