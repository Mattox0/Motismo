import { fireEvent, render, screen } from '@testing-library/react';

import { IQuestion } from '@/types/model/IQuestion';
import { IQuestionType } from '@/types/QuestionType';

import { QuestionChoicePlayer } from '../QuestionChoicePlayer';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="question-image" />
  ),
}));

jest.mock('@/providers/GameProvider', () => ({
  useGame: () => ({
    answerCount: { answered: 5, total: 10 },
    timerFinished: false,
  }),
}));

jest.mock('@/providers/SocketProvider', () => ({
  useSocket: () => ({
    emit: jest.fn(),
  }),
}));

jest.mock('@/components/Title', () => ({
  Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}));

jest.mock('../ChoiceButton', () => ({
  ChoiceButton: ({ choice, onClick, isSelected }: any) => (
    <button
      data-testid={`choice-${choice.id}`}
      onClick={() => onClick(0)}
      className={isSelected ? 'selected' : ''}
    >
      {choice.text}
    </button>
  ),
}));

jest.mock('../SubmitButton', () => ({
  SubmitButton: ({ onClick, disabled }: any) => (
    <button data-testid="submit-button" onClick={onClick} disabled={disabled}>
      Submit
    </button>
  ),
}));

jest.mock('../Timer', () => ({
  Timer: ({ timeLeft }: any) => <div data-testid="timer">Time: {timeLeft}</div>,
}));

describe('QuestionChoicePlayer', () => {
  const mockQuestion: IQuestion = {
    image: 'test-image.jpg',
    id: '1',
    title: 'Test Question',
    questionType: IQuestionType.MULTIPLE_CHOICES,
    choices: [
      { id: '1', text: 'Choice 1', isCorrect: true },
      { id: '2', text: 'Choice 2', isCorrect: false },
    ],
    order: 1,
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      question: mockQuestion,
      ...props,
    };

    return render(<QuestionChoicePlayer {...defaultProps} />);
  };

  it('should render the question title', () => {
    renderComponent();

    expect(screen.getByText('Test Question')).toBeInTheDocument();
  });

  it('should render question counter when provided', () => {
    renderComponent({ currentQuestionNumber: 2, totalQuestions: 5 });

    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('should render timer when timeLeft is provided', () => {
    renderComponent({ timeLeft: 30 });

    expect(screen.getByTestId('timer')).toBeInTheDocument();
    expect(screen.getByText('Time: 30')).toBeInTheDocument();
  });

  it('should render choice buttons', () => {
    renderComponent();

    expect(screen.getByTestId('choice-1')).toBeInTheDocument();
    expect(screen.getByTestId('choice-2')).toBeInTheDocument();
    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderComponent();

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should render question image when provided', () => {
    const questionWithImage = {
      ...mockQuestion,
      image: 'test-image.jpg',
    };

    renderComponent({ question: questionWithImage });

    expect(screen.getByTestId('question-image')).toBeInTheDocument();
  });

  it('should render textarea when no choices are provided', () => {
    const questionWithoutChoices = {
      ...mockQuestion,
      choices: undefined,
    };

    renderComponent({ question: questionWithoutChoices });

    expect(screen.getByPlaceholderText('Votre réponse...')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    renderComponent();

    const container = document.querySelector('.question-player');
    const header = document.querySelector('.question-player__header');
    const content = document.querySelector('.question-player__content');

    expect(container).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });
});
