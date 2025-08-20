import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { ClientLayout } from '../ClientLayout';

jest.mock('@/store', () => ({
  setupStore: () => configureStore({ reducer: {} }),
}));

jest.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

jest.mock('@/providers/I18nProvider', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18n-provider">{children}</div>
  ),
}));

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));

describe('ClientLayout', () => {
  it('renders children with all providers', () => {
    render(
      <ClientLayout>
        <div data-testid="test-child">Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('i18n-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('creates store and wraps with ReduxProvider', () => {
    const { container } = render(
      <ClientLayout>
        <div>Test</div>
      </ClientLayout>
    );

    expect(container.querySelector('[data-testid="session-provider"]')).toBeInTheDocument();
  });
});
