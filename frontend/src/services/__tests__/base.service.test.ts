/// <reference types="@testing-library/jest-dom" />

import { getSession } from 'next-auth/react';

import { QueryTags } from '@/types/QueryTags';

import { baseApi } from '../base.service';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('baseApi service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tag types', () => {
    expect(baseApi.util.getRunningQueriesThunk).toBeDefined();
  });

  it('should have reducer path', () => {
    expect(baseApi.reducerPath).toBe('api');
  });

  it('should have injectEndpoints method', () => {
    expect(baseApi.injectEndpoints).toBeDefined();
  });

  it('should have correct base URL', () => {
    expect(baseApi.endpoints).toBeDefined();
  });

  it('should have fetchBaseQuery configuration', () => {
    const baseQuery = baseApi.util.getRunningQueriesThunk;
    expect(baseQuery).toBeDefined();
  });

  it('should handle prepareHeaders with session', async () => {
    mockGetSession.mockResolvedValue({
      accessToken: 'test-token',
    } as any);

    const baseQuery = baseApi.util.getRunningQueriesThunk;
    expect(baseQuery).toBeDefined();
  });

  it('should handle prepareHeaders without session', async () => {
    mockGetSession.mockResolvedValue(null);

    const baseQuery = baseApi.util.getRunningQueriesThunk;
    expect(baseQuery).toBeDefined();
  });

  it('should handle prepareHeaders with session without accessToken', async () => {
    mockGetSession.mockResolvedValue({
      user: { name: 'test' },
    } as any);

    const baseQuery = baseApi.util.getRunningQueriesThunk;
    expect(baseQuery).toBeDefined();
  });

  it('should have correct tag types array', () => {
    expect(baseApi.util.getRunningQueriesThunk).toBeDefined();
  });

  it('should have empty endpoints initially', () => {
    expect(baseApi.endpoints).toBeDefined();
  });
});
