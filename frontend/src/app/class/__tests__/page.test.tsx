import { render, screen } from '@testing-library/react';

import ClassPage from '../page';

jest.mock('@/containers/ClassePage', () => ({
  ClassePage: () => <div data-testid="classe-page">Classe Page</div>,
}));

jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="global-layout">{children}</div>
  ),
}));

describe('ClassPage', () => {
  it('should render with GlobalLayout and ClassePage', () => {
    render(<ClassPage />);

    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
    expect(screen.getByTestId('classe-page')).toBeInTheDocument();
  });
});
