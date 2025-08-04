/// <reference types="@testing-library/jest-dom" />

import { baseApi } from '../base.service';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

describe('baseApi service', () => {
  it('should have correct tag types', () => {
    expect(baseApi.util.getRunningQueriesThunk).toBeDefined();
  });

  it('should have reducer path', () => {
    expect(baseApi.reducerPath).toBe('api');
  });

  it('should have injectEndpoints method', () => {
    expect(baseApi.injectEndpoints).toBeDefined();
  });
});
