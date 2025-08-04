// src/app/game/[code]/page.test.tsx
import { render, screen } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import { useGetQuizByCodeQuery } from '@/services/quiz.service';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

jest.mock('@/services/quiz.service', () => ({
  __esModule: true,
  useGetQuizByCodeQuery: jest.fn(),
}));

// ESM mocks for all rendered components/providers
jest.mock('@/components/PlayerAccess', () => ({
  __esModule: true,
  PlayerAccess: () => <div data-testid="player-access" />,
}));
jest.mock('@/components/SplashScreen', () => ({
  __esModule: true,
  SplashScreen: () => <div data-testid="splash-screen" />,
}));
jest.mock('@/containers/GamePage', () => ({
  __esModule: true,
  GamePage: ({ code, quizz }: any) => <div data-testid="game-page">{`${code}:${quizz.id}`}</div>,
}));
jest.mock('@/providers/GameProvider', () => ({
  __esModule: true,
  GameProvider: ({ children }: any) => <div data-testid="game-provider">{children}</div>,
}));
jest.mock('@/providers/SocketProvider', () => ({
  __esModule: true,
  SocketProvider: ({ children }: any) => <div data-testid="socket-provider">{children}</div>,
}));

// Import after mocks
import GamePageWrapper, { IPlayerData } from '../page';

// Type assertion to fix JSX component error
const GamePageWrapperComponent = GamePageWrapper as React.ComponentType<any>;

describe('GamePageWrapper', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockUseGetQuiz = useGetQuizByCodeQuery as jest.MockedFunction<typeof useGetQuizByCodeQuery>;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
  });

  it('redirects to "/" when no code provided', () => {
    mockUseParams.mockReturnValue({ code: undefined });
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetQuiz.mockReturnValue({ data: null, isLoading: false, error: null } as any);
    render(<GamePageWrapperComponent />);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('redirects to "/" when code is empty array', () => {
    mockUseParams.mockReturnValue({ code: [] });
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetQuiz.mockReturnValue({ data: null, isLoading: false, error: null } as any);
    render(<GamePageWrapperComponent />);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows splash while quiz is loading', () => {
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetQuiz.mockReturnValue({ data: null, isLoading: true, error: null } as any);
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  it('shows splash if quiz not found (data=null & !isLoading)', () => {
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetQuiz.mockReturnValue({ data: null, isLoading: false, error: null } as any);
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  it('renders PlayerAccess when quiz exists but no player', () => {
    const quiz = { id: 'q1', author: { id: 'author1' } };
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({ data: quiz, isLoading: false, error: null } as any);
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('player-access')).toBeInTheDocument();
  });

  it('loads non-author player from localStorage', () => {
    const quiz = { id: 'q1', author: { id: 'author1' } };
    const stored: IPlayerData = { id: 'p1', avatar: 'img', name: 'Name' };
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({ data: quiz, isLoading: false, error: null } as any);
    mockUseSession.mockReturnValue({
      data: { user: { id: 'other', name: 'X' } },
      status: 'authenticated',
    } as any);
    window.localStorage.getItem = jest.fn(() => JSON.stringify(stored));
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('socket-provider')).toBeInTheDocument();
    expect(screen.getByTestId('game-provider')).toBeInTheDocument();
    expect(screen.getByTestId('game-page')).toHaveTextContent('abc:q1');
  });

  it('creates author player when no localStorage', () => {
    const quiz = { id: 'q1', author: { id: 'auth1' } };
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({ data: quiz, isLoading: false, error: null } as any);
    mockUseSession.mockReturnValue({
      data: { user: { id: 'auth1', name: 'Auth' } },
      status: 'authenticated',
    } as any);
    window.localStorage.getItem = jest.fn(() => null);
    render(<GamePageWrapperComponent />);
    // author should be treated as player
    expect(screen.getByTestId('socket-provider')).toBeInTheDocument();
    expect(screen.getByTestId('game-page')).toHaveTextContent('abc:q1');
  });

  it('handles invalid JSON in localStorage', () => {
    const quiz = { id: 'q1', author: { id: 'author1' } };
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({ data: quiz, isLoading: false, error: null } as any);
    mockUseSession.mockReturnValue({ data: null, status: 'authenticated' } as any);
    window.localStorage.getItem = jest.fn(() => 'not-json');
    window.localStorage.removeItem = jest.fn();
    render(<GamePageWrapperComponent />);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('abc');
    expect(screen.getByTestId('player-access')).toBeInTheDocument();
  });

  it('continues to PlayerAccess while session is loading', () => {
    const quiz = { id: 'q1', author: { id: 'author1' } };
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({ data: quiz, isLoading: false, error: null } as any);
    mockUseSession.mockReturnValue({ data: null, status: 'loading' } as any);
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('player-access')).toBeInTheDocument();
  });

  it('handles quiz query error by showing splash', () => {
    mockUseParams.mockReturnValue({ code: 'abc' });
    mockUseGetQuiz.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'fail' },
    } as any);
    render(<GamePageWrapperComponent />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });
});
