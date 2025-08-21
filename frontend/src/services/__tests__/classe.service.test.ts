import { QueryTags } from '@/types/QueryTags';

import { baseApi } from '../base.service';
import { classeApi } from '../classe.service';

jest.mock('../base.service', () => ({
  baseApi: {
    injectEndpoints: jest.fn(config => {
      const endpoints = config.endpoints({
        query: jest.fn(fn => ({ type: 'query', queryFn: fn })),
        mutation: jest.fn(fn => ({ type: 'mutation', mutationFn: fn })),
      });
      return {
        endpoints,
        useGetClassesQuery: jest.fn(),
        useGetClasseByCodeQuery: jest.fn(),
        useGetMyClassQuery: jest.fn(),
        useCreateClasseMutation: jest.fn(),
        useUpdateClasseMutation: jest.fn(),
        useDeleteClasseMutation: jest.fn(),
        useJoinClasseByCodeMutation: jest.fn(),
        useLeaveClassMutation: jest.fn(),
        useRemoveStudentFromClassMutation: jest.fn(),
      };
    }),
  },
}));

describe('classeApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export all required hooks', () => {
    const {
      useGetClassesQuery,
      useGetClasseByCodeQuery,
      useGetMyClassQuery,
      useCreateClasseMutation,
      useUpdateClasseMutation,
      useDeleteClasseMutation,
      useJoinClasseByCodeMutation,
      useLeaveClassMutation,
      useRemoveStudentFromClassMutation,
    } = require('../classe.service');

    expect(useGetClassesQuery).toBeDefined();
    expect(useGetClasseByCodeQuery).toBeDefined();
    expect(useGetMyClassQuery).toBeDefined();
    expect(useCreateClasseMutation).toBeDefined();
    expect(useUpdateClasseMutation).toBeDefined();
    expect(useDeleteClasseMutation).toBeDefined();
    expect(useJoinClasseByCodeMutation).toBeDefined();
    expect(useLeaveClassMutation).toBeDefined();
    expect(useRemoveStudentFromClassMutation).toBeDefined();
  });
});
