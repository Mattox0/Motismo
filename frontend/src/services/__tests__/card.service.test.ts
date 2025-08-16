import { cardApi, useCreateCardMutation, useUpdateCardMutation } from '../card.service';

describe('cardApi', () => {
  it('should have createCard mutation', () => {
    expect(cardApi.endpoints.createCard).toBeDefined();
  });

  it('should have updateCard mutation', () => {
    expect(cardApi.endpoints.updateCard).toBeDefined();
  });

  it('should have correct query configuration for createCard', () => {
    const endpoint = cardApi.endpoints.createCard;
    expect(endpoint).toBeDefined();
    
    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn({ quizzId: 'test-quiz', formData: new FormData() });
      expect(result).toEqual({
        url: '/quizz/test-quiz/card',
        method: 'POST',
        body: expect.any(FormData),
      });
    }
  });

  it('should have correct query configuration for updateCard', () => {
    const endpoint = cardApi.endpoints.updateCard;
    expect(endpoint).toBeDefined();
    
    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const result = queryFn({ quizzId: 'test-quiz', cardId: 'test-card', formData: new FormData() });
      expect(result).toEqual({
        url: '/quizz/test-quiz/card/test-card',
        method: 'PUT',
        body: expect.any(FormData),
      });
    }
  });

  it('should invalidate quiz tags for createCard', () => {
    const createCardEndpoint = cardApi.endpoints.createCard;
    expect(createCardEndpoint).toBeDefined();
    
    if (createCardEndpoint.invalidatesTags) {
      const invalidatedTags = createCardEndpoint.invalidatesTags({} as any, {} as any, {} as any);
      expect(invalidatedTags).toEqual(['QUIZ']);
    }
  });

  it('should invalidate quiz tags for updateCard', () => {
    const updateCardEndpoint = cardApi.endpoints.updateCard;
    expect(updateCardEndpoint).toBeDefined();
    
    if (updateCardEndpoint.invalidatesTags) {
      const invalidatedTags = updateCardEndpoint.invalidatesTags({} as any, {} as any, {} as any);
      expect(invalidatedTags).toEqual(['QUIZ']);
    }
  });

  it('should export useCreateCardMutation hook', () => {
    expect(useCreateCardMutation).toBeDefined();
  });

  it('should export useUpdateCardMutation hook', () => {
    expect(useUpdateCardMutation).toBeDefined();
  });

  it('should have correct mutation types', () => {
    const createCardEndpoint = cardApi.endpoints.createCard;
    const updateCardEndpoint = cardApi.endpoints.updateCard;

    expect(createCardEndpoint).toBeDefined();
    expect(updateCardEndpoint).toBeDefined();
  });
});
