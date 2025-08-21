import { render, screen } from '@testing-library/react';
import React from 'react';

import { useGame } from '@/providers/GameProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';

import { GamePlayer } from '../GamePlayer';

jest.mock('@/providers/GameProvider');
jest.mock('@/components/game/Lobby');
jest.mock('@/components/game/QuestionChoicePlayer');
jest.mock('@/components/game/AnswerResults');
jest.mock('@/components/game/Ranking');
jest.mock('@/components/game/GameFinished');
jest.mock('@/components/SplashScreen');

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;

const mockQuizz: IQuizz = {
  id: '1',
  title: 'Test Quiz',
  image: 'test.jpg',
  classes: [],
  questions: [
    { id: '1', order: 1, text: 'Question 1' } as IQuestion,
    { id: '2', order: 2, text: 'Question 2' } as IQuestion,
  ],
};

const mockCurrentQuestion: IQuestion = {
  id: '1',
  order: 1,
  text: 'Test Question',
  type: 'CHOICE',
  choices: [],
  quizz: mockQuizz,
};

const mockAnswerStatistics = {
  questionId: '1',
  answers: [],
};

const mockRankingStatistics = {
  players: [],
};

describe('GamePlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Lobby when game status is NOT_STARTED', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.NOT_STARTED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/game/Lobby').Lobby).toHaveBeenCalledWith(
      { quizz: mockQuizz, code: 'TEST123' },
      undefined
    );
  });

  it('renders QuestionChoicePlayer when game status is DISPLAY_QUESTION', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_QUESTION,
      currentQuestion: mockCurrentQuestion,
      timeLeft: 30,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(
      require('@/components/game/QuestionChoicePlayer').QuestionChoicePlayer
    ).toHaveBeenCalledWith(
      {
        question: mockCurrentQuestion,
        timeLeft: 30,
        totalQuestions: 2,
        currentQuestionNumber: 1,
      },
      undefined
    );
  });

  it('renders AnswerResults when game status is DISPLAY_ANSWERS', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_ANSWERS,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: mockAnswerStatistics,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/game/AnswerResults').AnswerResults).toHaveBeenCalledWith(
      { statistics: mockAnswerStatistics },
      undefined
    );
  });

  it('renders Ranking when game status is DISPLAY_RANKING', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_RANKING,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: mockRankingStatistics,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/game/Ranking').Ranking).toHaveBeenCalledWith(
      { statistics: mockRankingStatistics },
      undefined
    );
  });

  it('renders GameFinished when game status is FINISHED', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.FINISHED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: mockRankingStatistics,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/game/GameFinished').GameFinished).toHaveBeenCalledWith(
      { statistics: mockRankingStatistics },
      undefined
    );
  });

  it('renders SplashScreen for unknown status', () => {
    mockUseGame.mockReturnValue({
      status: 'UNKNOWN' as IGameStatus,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('renders SplashScreen when DISPLAY_QUESTION but no currentQuestion', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_QUESTION,
      currentQuestion: null,
      timeLeft: 30,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('renders SplashScreen when DISPLAY_ANSWERS but no answerStatistics', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_ANSWERS,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('renders SplashScreen when DISPLAY_RANKING but no rankingStatistics', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_RANKING,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('renders SplashScreen when FINISHED but no rankingStatistics', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.FINISHED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
    } as any);

    render(<GamePlayer quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });
});
