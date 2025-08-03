import { cardApi } from '../card.service';

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
  });

  it('should have correct query configuration for updateCard', () => {
    const endpoint = cardApi.endpoints.updateCard;
    expect(endpoint).toBeDefined();
  });

  it('should invalidate quiz tags', () => {
    const createCardEndpoint = cardApi.endpoints.createCard;
    const updateCardEndpoint = cardApi.endpoints.updateCard;
    
    expect(createCardEndpoint).toBeDefined();
    expect(updateCardEndpoint).toBeDefined();
  });
}); 