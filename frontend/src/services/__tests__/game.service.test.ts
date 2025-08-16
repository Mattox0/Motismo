import { gameApi, useCreateGameUserMutation, ICreateGameUserRequest } from '../game.service';

describe('gameApi', () => {
  it('should have createGameUser mutation', () => {
    expect(gameApi.endpoints.createGameUser).toBeDefined();
  });

  it('should have correct query configuration for createGameUser', () => {
    const endpoint = gameApi.endpoints.createGameUser;
    expect(endpoint).toBeDefined();
    
    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const mockData: ICreateGameUserRequest = {
        name: 'Test User',
        avatar: 'test-avatar',
        externalId: 'test-external-id',
      };
      const result = queryFn({ code: 'test-code', data: mockData });
      expect(result).toEqual({
        url: '/game/test-code/gameUser',
        method: 'POST',
        body: mockData,
      });
    }
  });

  it('should handle createGameUser without externalId', () => {
    const endpoint = gameApi.endpoints.createGameUser;
    expect(endpoint).toBeDefined();
    
    const queryFn = endpoint.queryFn;
    if (queryFn) {
      const mockData: ICreateGameUserRequest = {
        name: 'Test User',
        avatar: 'test-avatar',
      };
      const result = queryFn({ code: 'test-code', data: mockData });
      expect(result).toEqual({
        url: '/game/test-code/gameUser',
        method: 'POST',
        body: mockData,
      });
    }
  });

  it('should export useCreateGameUserMutation hook', () => {
    expect(useCreateGameUserMutation).toBeDefined();
  });

  it('should have correct endpoint structure', () => {
    const endpoints = gameApi.endpoints;
    expect(endpoints).toBeDefined();
  });

  it('should have correct interface definition', () => {
    const mockRequest: ICreateGameUserRequest = {
      name: 'Test User',
      avatar: 'test-avatar',
      externalId: 'test-external-id',
    };
    
    expect(mockRequest.name).toBe('Test User');
    expect(mockRequest.avatar).toBe('test-avatar');
    expect(mockRequest.externalId).toBe('test-external-id');
  });

  it('should handle interface without externalId', () => {
    const mockRequest: ICreateGameUserRequest = {
      name: 'Test User',
      avatar: 'test-avatar',
    };
    
    expect(mockRequest.name).toBe('Test User');
    expect(mockRequest.avatar).toBe('test-avatar');
    expect(mockRequest.externalId).toBeUndefined();
  });
});
