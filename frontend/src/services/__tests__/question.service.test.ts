jest.mock('@/services/base.service', () => {
  const injectEndpointsMock = jest.fn((config: any) => ({
    endpoints: {}, 
    useGetQuestionsQuery:    jest.fn(),
    useAddQuestionMutation:  jest.fn(),
    useUpdateQuestionMutation: jest.fn(),
    useDeleteQuestionMutation: jest.fn(),
  }));

  return {
    baseApi: {
      injectEndpoints: injectEndpointsMock,
    },
  };
});

import { baseApi } from '@/services/base.service';
import {
  questionApi,
  useGetQuestionsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '../question.service';
import { QueryTags } from '@/types/QueryTags';

describe('question.service endpoints', () => {
  const injectEndpointsMock = (baseApi.injectEndpoints as jest.Mock);
  const builder = {
    query: jest.fn(),
    mutation: jest.fn(),
  };

  it('calls injectEndpoints once with an endpoints function', () => {
    expect(injectEndpointsMock).toHaveBeenCalledTimes(1);
    const passedConfig = injectEndpointsMock.mock.calls[0][0];
    expect(typeof passedConfig.endpoints).toBe('function');
  });

  it('configures getQuestions correctly', () => {
    const endpointsFn = injectEndpointsMock.mock.calls[0][0].endpoints;
    endpointsFn(builder as any);

    expect(builder.query).toHaveBeenCalledWith({
      query: expect.any(Function),
      providesTags: [QueryTags.QUIZ],
    });

    const getCfg = builder.query.mock.calls.find(c => c[0].providesTags)[0];
    expect(getCfg.query('quiz-123')).toBe('quizz/quiz-123/questions');
  });

  it('configures addQuestion mutation correctly', () => {
    const endpointsFn = injectEndpointsMock.mock.calls[0][0].endpoints;
    endpointsFn(builder as any);

    expect(builder.mutation).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.any(Function),
        invalidatesTags: [QueryTags.QUIZ],
      })
    );

    const addCfg = builder.mutation.mock.calls
      .map(c => c[0])
      .find(cfg => cfg.query({ quizzId: 'x', question: new FormData() }).method === 'POST')!;

    const result = (addCfg.query as Function)({ quizzId: 'quiz-123', question: new FormData() });
    expect(result).toMatchObject({
      url: 'quizz/quiz-123/questions',
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('configures updateQuestion mutation correctly', () => {
    const endpointsFn = injectEndpointsMock.mock.calls[0][0].endpoints;
    endpointsFn(builder as any);

    const updCfg = builder.mutation.mock.calls
      .map(c => c[0])
      .find(cfg => cfg.query({ quizzId: 'a', questionId: 'b', question: new FormData() }).method === 'PUT')!;

    const result = (updCfg.query as Function)({
      quizzId: 'quiz-123',
      questionId: 'question-456',
      question: new FormData(),
    });
    expect(result).toMatchObject({
      url: 'quizz/quiz-123/questions/question-456',
      method: 'PUT',
      body: expect.any(FormData),
    });
    expect(updCfg.invalidatesTags).toEqual([QueryTags.QUIZ]);
  });

  it('configures deleteQuestion mutation correctly', () => {
    const endpointsFn = injectEndpointsMock.mock.calls[0][0].endpoints;
    endpointsFn(builder as any);

    const delCfg = builder.mutation.mock.calls
      .map(c => c[0])
      .find(cfg => cfg.query({ quizzId: 'a', questionId: 'b' }).method === 'DELETE')!;

    const result = (delCfg.query as Function)({
      quizzId: 'quiz-123',
      questionId: 'question-456',
    });
    expect(result).toEqual({
      url: 'quizz/quiz-123/questions/question-456',
      method: 'DELETE',
    });
    expect(delCfg.invalidatesTags).toEqual([QueryTags.QUIZ]);
  });

  it('exports all four hook functions', () => {
    expect(useGetQuestionsQuery).toBeDefined();
    expect(useAddQuestionMutation).toBeDefined();
    expect(useUpdateQuestionMutation).toBeDefined();
    expect(useDeleteQuestionMutation).toBeDefined();
  });
});
