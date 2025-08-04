import { fireEvent, render, screen } from '@testing-library/react';

import { IRankingStatistics } from '@/types/model/IRanking';

import { RankingContainer } from '../RankingContainer';

jest.mock('@/components/game/Ranking', () => ({
  Ranking: ({ statistics }: { statistics: IRankingStatistics }) => (
    <div data-testid="ranking" data-statistics={JSON.stringify(statistics)}>
      Ranking
    </div>
  ),
}));

describe('RankingContainer', () => {
  const mockStatistics: IRankingStatistics = {
    gameId: '1',
    totalPlayers: 3,
    ranking: [
      {
        id: '1',
        name: 'User 1',
        points: 100,
        rank: 1,
        avatar: 'avatar1',
        isAuthor: false,
        isFastest: false,
      },
      {
        id: '2',
        name: 'User 2',
        points: 80,
        rank: 2,
        avatar: 'avatar2',
        isAuthor: false,
        isFastest: false,
      },
      {
        id: '3',
        name: 'User 3',
        points: 60,
        rank: 3,
        avatar: 'avatar3',
        isAuthor: false,
        isFastest: false,
      },
    ],
  };

  const mockHandleClick = jest.fn();

  const renderComponent = () => {
    return render(<RankingContainer statistics={mockStatistics} handleClick={mockHandleClick} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ranking component', () => {
    renderComponent();

    expect(screen.getByTestId('ranking')).toBeInTheDocument();
  });

  it('should pass statistics to Ranking component', () => {
    renderComponent();

    const ranking = screen.getByTestId('ranking');
    expect(ranking).toHaveAttribute('data-statistics', JSON.stringify(mockStatistics));
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

    const container = document.querySelector('.ranking-container');
    const nextButton = document.querySelector('.next-button');
    const nextButtonCircle = document.querySelector('.next-button__circle');
    const nextButtonIcon = document.querySelector('.next-button__icon');

    expect(container).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(nextButtonCircle).toBeInTheDocument();
    expect(nextButtonIcon).toBeInTheDocument();
  });
});
