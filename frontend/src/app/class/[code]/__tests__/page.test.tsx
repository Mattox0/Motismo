import { render, screen } from '@testing-library/react';

import ClassDetailPage from '../page';

jest.mock('@/containers/ClasseDetailPage', () => ({
  ClasseDetailPage: ({ params }: { params: Promise<{ code: string }> }) => (
    <div data-testid="classe-detail-page">Classe Detail Page</div>
  ),
}));

jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="global-layout">{children}</div>
  ),
}));

describe('ClassDetailPage', () => {
  it('should render with GlobalLayout and ClasseDetailPage', () => {
    render(<ClassDetailPage params={Promise.resolve({ code: 'ABC123' })} />);

    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
    expect(screen.getByTestId('classe-detail-page')).toBeInTheDocument();
  });
});





