import { render, screen } from '@testing-library/react';

import { IChoiceStatistic } from '@/types/model/IAnswerStatistics';

import { ChoiceResult } from '../ChoiceResult';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

jest.mock('@/providers/GameProvider', () => ({
  useGame: () => ({
    myUser: { id: '1', name: 'Test User' },
  }),
}));

describe('ChoiceResult', () => {
  const mockChoice: IChoiceStatistic = {
    choiceId: '1',
    choiceText: 'Test Choice',
    isCorrect: true,
    count: 5,
    percentage: 60,
    users: [
      { id: '1', name: 'User 1', avatar: 'avatar1.jpg' },
      { id: '2', name: 'User 2', avatar: 'avatar2.jpg' },
    ],
  };

  it('should render choice text', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    expect(screen.getByText('Test Choice')).toBeInTheDocument();
  });

  it('should render choice letter', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should render correct badge when choice is correct', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should not render correct badge when choice is incorrect', () => {
    const incorrectChoice = { ...mockChoice, isCorrect: false };
    render(<ChoiceResult choice={incorrectChoice} index={0} />);

    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('should render choice statistics', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should render users when present', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    expect(screen.getByText('Répondu par :')).toBeInTheDocument();
  });

  it('should not render users section when no users', () => {
    const choiceWithoutUsers = { ...mockChoice, users: [] };
    render(<ChoiceResult choice={choiceWithoutUsers} index={0} />);

    expect(screen.queryByText('Répondu par :')).not.toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(<ChoiceResult choice={mockChoice} index={0} />);

    const container = screen.getByText('Test Choice').closest('.choice-result');
    expect(container).toHaveClass('choice-result--correct');
  });

  it('should have incorrect class when choice is wrong', () => {
    const incorrectChoice = { ...mockChoice, isCorrect: false };
    render(<ChoiceResult choice={incorrectChoice} index={0} />);

    const container = screen.getByText('Test Choice').closest('.choice-result');
    expect(container).toHaveClass('choice-result--incorrect');
  });
});
