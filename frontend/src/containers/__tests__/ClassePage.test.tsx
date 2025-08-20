import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';

import { useGetClassesQuery } from '@/services/classe.service';

import { ClassePage } from '../ClassePage';

jest.mock('@/components/sections/ClasseListSection', () => ({
  ClasseListSection: ({ classes, isLoading }: any) => (
    <div
      data-testid="classe-list-section"
      data-loading={isLoading}
      data-classes-count={classes.length}
    >
      Classe List Section
    </div>
  ),
}));

jest.mock('@/components/sections/CreateClasseSection', () => ({
  CreateClasseSection: () => <div data-testid="create-classe-section">Create Classe Section</div>,
}));

jest.mock('@/services/classe.service', () => ({
  useGetClassesQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ClassePage', () => {
  const mockUseGetClassesQuery = useGetClassesQuery as jest.MockedFunction<
    typeof useGetClassesQuery
  >;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'Teacher' } },
      status: 'authenticated',
    } as any);
  });

  it('should render with loading state', () => {
    mockUseGetClassesQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<ClassePage />);

    expect(screen.getByText('classe.title')).toBeInTheDocument();
    expect(screen.getByText('classe.description')).toBeInTheDocument();
    expect(screen.getByTestId('create-classe-section')).toBeInTheDocument();
    expect(screen.getByTestId('classe-list-section')).toBeInTheDocument();
    expect(screen.getByTestId('classe-list-section')).toHaveAttribute('data-loading', 'true');
  });

  it('should render with session loading state', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' } as any);
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

    expect(screen.getByTestId('classe-page')).toBeInTheDocument();
  });

  it('should redirect when user is not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

    // Should not render anything when redirecting
    expect(screen.queryByText('classe.title')).not.toBeInTheDocument();
  });

  it('should redirect when user is not a teacher', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'Student' } },
      status: 'authenticated',
    } as any);
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

    // Should not render anything when redirecting
    expect(screen.queryByText('classe.title')).not.toBeInTheDocument();
  });

  it('should render with empty classes list', () => {
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

    expect(screen.getByTestId('classe-list-section')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByTestId('classe-list-section')).toHaveAttribute('data-classes-count', '0');
  });

  it('should render with classes data', () => {
    const mockClasses = [
      { id: '1', name: 'Class 1', code: 'ABC123', students: [], teachers: [] },
      { id: '2', name: 'Class 2', code: 'DEF456', students: [], teachers: [] },
    ];
    mockUseGetClassesQuery.mockReturnValue({ data: mockClasses, isLoading: false } as any);

    render(<ClassePage />);

    expect(screen.getByTestId('classe-list-section')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByTestId('classe-list-section')).toHaveAttribute('data-classes-count', '2');
  });
});
