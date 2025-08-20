import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { useGetMyClassQuery, useLeaveClassMutation } from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';

import { ClasseMePage } from '../ClasseMePage';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));
jest.mock('@/services/classe.service', () => ({
  useGetMyClassQuery: jest.fn(),
  useLeaveClassMutation: jest.fn(),
}));
jest.mock('@/components/ClasseHeader', () => ({
  ClasseHeader: ({ classe, onBackClick }: any) => (
    <div data-testid="classe-header">
      <h1>{classe.name}</h1>
      <button onClick={onBackClick}>Back</button>
    </div>
  ),
}));
jest.mock('@/components/StudentsList', () => ({
  StudentsList: ({ students }: any) => (
    <div data-testid="students-list">
      {students.map((student: any) => (
        <div key={student.id}>{student.username}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));
jest.mock('@/components/ErrorState', () => ({
  ErrorState: ({ title, onBackClick }: any) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <button onClick={onBackClick}>Back</button>
    </div>
  ),
}));
jest.mock('@/utils/toast', () => ({
  showToast: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseGetMyClassQuery = useGetMyClassQuery as jest.MockedFunction<typeof useGetMyClassQuery>;
const mockUseLeaveClassMutation = useLeaveClassMutation as jest.MockedFunction<
  typeof useLeaveClassMutation
>;

describe('ClasseMePage', () => {
  const mockPush = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
    });

    mockUseLeaveClassMutation.mockReturnValue([jest.fn(), { isLoading: false }] as any);
  });

  it('should render without crashing', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: IUserRole.Student,
        },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);

    mockUseGetMyClassQuery.mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Test Class',
          code: 'ABC123',
          students: [],
          teachers: [],
        },
      ],
      isLoading: false,
      error: null,
    } as any);

    render(<ClasseMePage />);

    expect(screen.getByText('classe.myClass')).toBeInTheDocument();
  });
});
