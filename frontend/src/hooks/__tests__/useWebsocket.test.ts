import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';

import { useWebsocket } from '../useWebsocket';
import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';
import { showToast } from '@/utils/toast';

// Mock des dépendances
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
    
    // Mock localStorage
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

  test('should set up socket event listeners', () => {
    renderHook(() => useWebsocket('ABC123'));
    
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.CONNECT, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.JOIN, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.ERROR, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(IWebsocketEvent.STATUS, expect.any(Function));
  });

  test('should handle join event and store user data', () => {
    const mockUser = { id: '1', name: 'Test User' };
    
    renderHook(() => useWebsocket('ABC123'));
    
    // Simuler l'événement JOIN
    const joinHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.JOIN
    )?.[1];
    
    if (joinHandler) {
      joinHandler(mockUser);
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'ABC123',
        JSON.stringify(mockUser)
      );
      expect(mockGameSetters.setMyUser).toHaveBeenCalledWith(mockUser);
    }
  });

  test('should handle error event and show toast', () => {
    renderHook(() => useWebsocket('ABC123'));
    
    // Simuler l'événement ERROR
    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === IWebsocketEvent.ERROR
    )?.[1];
    
    if (errorHandler) {
      errorHandler('Test error message');
      
      expect(showToast.error).toHaveBeenCalledWith('Test error message');
    }
  });

  test('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useWebsocket('ABC123'));
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.CONNECT);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.ERROR);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.STATUS);
    expect(mockSocket.off).toHaveBeenCalledWith(IWebsocketEvent.JOIN);
  });
}); 