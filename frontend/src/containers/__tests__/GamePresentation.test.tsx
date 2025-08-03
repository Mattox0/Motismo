import { render, screen } from '@testing-library/react';

import { GameProvider } from '@/providers/GameProvider';

import { GamePresentation } from '../GamePresentation';

describe('GamePresentation', () => {
  it('renders without crashing', () => {
    render(
      <GameProvider>
        <GamePresentation />
      </GameProvider>
    );
    expect(true).toBe(true);
  });
}); 