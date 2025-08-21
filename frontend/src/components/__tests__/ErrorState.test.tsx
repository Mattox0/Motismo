import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders error title correctly', () => {
    const mockBackClick = jest.fn();
    render(<ErrorState title="Test Error" onBackClick={mockBackClick} />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('calls onBackClick when back button is clicked', () => {
    const mockBackClick = jest.fn();
    render(<ErrorState title="Test Error" onBackClick={mockBackClick} />);

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockBackClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    const mockBackClick = jest.fn();
    render(<ErrorState title="Test Error" onBackClick={mockBackClick} className="custom-class" />);

    const errorDiv = screen.getByText('Test Error').closest('div');
    expect(errorDiv).toHaveClass('classe-detail-page__error', 'custom-class');
  });

  it('applies default className when no custom className provided', () => {
    const mockBackClick = jest.fn();
    render(<ErrorState title="Test Error" onBackClick={mockBackClick} />);

    const errorDiv = screen.getByText('Test Error').closest('div');
    expect(errorDiv).toHaveClass('classe-detail-page__error');
    expect(errorDiv).not.toHaveClass('custom-class');
  });

  it('renders with different error titles', () => {
    const mockBackClick = jest.fn();
    render(<ErrorState title="Another Error Message" onBackClick={mockBackClick} />);

    expect(screen.getByText('Another Error Message')).toBeInTheDocument();
  });
});
