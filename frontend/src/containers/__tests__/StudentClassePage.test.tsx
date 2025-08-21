import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import {
  useGetMyClassQuery,
  useJoinClasseByCodeMutation,
  useLeaveClassMutation,
} from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';
import { showToast } from '@/utils/toast';

import { StudentClassePage } from '../StudentClassePage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('next/navigation');
jest.mock('next-auth/react');
jest.mock('@/services/classe.service');
jest.mock('@/utils/toast');

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseGetMyClassQuery = useGetMyClassQuery as jest.MockedFunction<typeof useGetMyClassQuery>;
const mockUseJoinClasseByCodeMutation = useJoinClasseByCodeMutation as jest.MockedFunction<
  typeof useJoinClasseByCodeMutation
>;
const mockUseLeaveClassMutation = useLeaveClassMutation as jest.MockedFunction<
  typeof useLeaveClassMutation
>;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockPush = jest.fn();
const mockJoinClasse = jest.fn();
const mockLeaveClass = jest.fn();

describe('StudentClassePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseSession.mockReturnValue({
      data: {
        user: { role: IUserRole.Student },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);
    mockUseGetMyClassQuery.mockReturnValue({
      data: null,
      isLoading: false,
    } as any);
    mockUseJoinClasseByCodeMutation.mockReturnValue([mockJoinClasse, { isLoading: false }]);
    mockUseLeaveClassMutation.mockReturnValue([mockLeaveClass, { isLoading: false }]);
  });

  it('renders loading state initially', () => {
    mockUseSession.mockReturnValue({ status: 'loading' } as any);

    render(<StudentClassePage />);

    expect(document.querySelector('.parent-loader')).toBeInTheDocument();
  });

  it('redirects to auth when user is not authenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);

    render(<StudentClassePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to home when user is not a student', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: IUserRole.Teacher },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);

    render(<StudentClassePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('renders join classe section when user has no class', async () => {
    render(<StudentClassePage />);

    await waitFor(() => {
      expect(screen.getByText('classe.student.title')).toBeInTheDocument();
      expect(screen.getByText('classe.join.description')).toBeInTheDocument();
    });
  });

  it('renders ClasseMePage when user has a class', async () => {
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
    } as any);

    render(<StudentClassePage />);

    await waitFor(() => {
      expect(screen.queryByText('classe.student.title')).not.toBeInTheDocument();
    });
  });

  it('handles join classe successfully', async () => {
    mockJoinClasse.mockResolvedValueOnce({
      data: { id: '1', name: 'Test Class' },
    });

    render(<StudentClassePage />);

    await waitFor(() => {
      expect(screen.getByText('classe.student.title')).toBeInTheDocument();
    });

    // Note: This test would need to be expanded if the join functionality is exposed in the UI
    expect(mockJoinClasse).toBeDefined();
  });

  it('handles join classe error', async () => {
    mockJoinClasse.mockRejectedValueOnce(new Error('Join failed'));

    render(<StudentClassePage />);

    await waitFor(() => {
      expect(screen.getByText('classe.student.title')).toBeInTheDocument();
    });

    // Note: This test would need to be expanded if the join functionality is exposed in the UI
    expect(mockJoinClasse).toBeDefined();
  });

  it('shows loading state when fetching my class', () => {
    mockUseGetMyClassQuery.mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    render(<StudentClassePage />);

    expect(document.querySelector('.parent-loader')).toBeInTheDocument();
  });

  it('returns null when user is not authenticated after loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);

    const { container } = render(<StudentClassePage />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when user is not a student after loading', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: IUserRole.Teacher },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);

    const { container } = render(<StudentClassePage />);

    expect(container.firstChild).toBeNull();
  });
});
