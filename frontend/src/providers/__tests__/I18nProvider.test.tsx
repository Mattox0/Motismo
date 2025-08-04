import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import i18n from '@/i18n';

import { I18nProvider } from '../I18nProvider';

jest.mock('@/i18n', () => ({
  isInitialized: false,
  init: jest.fn(() => Promise.resolve()),
}));

const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows splash screen when i18n is not initialized', () => {
    (i18n as any).isInitialized = false;

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  it('initializes i18n when not already initialized', async () => {
    (i18n as any).isInitialized = false;

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(i18n.init).toHaveBeenCalled();
  });

  it('renders children when i18n is already initialized', () => {
    (i18n as any).isInitialized = true;

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});
