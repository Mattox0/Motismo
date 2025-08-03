import { render, screen, waitFor } from '@testing-library/react';

import { useGame } from '@/providers/GameProvider';
import { IRankingStatistics } from '@/types/model/IRanking';

import { Ranking } from '../Ranking';

jest.mock('@/providers/GameProvider', () => ({
  useGame: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
    p: ({ children, className, ...props }: any) => <p className={className} {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('Ranking', () => {
  const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;

  const mockStatistics: IRankingStatistics = {
    gameId: '1',
    totalPlayers: 3,
    ranking: [
      { id: '1', name: 'Player 1', avatar: 'avatar1.jpg', rank: 1, points: 100, isFastest: true, isAuthor: false },
      { id: '2', name: 'Player 2', avatar: 'avatar2.jpg', rank: 2, points: 80, isFastest: false, isAuthor: false },
      { id: '3', name: 'Player 3', avatar: 'avatar3.jpg', rank: 3, points: 60, isFastest: false, isAuthor: false },
    ],
  };

  beforeEach(() => {
    mockUseGame.mockReturnValue({
      myUser: { id: '2', name: 'Player 2', avatar: 'avatar2.jpg' },
    } as any);
  });

  it('renders ranking title and player count', async () => {
    render(<Ranking statistics={mockStatistics} />);
    
    await waitFor(() => {
      expect(screen.getByText('Classement')).toBeInTheDocument();
      expect(screen.getByText('3 joueurs')).toBeInTheDocument();
    });
  });

  it('renders all players in ranking', async () => {
    render(<Ranking statistics={mockStatistics} />);
    
    await waitFor(() => {
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();
    });
  });

  it('shows points for each player', async () => {
    render(<Ranking statistics={mockStatistics} />);
    
    await waitFor(() => {
      expect(screen.getByText('100 pts')).toBeInTheDocument();
      expect(screen.getByText('80 pts')).toBeInTheDocument();
      expect(screen.getByText('60 pts')).toBeInTheDocument();
    });
  });
}); 