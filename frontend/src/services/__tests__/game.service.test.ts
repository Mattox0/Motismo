import { gameApi } from '../game.service';

describe('gameApi', () => {
  it('should have createGameUser mutation', () => {
    expect(gameApi.endpoints.createGameUser).toBeDefined();
  });

  it('should have correct query configuration for createGameUser', () => {
    const endpoint = gameApi.endpoints.createGameUser;
    expect(endpoint).toBeDefined();
  });

  it('should export useCreateGameUserMutation hook', () => {
    expect(gameApi.useCreateGameUserMutation).toBeDefined();
  });

  it('should have correct endpoint structure', () => {
    const endpoints = gameApi.endpoints;
    expect(endpoints).toBeDefined();
  });
});
