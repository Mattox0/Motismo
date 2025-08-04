import { render, screen } from '@testing-library/react';
import React from 'react';

import { SocketProvider } from '../SocketProvider';

const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe('SocketProvider', () => {
  it('renders children without crashing', () => {
    const mockPlayer = { id: '1', name: 'Test Player', avatar: 'test.jpg' };

    render(
      <SocketProvider player={mockPlayer}>
        <TestComponent />
      </SocketProvider>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});
