import { render, screen, fireEvent } from '@testing-library/react';

import { BackButton } from '../BackButton';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('BackButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders back button with correct text', () => {
    render(<BackButton onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/common\.back/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<BackButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<BackButton onClick={mockOnClick} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('back-button', 'custom-class');
  });
});
