import { render, screen } from '@testing-library/react';
import React from 'react';

import RootLayout, { metadata } from '../layout';

jest.mock('@root/assets/styles/global.scss', () => ({}));
jest.mock('@/layout/ClientLayout', () => ({
  ClientLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="client-layout">{children}</div>
  ),
}));
jest.mock('@/utils/fonts', () => ({
  poppins: { variable: 'font-var' },
}));

describe('RootLayout', () => {
  it('exports correct metadata', () => {
    expect(metadata).toEqual({
      title: 'Motismo',
      description: 'Application de quizz interactifs',
    });
  });

  it('renders html with lang="fr" and font variable class, wraps children in ClientLayout and sets body class', () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>
    );

    const htmlEl = document.querySelector('html')!;
    const bodyEl = document.querySelector('body')!;

    expect(htmlEl.getAttribute('lang')).toBe('fr');
    expect(htmlEl.className).toContain('font-var');
    expect(bodyEl.className).toContain('font-poppins');

    expect(screen.getByTestId('client-layout')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });
});
