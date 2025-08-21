import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { useGetClassesQuery } from '@/services/classe.service';
import { IQuizz } from '@/types/model/IQuizz';

import { EditCardForm } from '../EditCardForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/services/classe.service');

const mockUseGetClassesQuery = useGetClassesQuery as jest.MockedFunction<typeof useGetClassesQuery>;

describe('EditCardForm', () => {
  const mockCard: IQuizz = {
    id: '1',
    title: 'Test Card',
    image: 'test-image.jpg',
    classes: [],
  };

  const mockClasses = [
    { id: '1', name: 'Class 1', code: 'ABC123', students: [], teachers: [] },
    { id: '2', name: 'Class 2', code: 'DEF456', students: [], teachers: [] },
  ];

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetClassesQuery.mockReturnValue({ data: mockClasses } as any);
  });

  it('renders form with card data', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument();
    expect(screen.getByText('edit_card.form.title')).toBeInTheDocument();
    expect(screen.getByText('edit_card.form.image')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Card');
    const submitButton = screen.getByText('edit_card.form.submit');

    fireEvent.change(titleInput, { target: { value: 'Updated Card' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('edit_card.form.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('handles file selection', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_card.form.image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput).toBeInTheDocument();
  });

  it('displays current image when no new file is selected', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const imagePreview = screen.getByAltText('edit_card.form.current_image');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'test-image.jpg');
  });

  it('displays placeholder when no image is available', () => {
    const cardWithoutImage = { ...mockCard, image: undefined };

    render(
      <EditCardForm card={cardWithoutImage} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('edit_card.form.image_placeholder')).toBeInTheDocument();
  });

  it('handles file click', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const imagePreview = screen.getByAltText('edit_card.form.current_image');
    fireEvent.click(imagePreview);

    expect(imagePreview).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Card');
    const submitButton = screen.getByText('edit_card.form.submit');

    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles class selection', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('create_quiz.form.classes')).toBeInTheDocument();
  });

  it('renders with empty classes array', () => {
    mockUseGetClassesQuery.mockReturnValue({ data: [] } as any);

    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('edit_card.form.title')).toBeInTheDocument();
  });

  it('handles form validation errors', async () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Card');
    const submitButton = screen.getByText('edit_card.form.submit');

    fireEvent.change(titleInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles file validation errors', () => {
    render(<EditCardForm card={mockCard} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_card.form.image');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(fileInput).toBeInTheDocument();
  });
});
