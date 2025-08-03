import { render, screen } from '@testing-library/react';
import { GameFinished } from '../GameFinished';
import { IRankingStatistics } from '@/types/model/IRanking';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
  },
}));

jest.mock('@/providers/GameProvider', () => ({
  useGame: () => ({
    myUser: { id: '2', name: 'Test User' },
  }),
}));

describe('GameFinished', () => {
  const mockStatistics: IRankingStatistics = {
    gameId: '1',
    ranking: [
      { id: '1', name: 'Winner', points: 100, rank: 1, avatar: '', isAuthor: false, isFastest: false },
      { id: '2', name: 'Test User', points: 80, rank: 2, avatar: '', isAuthor: false, isFastest: false },
    ],
    totalPlayers: 2,
  };

  it('should render game finished title', () => {
    render(<GameFinished statistics={mockStatistics} />);
    
    expect(screen.getByText('Partie terminée !')).toBeInTheDocument();
  });

  it('should render winner information', () => {
    render(<GameFinished statistics={mockStatistics} />);
    
    expect(screen.getByText('Vainqueur')).toBeInTheDocument();
    expect(screen.getByText('Winner')).toBeInTheDocument();
    expect(screen.getByText('100 points')).toBeInTheDocument();
  });

  it('should render total players', () => {
    render(<GameFinished statistics={mockStatistics} />);
    
    expect(screen.getAllByText('2')).toHaveLength(2);
    expect(screen.getByText('Joueurs')).toBeInTheDocument();
  });

  it('should not render your rank when user is winner', () => {
    const winnerStatistics = {
      gameId: '1',
      ranking: [
        { id: '2', name: 'Test User', points: 100, rank: 1, avatar: '', isAuthor: false, isFastest: false },
        { id: '1', name: 'Loser', points: 80, rank: 2, avatar: '', isAuthor: false, isFastest: false },
      ],
      totalPlayers: 2,
    };
    
    render(<GameFinished statistics={winnerStatistics} />);
    
    expect(screen.queryByText('Votre classement')).not.toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(<GameFinished statistics={mockStatistics} />);
    
    const container = screen.getByText('Partie terminée !').closest('.game-finished');
    expect(container).toHaveClass('game-finished');
  });
}); 