import { render, screen } from '@testing-library/react';
import React from 'react';

import { GameProvider } from '../GameProvider';

const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe('GameProvider', () => {
  it('renders children without crashing', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});
