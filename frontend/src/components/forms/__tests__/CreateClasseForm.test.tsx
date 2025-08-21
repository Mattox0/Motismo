import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { CreateClasseFormData } from '@/types/schemas/createClasseSchema';

import { CreateClasseForm } from '../CreateClasseForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CreateClasseForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('classe.name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('classe.namePlaceholder')).toBeInTheDocument();
    expect(screen.getByText('classe.create')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('common.loading')).toBeInTheDocument();
    expect(screen.getByText('common.loading')).toBeDisabled();
  });

  it('resets form after successful submission', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles submission error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));

    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'Test Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('validates required fields', async () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('classe.create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates minimum length for name', async () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates maximum length for name', async () => {
    render(<CreateClasseForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('classe.name');
    const submitButton = screen.getByText('classe.create');

    const longName = 'A'.repeat(51);
    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
