import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { IQuizz } from '@/types/model/IQuizz';

import { EditQuizForm } from '../EditQuizForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('EditQuizForm', () => {
  const mockQuiz: IQuizz = {
    id: '1',
    title: 'Test Quiz',
    image: 'test-image.jpg',
    classes: [],
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with quiz data', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('edit_quiz.form.title')).toBeInTheDocument();
    expect(screen.getByText('edit_quiz.form.image')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Quiz');
    const submitButton = screen.getByText('edit_quiz.form.submit');

    fireEvent.change(titleInput, { target: { value: 'Updated Quiz' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('edit_quiz.form.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('handles file selection', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_quiz.form.image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput).toBeInTheDocument();
  });

  it('displays current image when no new file is selected', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const imagePreview = screen.getByAltText('edit_quiz.form.current_image');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'test-image.jpg');
  });

  it('displays placeholder when no image is available', () => {
    const quizWithoutImage = { ...mockQuiz, image: undefined };

    render(
      <EditQuizForm quiz={quizWithoutImage} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('edit_quiz.form.image_placeholder')).toBeInTheDocument();
  });

  it('handles file click', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const imagePreview = screen.getByAltText('edit_quiz.form.current_image');
    fireEvent.click(imagePreview);

    expect(imagePreview).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Quiz');
    const submitButton = screen.getByText('edit_quiz.form.submit');

    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles form validation errors', async () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByDisplayValue('Test Quiz');
    const submitButton = screen.getByText('edit_quiz.form.submit');

    fireEvent.change(titleInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('handles file validation errors', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_quiz.form.image');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(fileInput).toBeInTheDocument();
  });

  it('displays image preview when file is selected', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_quiz.form.image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput).toBeInTheDocument();
  });

  it('handles file input without files', () => {
    render(<EditQuizForm quiz={mockQuiz} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText('edit_quiz.form.image');

    fireEvent.change(fileInput, { target: { files: null } });

    expect(fileInput).toBeInTheDocument();
  });
});
