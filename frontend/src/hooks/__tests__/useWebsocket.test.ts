import { renderHook } from '@testing-library/react';

import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';
import { showToast } from '@/utils/toast';

import { useWebsocket } from '../useWebsocket';

jest.mock('@/providers/GameProvider');
jest.mock('@/providers/SocketProvider');
jest.mock('@/utils/toast');

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe('useWebsocket', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emitWithAck: jest.fn(),
  };

  const mockGameSetters = {
    setMyUser: jest.fn(),
    setUsers: jest.fn(),
    setStatus: jest.fn(),
    setCurrentQuestion: jest.fn(),
    setTimeLeft: jest.fn(),
    setAnswerStatistics: jest.fn(),
    setRankingStatistics: jest.fn(),
    setAnswerCount: jest.fn(),
    setTimerFinished: jest.fn(),
  };

  beforeEach(() => {
    mockUseSocket.mockReturnValue(mockSocket as any);
    mockUseGame.mockReturnValue(mockGameSetters as any);

    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return early if no socket', () => {
    mockUseSocket.mockReturnValue(null);

    renderHook(() => useWebsocket('ABC123'));

    expect(mockSocket.on).not.toHaveBeenCalled();
  });

  test('should set up all socket event listeners', () => {
    renderHook(() => useWebsocket('ABC123'));

    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.CONNECT, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.JOIN, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.ERROR, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.STATUS, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.MEMBERS, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.QUESTION_DATA, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.TIMER, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.RESULTS, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.RANKING, expect.any(Function));
  });

  test('should handle connect event with successful join', async () => {
    mockSocket.emitWithAck.mockResolvedValue({ success: true });

    renderHook(() => useWebsocket('ABC123'));

    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.CONNECT
    )?.[1];

    if (connectHandler) {
      await connectHandler();
      expect(mockSocket.emitWithAck).toHaveBeenCalledWith(IWebsocketEvent.JOIN);
    }
  });

  test('should handle connect event with error response', async () => {
    mockSocket.emitWithAck.mockResolvedValue({ error: 'Join failed' });

    renderHook(() => useWebsocket('ABC123'));

    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.CONNECT
    )?.[1];

    if (connectHandler) {
      await connectHandler();
      expect(showToast.error).toHaveBeenCalledWith('Join failed');
    }
  });

  test('should handle join event and store user data', () => {
    const mockUser = { id: '1', name: 'Test User' };

    renderHook(() => useWebsocket('ABC123'));

    const joinHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.JOIN
    )?.[1];

    if (joinHandler) {
      joinHandler(mockUser);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('ABC123', JSON.stringify(mockUser));
      expect(mockGameSetters.setMyUser).toHaveBeenCalledWith(mockUser);
    }
  });

  test('should handle error event and show toast', () => {
    renderHook(() => useWebsocket('ABC123'));

    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.ERROR
    )?.[1];

    if (errorHandler) {
      errorHandler('Test error message');
      expect(showToast.error).toHaveBeenCalledWith('Test error message');
    }
  });

  test('should handle status event', () => {
    const mockStatus = { status: 'playing' };

    renderHook(() => useWebsocket('ABC123'));

    const statusHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.STATUS
    )?.[1];

    if (statusHandler) {
      statusHandler(mockStatus);
      expect(mockGameSetters.setStatus).toHaveBeenCalledWith(mockStatus);
    }
  });

  test('should handle members event', () => {
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ];

    renderHook(() => useWebsocket('ABC123'));

    const membersHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.MEMBERS
    )?.[1];

    if (membersHandler) {
      membersHandler(mockUsers);
      expect(mockGameSetters.setUsers).toHaveBeenCalledWith(mockUsers);
    }
  });

  test('should handle question data event', () => {
    const mockQuestion = { id: '1', title: 'Test Question' };

    renderHook(() => useWebsocket('ABC123'));

    const questionHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.QUESTION_DATA
    )?.[1];

    if (questionHandler) {
      questionHandler(mockQuestion);
      expect(mockGameSetters.setCurrentQuestion).toHaveBeenCalledWith(mockQuestion);
    }
  });

  test('should handle timer event with all properties', () => {
    const mockTimerData = {
      timeLeft: 30,
      type: 'question',
      finished: false,
      answered: 5,
      total: 10,
      allAnswered: false,
    };

    renderHook(() => useWebsocket('ABC123'));

    const timerHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.TIMER
    )?.[1];

    if (timerHandler) {
      timerHandler(mockTimerData);
      expect(mockGameSetters.setTimeLeft).toHaveBeenCalledWith(30);
      expect(mockGameSetters.setAnswerCount).toHaveBeenCalledWith({ answered: 5, total: 10 });
      expect(mockGameSetters.setTimerFinished).toHaveBeenCalledWith(false);
    }
  });

  test('should handle timer event with minimal properties', () => {
    const mockTimerData = {
      timeLeft: 30,
      type: 'question',
    };

    renderHook(() => useWebsocket('ABC123'));

    const timerHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.TIMER
    )?.[1];

    if (timerHandler) {
      timerHandler(mockTimerData);
      expect(mockGameSetters.setTimeLeft).toHaveBeenCalledWith(30);
      expect(mockGameSetters.setAnswerCount).toHaveBeenCalledWith({ answered: 0, total: 0 });
      expect(mockGameSetters.setTimerFinished).toHaveBeenCalledWith(false);
    }
  });

  test('should handle results event', () => {
    const mockStatistics = { correctAnswers: 5, totalAnswers: 10 };

    renderHook(() => useWebsocket('ABC123'));

    const resultsHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.RESULTS
    )?.[1];

    if (resultsHandler) {
      resultsHandler(mockStatistics);
      expect(mockGameSetters.setAnswerStatistics).toHaveBeenCalledWith(mockStatistics);
    }
  });

  test('should handle ranking event', () => {
    const mockRanking = { rankings: [{ id: '1', score: 100 }] };

    renderHook(() => useWebsocket('ABC123'));

    const rankingHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.RANKING
    )?.[1];

    if (rankingHandler) {
      rankingHandler(mockRanking);
      expect(mockGameSetters.setRankingStatistics).toHaveBeenCalledWith(mockRanking);
    }
  });

  test('should clean up all event listeners on unmount', () => {
    const { unmount } = renderHook(() => useWebsocket('ABC123'));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.CONNECT);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.ERROR);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.STATUS);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.JOIN);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.MEMBERS);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.QUESTION_DATA);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.TIMER);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.RESULTS);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.RANKING);
  });
});
