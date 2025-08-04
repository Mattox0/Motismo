import { render, screen } from '@testing-library/react';

import { SessionProvider } from '../SessionProvider';

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div
      data-testid="session-provider"
      data-refetch-interval="0"
      data-refetch-on-window-focus="false"
    >
      {children}
    </div>
  ),
}));

describe('SessionProvider', () => {
  it('should render children inside session provider', () => {
    render(
      <SessionProvider>
        <div data-testid="test-child">Test Content</div>
      </SessionProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render session provider wrapper', () => {
    render(
      <SessionProvider>
        <div>Test Content</div>
      </SessionProvider>
    );

    const provider = screen.getByTestId('session-provider');
    expect(provider).toBeInTheDocument();
  });

  it('should have correct refetch configuration', () => {
    render(
      <SessionProvider>
        <div>Test Content</div>
      </SessionProvider>
    );

    const provider = screen.getByTestId('session-provider');
    expect(provider).toHaveAttribute('data-refetch-interval', '0');
    expect(provider).toHaveAttribute('data-refetch-on-window-focus', 'false');
  });

  it('should render multiple children correctly', () => {
    render(
      <SessionProvider>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </SessionProvider>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
});
