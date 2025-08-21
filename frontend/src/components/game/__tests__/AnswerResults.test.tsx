import { render, screen } from '@testing-library/react';

import { GameProvider } from '@/providers/GameProvider';
import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';

import { AnswerResults } from '../AnswerResults';

jest.mock('@/providers/GameProvider', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useGame: () => ({
    game: { id: '1', code: 'TEST123' },
    players: [],
    currentQuestion: null,
    gameStatus: 'waiting',
  }),
}));

describe('AnswerResults', () => {
  const mockStatistics: IAnswerStatistics = {
    questionId: '1',
    questionTitle: 'Test Question',
    totalResponses: 5,
    choices: [
      {
        choiceId: '1',
        choiceText: 'Choice 1',
        count: 3,
        percentage: 60,
        isCorrect: true,
        users: [],
      },
      {
        choiceId: '2',
        choiceText: 'Choice 2',
        count: 2,
        percentage: 40,
        isCorrect: false,
        users: [],
      },
    ],
  };

  it('should render question title', () => {
    render(
      <GameProvider>
        <AnswerResults statistics={mockStatistics} />
      </GameProvider>
    );

    expect(screen.getByText('Test Question')).toBeInTheDocument();
  });

  it('should render total responses count', () => {
    render(
      <GameProvider>
        <AnswerResults statistics={mockStatistics} />
      </GameProvider>
    );

    expect(screen.getByText('5 réponses')).toBeInTheDocument();
  });

  it('should render singular form for one response', () => {
    const singleResponseStats = {
      ...mockStatistics,
      totalResponses: 1,
    };

    render(
      <GameProvider>
        <AnswerResults statistics={singleResponseStats} />
      </GameProvider>
    );

    expect(screen.getByText('1 réponses')).toBeInTheDocument();
  });

  it('should render all choices', () => {
    render(
      <GameProvider>
        <AnswerResults statistics={mockStatistics} />
      </GameProvider>
    );

    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });
});
