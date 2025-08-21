import { QueryTags } from '@/types/QueryTags';

import { baseApi } from '../base.service';
import { quizApi } from '../quiz.service';

jest.mock('../base.service', () => ({
  baseApi: {
    injectEndpoints: jest.fn(config => {
      const mockBuilder = {
        query: jest.fn(fn => ({ type: 'query', queryFn: fn })),
        mutation: jest.fn(fn => ({ type: 'mutation', mutationFn: fn })),
      };
      const endpoints = config.endpoints(mockBuilder);
      return {
        endpoints,
        useGetQuizQuery: jest.fn(),
        useCreateQuizzMutation: jest.fn(),
        useUpdateQuizzMutation: jest.fn(),
        useGetOneQuizQuery: jest.fn(),
        useGetQuizByCodeQuery: jest.fn(),
        useCreateGameMutation: jest.fn(),
      };
    }),
  },
}));

describe('quizApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export all required hooks', () => {
    const {
      useGetQuizQuery,
      useCreateQuizzMutation,
      useUpdateQuizzMutation,
      useGetOneQuizQuery,
      useGetQuizByCodeQuery,
      useCreateGameMutation,
    } = require('../quiz.service');

    expect(useGetQuizQuery).toBeDefined();
    expect(useCreateQuizzMutation).toBeDefined();
    expect(useUpdateQuizzMutation).toBeDefined();
    expect(useGetOneQuizQuery).toBeDefined();
    expect(useGetQuizByCodeQuery).toBeDefined();
    expect(useCreateGameMutation).toBeDefined();
  });
});
