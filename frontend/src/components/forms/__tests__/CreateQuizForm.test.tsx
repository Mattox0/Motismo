/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import { IQuizzType } from '@/types/model/IQuizzType';

import { CreateQuizForm } from '../CreateQuizForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/services/classe.service', () => ({
  useGetClassesQuery: () => ({
    data: [],
    isLoading: false,
  }),
}));

jest.mock('@/components/forms/Input', () => {
  return function MockInput({ label, error, registration, isPassword, ...props }: any) {
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          {...registration}
          {...props}
          type={isPassword ? 'password' : 'text'}
          data-testid={`input-${label?.toLowerCase()}`}
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  };
});

jest.mock('@/components/forms/ClassSelector', () => {
  return function MockClassSelector({ classes, selectedClassIds, onSelectionChange, error }: any) {
    return (
      <div data-testid="class-selector">
        <span>Class Selector</span>
        {error && <span className="error">{error}</span>}
      </div>
    );
  };
});

describe('CreateQuizForm component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with title input', () => {
    render(
      <CreateQuizForm type={IQuizzType.QUESTIONS} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('create_quiz.form.title')).toBeInTheDocument();
  });

  it('should render image upload section', () => {
    render(
      <CreateQuizForm type={IQuizzType.QUESTIONS} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('create_quiz.form.image')).toBeInTheDocument();
  });

  it('should render cancel and submit buttons', () => {
    render(
      <CreateQuizForm type={IQuizzType.QUESTIONS} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('create_quiz.form.cancel')).toBeInTheDocument();
    expect(screen.getByText('create_quiz.form.submit')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <CreateQuizForm type={IQuizzType.QUESTIONS} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByText('create_quiz.form.cancel');
    cancelButton.click();

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
