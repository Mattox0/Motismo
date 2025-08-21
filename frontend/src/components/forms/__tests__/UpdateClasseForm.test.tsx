import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { UpdateClasseForm } from '../UpdateClasseForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UpdateClasseForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with initial name', () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    expect(screen.getByDisplayValue('Test Class')).toBeInTheDocument();
    expect(screen.getByText('classe.name')).toBeInTheDocument();
    expect(screen.getByText('common.save')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    fireEvent.change(nameInput, { target: { value: 'Updated Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" isLoading={true} />);

    expect(screen.getByText('common.loading')).toBeInTheDocument();
    expect(screen.getByText('common.loading')).toBeDisabled();
  });

  it('handles submission error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSubmit.mockRejectedValueOnce(new Error('Update failed'));

    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    fireEvent.change(nameInput, { target: { value: 'Updated Class' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating class:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('validates required fields', async () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates minimum length for name', async () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates maximum length for name', async () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    const longName = 'A'.repeat(51);
    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('accepts valid name length', async () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Test Class" />);

    const nameInput = screen.getByDisplayValue('Test Class');
    const submitButton = screen.getByText('common.save');

    fireEvent.change(nameInput, { target: { value: 'Valid Class Name' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('renders with different initial names', () => {
    render(<UpdateClasseForm onSubmit={mockOnSubmit} initialName="Another Class" />);

    expect(screen.getByDisplayValue('Another Class')).toBeInTheDocument();
  });
});
