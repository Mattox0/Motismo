import { render, screen } from '@testing-library/react';
import React from 'react';

import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';

import { GamePresentation } from '../GamePresentation';

jest.mock('@/providers/GameProvider');
jest.mock('@/providers/SocketProvider');
jest.mock('@/components/game/Lobby');
jest.mock('@/components/game/QuestionChoicePresentation');
jest.mock('@/containers/AnswerResultsContainer');
jest.mock('@/containers/RankingContainer');
jest.mock('@/components/game/GameFinished');
jest.mock('@/components/SplashScreen');

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

const mockSocket = {
  emit: jest.fn(),
};

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

describe('GamePresentation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue(mockSocket as any);
  });

  it('renders Lobby when game status is NOT_STARTED', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.NOT_STARTED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/game/Lobby').Lobby).toHaveBeenCalledWith(
      {
        quizz: mockQuizz,
        code: 'TEST123',
        presentation: true,
        handleClick: expect.any(Function),
      },
      undefined
    );
  });

  it('calls socket.emit START when startGame is called', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.NOT_STARTED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    const lobbyProps = require('@/components/game/Lobby').Lobby.mock.calls[0][0];
    lobbyProps.handleClick();

    expect(mockSocket.emit).toHaveBeenCalledWith(IWebsocketEvent.START);
  });

  it('renders QuestionChoicePresentation when game status is DISPLAY_QUESTION', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_QUESTION,
      currentQuestion: mockCurrentQuestion,
      timeLeft: 30,
      answerStatistics: null,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(
      require('@/components/game/QuestionChoicePresentation').QuestionChoicePresentation
    ).toHaveBeenCalledWith(
      {
        question: mockCurrentQuestion,
        timeLeft: 30,
        totalQuestions: 2,
        currentQuestionNumber: 1,
        isTimerFinished: false,
      },
      undefined
    );
  });

  it('renders AnswerResultsContainer when game status is DISPLAY_ANSWERS', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_ANSWERS,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: mockAnswerStatistics,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(
      require('@/containers/AnswerResultsContainer').AnswerResultsContainer
    ).toHaveBeenCalledWith(
      {
        statistics: mockAnswerStatistics,
        handleClick: expect.any(Function),
      },
      undefined
    );
  });

  it('calls socket.emit DISPLAY_RANKING when showRanking is called', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_ANSWERS,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: mockAnswerStatistics,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    const containerProps = require('@/containers/AnswerResultsContainer').AnswerResultsContainer
      .mock.calls[0][0];
    containerProps.handleClick();

    expect(mockSocket.emit).toHaveBeenCalledWith(IWebsocketEvent.DISPLAY_RANKING);
  });

  it('renders RankingContainer when game status is DISPLAY_RANKING', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_RANKING,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: mockRankingStatistics,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(require('@/containers/RankingContainer').RankingContainer).toHaveBeenCalledWith(
      {
        statistics: mockRankingStatistics,
        handleClick: expect.any(Function),
      },
      undefined
    );
  });

  it('calls socket.emit NEXT_QUESTION when handleNextQuestion is called', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_RANKING,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: mockRankingStatistics,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    const containerProps = require('@/containers/RankingContainer').RankingContainer.mock
      .calls[0][0];
    containerProps.handleClick();

    expect(mockSocket.emit).toHaveBeenCalledWith(IWebsocketEvent.NEXT_QUESTION);
  });

  it('renders GameFinished when game status is FINISHED', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.FINISHED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: mockRankingStatistics,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

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
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('renders SplashScreen when DISPLAY_QUESTION but no currentQuestion', () => {
    mockUseGame.mockReturnValue({
      status: IGameStatus.DISPLAY_QUESTION,
      currentQuestion: null,
      timeLeft: 30,
      answerStatistics: null,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    expect(require('@/components/SplashScreen').SplashScreen).toHaveBeenCalled();
  });

  it('handles missing socket gracefully', () => {
    mockUseSocket.mockReturnValue(null);
    mockUseGame.mockReturnValue({
      status: IGameStatus.NOT_STARTED,
      currentQuestion: null,
      timeLeft: 0,
      answerStatistics: null,
      rankingStatistics: null,
      timerFinished: false,
    } as any);

    render(<GamePresentation quizz={mockQuizz} code="TEST123" />);

    const lobbyProps = require('@/components/game/Lobby').Lobby.mock.calls[0][0];
    expect(() => lobbyProps.handleClick()).not.toThrow();
  });
});
