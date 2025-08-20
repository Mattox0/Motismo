import { render, screen } from '@testing-library/react';

import ClassPage from '../page';

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'Teacher' } },
    status: 'authenticated',
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/containers/ClassePage', () => ({
  ClassePage: () => <div data-testid="classe-page">Classe Page</div>,
}));

jest.mock('@/containers/StudentClassePage', () => ({
  StudentClassePage: () => <div data-testid="student-classe-page">Student Classe Page</div>,
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
