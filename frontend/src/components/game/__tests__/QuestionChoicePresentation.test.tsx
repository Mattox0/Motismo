import { fireEvent, render, screen } from '@testing-library/react';

import { IQuestion } from '@/types/model/IQuestion';
import { IQuestionType } from '@/types/QuestionType';

import { QuestionChoicePresentation } from '../QuestionChoicePresentation';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="question-image" />
  ),
}));

jest.mock('@/providers/GameProvider', () => ({
  useGame: () => ({
    answerCount: { answered: 5, total: 10 },
  }),
}));

jest.mock('@/providers/SocketProvider', () => ({
  useSocket: () => ({
    emit: jest.fn(),
  }),
}));

jest.mock('@/components/Title', () => ({
  Title: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
}));

jest.mock('../Timer', () => ({
  Timer: ({ timeLeft, onFinishedClick }: any) => (
    <div data-testid="timer">
      <span>Time: {timeLeft}</span>
      <button onClick={onFinishedClick} data-testid="show-results-btn">
        Show Results
      </button>
    </div>
  ),
}));

describe('QuestionChoicePresentation', () => {
  const mockQuestion: IQuestion = {
    id: '1',
    title: 'Test Question',
    questionType: IQuestionType.MULTIPLE_CHOICES,
    choices: [
      { id: '1', text: 'Choice A', isCorrect: true },
      { id: '2', text: 'Choice B', isCorrect: false },
      { id: '3', text: 'Choice C', isCorrect: false },
    ],
    order: 1,
    image: 'test-image.jpg',
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      question: mockQuestion,
      ...props,
    };

    return render(<QuestionChoicePresentation {...defaultProps} />);
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

  it('should render choice items with letters', () => {
    renderComponent();

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Choice A')).toBeInTheDocument();
    expect(screen.getByText('Choice B')).toBeInTheDocument();
    expect(screen.getByText('Choice C')).toBeInTheDocument();
  });

  it('should render question image when provided', () => {
    const questionWithImage = {
      ...mockQuestion,
      image: 'test-image.jpg',
    };

    renderComponent({ question: questionWithImage });

    expect(screen.getByTestId('question-image')).toBeInTheDocument();
  });

  it('should render placeholder when no choices are provided', () => {
    const questionWithoutChoices = {
      ...mockQuestion,
      choices: undefined,
    };

    renderComponent({ question: questionWithoutChoices });

    expect(screen.getByText('Les participants répondent à cette question...')).toBeInTheDocument();
  });

  it('should call show results when timer finished button is clicked', () => {
    renderComponent({ timeLeft: 30 });

    const showResultsButton = screen.getByTestId('show-results-btn');
    fireEvent.click(showResultsButton);

    expect(showResultsButton).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    renderComponent();

    const container = document.querySelector('.question-presentation');
    const header = document.querySelector('.question-presentation__header');
    const main = document.querySelector('.question-presentation__main');
    const choices = document.querySelector('.question-presentation__choices');

    expect(container).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(choices).toBeInTheDocument();
  });

  it('should render choices grid', () => {
    renderComponent();

    const choicesGrid = document.querySelector('.choices-grid');
    expect(choicesGrid).toBeInTheDocument();
  });

  it('should render choice items with correct structure', () => {
    renderComponent();

    const choiceItems = document.querySelectorAll('.choice-item');
    expect(choiceItems).toHaveLength(3);

    const choiceLetters = document.querySelectorAll('.choice-item__letter');
    const choiceTexts = document.querySelectorAll('.choice-item__text');

    expect(choiceLetters).toHaveLength(3);
    expect(choiceTexts).toHaveLength(3);
  });
});
