import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { JoinClasseForm } from '../JoinClasseForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('JoinClasseForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('classe.join.codeLabel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('classe.join.codePlaceholder')).toBeInTheDocument();
    expect(screen.getByText('classe.join.submit')).toBeInTheDocument();
  });

  it('submits form with valid code', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByLabelText('classe.join.codeLabel');
    const submitButton = screen.getByText('classe.join.submit');

    fireEvent.change(codeInput, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('classe.join.submit')).toBeDisabled();
  });

  it('validates required code field', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('classe.join.submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates minimum length for code', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByLabelText('classe.join.codeLabel');
    const submitButton = screen.getByText('classe.join.submit');

    fireEvent.change(codeInput, { target: { value: 'ABC' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates maximum length for code', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByLabelText('classe.join.codeLabel');
    const submitButton = screen.getByText('classe.join.submit');

    fireEvent.change(codeInput, { target: { value: 'ABC1234' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('accepts exactly 6 characters code', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByLabelText('classe.join.codeLabel');
    const submitButton = screen.getByText('classe.join.submit');

    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles different code formats', async () => {
    render(<JoinClasseForm onSubmit={mockOnSubmit} />);

    const codeInput = screen.getByLabelText('classe.join.codeLabel');
    const submitButton = screen.getByText('classe.join.submit');

    fireEvent.change(codeInput, { target: { value: 'XYZ789' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
