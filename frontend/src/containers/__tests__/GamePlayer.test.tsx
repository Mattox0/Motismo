import { render, screen } from '@testing-library/react';

import { GameProvider } from '@/providers/GameProvider';

import { GamePlayer } from '../GamePlayer';

describe('GamePlayer', () => {
  it('renders without crashing', () => {
    render(
      <GameProvider>
        <GamePlayer />
      </GameProvider>
    );
    expect(true).toBe(true);
  });
}); 