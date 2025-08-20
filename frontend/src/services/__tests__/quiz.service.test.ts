import {
  quizApi,
  useGetQuizQuery,
  useCreateQuizzMutation,
  useGetOneQuizQuery,
  useGetQuizByCodeQuery,
  useCreateGameMutation,
} from '../quiz.service';

describe('quizApi', () => {
  it('should have getQuiz query', () => {
    expect(quizApi.endpoints.getQuiz).toBeDefined();
  });

  it('should have createQuizz mutation', () => {
    expect(quizApi.endpoints.createQuizz).toBeDefined();
  });

  it('should have getOneQuiz query', () => {
    expect(quizApi.endpoints.getOneQuiz).toBeDefined();
  });

  it('should have getQuizByCode query', () => {
    expect(quizApi.endpoints.getQuizByCode).toBeDefined();
  });

  it('should have createGame mutation', () => {
    expect(quizApi.endpoints.createGame).toBeDefined();
  });

  it('should have correct query configuration for getQuiz', () => {
    const endpoint = quizApi.endpoints.getQuiz;
    expect(endpoint).toBeDefined();

    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn();
      expect(result).toBe('/quizz');
    }
  });

  it('should have correct query configuration for createQuizz', () => {
    const endpoint = quizApi.endpoints.createQuizz;
    expect(endpoint).toBeDefined();

    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const formData = new FormData();
      const result = queryFn(formData);
      expect(result).toEqual({
        url: '/quizz',
        method: 'POST',
        body: formData,
      });
    }
  });

  it('should have correct query configuration for getOneQuiz', () => {
    const endpoint = quizApi.endpoints.getOneQuiz;
    expect(endpoint).toBeDefined();

    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn('test-id');
      expect(result).toBe('/quizz/test-id');
    }
  });

  it('should have correct query configuration for getQuizByCode', () => {
    const endpoint = quizApi.endpoints.getQuizByCode;
    expect(endpoint).toBeDefined();

    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn('test-code');
      expect(result).toBe('/quizz/code/test-code');
    }
  });

  it('should have correct query configuration for createGame', () => {
    const endpoint = quizApi.endpoints.createGame;
    expect(endpoint).toBeDefined();

    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn('test-id');
      expect(result).toEqual({
        url: '/quizz/test-id/game',
        method: 'POST',
      });
    }
  });

  it('should provide quiz tags for getQuiz', () => {
    const getQuizEndpoint = quizApi.endpoints.getQuiz;
    expect(getQuizEndpoint).toBeDefined();

    if (getQuizEndpoint.providesTags) {
      const providedTags = getQuizEndpoint.providesTags({} as any, {} as any, {} as any);
      expect(providedTags).toEqual(['QUIZ']);
    }
  });

  it('should provide quiz tags for getOneQuiz', () => {
    const getOneQuizEndpoint = quizApi.endpoints.getOneQuiz;
    expect(getOneQuizEndpoint).toBeDefined();

    if (getOneQuizEndpoint.providesTags) {
      const providedTags = getOneQuizEndpoint.providesTags({} as any, {} as any, {} as any);
      expect(providedTags).toEqual(['QUIZ']);
    }
  });

  it('should provide quiz tags for getQuizByCode', () => {
    const getQuizByCodeEndpoint = quizApi.endpoints.getQuizByCode;
    expect(getQuizByCodeEndpoint).toBeDefined();

    if (getQuizByCodeEndpoint.providesTags) {
      const providedTags = getQuizByCodeEndpoint.providesTags({} as any, {} as any, {} as any);
      expect(providedTags).toEqual(['QUIZ']);
    }
  });

  it('should invalidate quiz tags for createQuizz', () => {
    const createQuizzEndpoint = quizApi.endpoints.createQuizz;
    expect(createQuizzEndpoint).toBeDefined();

    if (createQuizzEndpoint.invalidatesTags) {
      const invalidatedTags = createQuizzEndpoint.invalidatesTags({} as any, {} as any, {} as any);
      expect(invalidatedTags).toEqual(['QUIZ']);
    }
  });

  it('should export useGetQuizQuery hook', () => {
    expect(useGetQuizQuery).toBeDefined();
  });

  it('should export useCreateQuizzMutation hook', () => {
    expect(useCreateQuizzMutation).toBeDefined();
  });

  it('should export useGetOneQuizQuery hook', () => {
    expect(useGetOneQuizQuery).toBeDefined();
  });

  it('should export useGetQuizByCodeQuery hook', () => {
    expect(useGetQuizByCodeQuery).toBeDefined();
  });

  it('should export useCreateGameMutation hook', () => {
    expect(useCreateGameMutation).toBeDefined();
  });
});
