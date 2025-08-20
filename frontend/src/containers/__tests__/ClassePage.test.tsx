import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';

import {
  useGetClassesQuery,
  useUpdateClasseMutation,
  useDeleteClasseMutation,
} from '@/services/classe.service';

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
  useUpdateClasseMutation: jest.fn(),
  useDeleteClasseMutation: jest.fn(),
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

jest.mock('@/utils/toast', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ClassePage', () => {
  const mockUseGetClassesQuery = useGetClassesQuery as jest.MockedFunction<
    typeof useGetClassesQuery
  >;
  const mockUseUpdateClasseMutation = useUpdateClasseMutation as jest.MockedFunction<
    typeof useUpdateClasseMutation
  >;
  const mockUseDeleteClasseMutation = useDeleteClasseMutation as jest.MockedFunction<
    typeof useDeleteClasseMutation
  >;
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'Teacher' } },
      status: 'authenticated',
    } as any);
    mockUseUpdateClasseMutation.mockReturnValue([jest.fn(), {}] as any);
    mockUseDeleteClasseMutation.mockReturnValue([jest.fn(), {}] as any);
  });

  it('should redirect when user is not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

    expect(screen.queryByText('classe.title')).not.toBeInTheDocument();
  });

  it('should redirect when user is not a teacher', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', role: 'Student' } },
      status: 'authenticated',
    } as any);
    mockUseGetClassesQuery.mockReturnValue({ data: [], isLoading: false } as any);

    render(<ClassePage />);

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
