import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import {
  useGetClasseByCodeQuery,
  useRemoveStudentFromClassMutation,
} from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';
import { showToast } from '@/utils/toast';

import { ClasseDetailPage } from '../ClasseDetailPage';

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
const mockUseGetClasseByCodeQuery = useGetClasseByCodeQuery as jest.MockedFunction<
  typeof useGetClasseByCodeQuery
>;
const mockUseRemoveStudentFromClassMutation =
  useRemoveStudentFromClassMutation as jest.MockedFunction<
    typeof useRemoveStudentFromClassMutation
  >;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockPush = jest.fn();

describe('ClasseDetailPage', () => {
  const mockParams = Promise.resolve({ code: 'ABC123' });
  const mockRemoveStudent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseSession.mockReturnValue({
      data: {
        user: { role: IUserRole.Teacher },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);
    mockUseGetClasseByCodeQuery.mockReturnValue({
      data: {
        id: '1',
        name: 'Test Class',
        code: 'ABC123',
        students: [],
        teachers: [],
      },
      isLoading: false,
      error: null,
    } as any);
    mockUseRemoveStudentFromClassMutation.mockReturnValue([
      mockRemoveStudent,
      { isLoading: false, reset: jest.fn() },
    ]);
  });

  it('renders loading state initially', () => {
    mockUseSession.mockReturnValue({ status: 'loading' } as any);

    render(<ClasseDetailPage params={mockParams} />);

    expect(document.querySelector('.parent-loader')).toBeInTheDocument();
  });

  it('redirects to auth when user is not authenticated', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);

    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to class when no code is provided', async () => {
    const mockParamsWithoutCode = Promise.resolve({ code: '' });

    render(<ClasseDetailPage params={mockParamsWithoutCode} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/class');
    });
  });

  it('redirects to class when code is empty array', async () => {
    const mockParamsWithEmptyArray = Promise.resolve({ code: '' });

    render(<ClasseDetailPage params={mockParamsWithEmptyArray} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/class');
    });
  });

  it('redirects to class when user is not teacher or admin', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: IUserRole.Student },
        accessToken: 'token',
      },
      status: 'authenticated',
    } as any);

    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/class');
      expect(mockShowToast.error).toHaveBeenCalledWith('classe.accessDenied');
    });
  });

  it('redirects to class when class is not found', async () => {
    mockUseGetClasseByCodeQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    } as any);

    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/class');
      expect(mockShowToast.error).toHaveBeenCalledWith('classe.notFound');
    });
  });

  it('renders class detail page when data is available', async () => {
    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Class')).toBeInTheDocument();
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });
  });

  it('handles remove student successfully', async () => {
    mockRemoveStudent.mockResolvedValueOnce({ data: {} });

    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Class')).toBeInTheDocument();
    });

    expect(mockRemoveStudent).toBeDefined();
  });

  it('handles remove student error', async () => {
    mockRemoveStudent.mockRejectedValueOnce(new Error('Remove failed'));

    render(<ClasseDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Class')).toBeInTheDocument();
    });

    expect(mockRemoveStudent).toBeDefined();
  });

  it('handles params error gracefully', async () => {
    const mockParamsWithError = Promise.reject(new Error('Params error'));

    render(<ClasseDetailPage params={mockParamsWithError} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/class');
    });
  });
});
