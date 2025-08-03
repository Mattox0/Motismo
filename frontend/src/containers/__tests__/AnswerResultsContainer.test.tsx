import { fireEvent, render, screen } from '@testing-library/react';

import { AnswerResultsContainer } from '../AnswerResultsContainer';
import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';

jest.mock('@/components/game/AnswerResults', () => ({
  AnswerResults: ({ statistics }: { statistics: IAnswerStatistics }) => (
    <div data-testid="answer-results" data-statistics={JSON.stringify(statistics)}>
      Answer Results
    </div>
  ),
}));

describe('AnswerResultsContainer', () => {
  const mockStatistics: IAnswerStatistics = {
    questionTitle: 'Question 1',
    totalResponses: 3,
    questionId: '1',
    choices: [
      { choiceId: '1', choiceText: 'Choice 1', isCorrect: true, users: [{ id: 'user1', name: 'User 1', avatar: 'avatar1' }, { id: 'user2', name: 'User 2', avatar: 'avatar2' }], count: 2, percentage: 50 },
      { choiceId: '2', choiceText: 'Choice 2', isCorrect: false, users: [{ id: 'user3', name: 'User 3', avatar: 'avatar3' }], count: 1, percentage: 25 },
      { choiceId: '3', choiceText: 'Choice 3', isCorrect: false, users: [], count: 0, percentage: 0 },
    ],
  };

  const mockHandleClick = jest.fn();

  const renderComponent = () => {
    return render(
      <AnswerResultsContainer
        statistics={mockStatistics}
        handleClick={mockHandleClick}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the answer results component', () => {
    renderComponent();
    
    expect(screen.getByTestId('answer-results')).toBeInTheDocument();
  });

  it('should pass statistics to AnswerResults component', () => {
    renderComponent();
    
    const answerResults = screen.getByTestId('answer-results');
    expect(answerResults).toHaveAttribute('data-statistics', JSON.stringify(mockStatistics));
  });

  it('should render the next button', () => {
    renderComponent();
    
    const nextButton = document.querySelector('.next-button');
    expect(nextButton).toBeInTheDocument();
  });

  it('should call handleClick when next button is clicked', () => {
    renderComponent();
    
    const nextButtonCircle = document.querySelector('.next-button__circle');
    expect(nextButtonCircle).toBeInTheDocument();
    
    fireEvent.click(nextButtonCircle!);
    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct CSS classes', () => {
    renderComponent();
    
    const container = document.querySelector('.answer-results-container');
    const nextButton = document.querySelector('.next-button');
    const nextButtonCircle = document.querySelector('.next-button__circle');
    const nextButtonIcon = document.querySelector('.next-button__icon');
    
    expect(container).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(nextButtonCircle).toBeInTheDocument();
    expect(nextButtonIcon).toBeInTheDocument();
  });
}); 