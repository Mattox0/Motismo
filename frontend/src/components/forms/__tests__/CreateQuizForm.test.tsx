/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { IQuizzType } from '@/types/model/IQuizzType';

import { CreateQuizForm } from '../CreateQuizForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../Button', () => ({
  Button: ({ children, type, variant, onClick }: any) => (
    <button type={type} onClick={onClick} data-testid={`button-${variant}`}>
      {children}
    </button>
  ),
}));

describe('CreateQuizForm component', () => {
  const defaultProps = {
    type: IQuizzType.QUESTIONS,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with title input', () => {
    render(<CreateQuizForm {...defaultProps} />);

    expect(screen.getByText('create_quiz.form.title')).toBeInTheDocument();
    expect(screen.getByLabelText('create_quiz.form.title')).toBeInTheDocument();
  });

  it('should render image upload section', () => {
    render(<CreateQuizForm {...defaultProps} />);

    expect(screen.getByText('create_quiz.form.image')).toBeInTheDocument();
    expect(screen.getByText('create_quiz.form.image_placeholder')).toBeInTheDocument();
  });

  it('should render cancel and submit buttons', () => {
    render(<CreateQuizForm {...defaultProps} />);

    expect(screen.getByTestId('button-secondary')).toBeInTheDocument();
    expect(screen.getByTestId('button-primary')).toBeInTheDocument();
    expect(screen.getByText('create_quiz.form.cancel')).toBeInTheDocument();
  });

  it('should show questions placeholder when type is QUESTIONS', () => {
    render(<CreateQuizForm {...defaultProps} type={IQuizzType.QUESTIONS} />);

    const titleInput = screen.getByLabelText('create_quiz.form.title');
    expect(titleInput).toHaveAttribute('placeholder', 'create_quiz.form.title_questions');
  });

  it('should show cards placeholder when type is CARDS', () => {
    render(<CreateQuizForm {...defaultProps} type={IQuizzType.CARDS} />);

    const titleInput = screen.getByLabelText('create_quiz.form.title');
    expect(titleInput).toHaveAttribute('placeholder', 'create_quiz.form.title_cards');
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<CreateQuizForm {...defaultProps} />);

    const cancelButton = screen.getByTestId('button-secondary');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should have correct input attributes', () => {
    render(<CreateQuizForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('create_quiz.form.title');
    expect(titleInput).toHaveAttribute('type', 'text');

    const fileInput = screen.getByLabelText('create_quiz.form.image');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/gif,image/jpg');
  });
});
