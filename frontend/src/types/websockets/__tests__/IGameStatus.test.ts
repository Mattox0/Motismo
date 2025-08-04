import { IGameStatus } from '../IGameStatus';

describe('IGameStatus', () => {
  it('should have all expected status values', () => {
    expect(IGameStatus.NOT_STARTED).toBe('NOT_STARTED');
    expect(IGameStatus.DISPLAY_QUESTION).toBe('DISPLAY_QUESTION');
    expect(IGameStatus.DISPLAY_ANSWERS).toBe('DISPLAY_ANSWERS');
    expect(IGameStatus.DISPLAY_RANKING).toBe('DISPLAY_RANKING');
    expect(IGameStatus.FINISHED).toBe('FINISHED');
  });

  it('should have exactly 5 status values', () => {
    const statusValues = Object.values(IGameStatus);
    expect(statusValues).toHaveLength(5);
  });

  it('should have unique values', () => {
    const statusValues = Object.values(IGameStatus);
    const uniqueValues = new Set(statusValues);
    expect(uniqueValues.size).toBe(statusValues.length);
  });

  it('should be usable as string values', () => {
    const status: IGameStatus = IGameStatus.NOT_STARTED;
    expect(typeof status).toBe('string');
    expect(status).toBe('NOT_STARTED');
  });

  it('should allow comparison with string values', () => {
    expect(IGameStatus.DISPLAY_QUESTION === 'DISPLAY_QUESTION').toBe(true);
    expect(IGameStatus.FINISHED === 'FINISHED').toBe(true);
  });
});
