import { initializeCard } from '../initializeCard';

describe('initializeCard', () => {
  it('should return a FormData object', () => {
    const result = initializeCard();
    expect(result).toBeInstanceOf(FormData);
  });

  it('should append rectoText with empty string', () => {
    const result = initializeCard();
    expect(result.get('rectoText')).toBe('');
  });

  it('should append versoText with empty string', () => {
    const result = initializeCard();
    expect(result.get('versoText')).toBe('');
  });

  it('should have exactly 2 entries', () => {
    const result = initializeCard();
    const entries = Array.from(result.entries());
    expect(entries).toHaveLength(2);
  });

  it('should have the correct keys', () => {
    const result = initializeCard();
    const keys = Array.from(result.keys());
    expect(keys).toContain('rectoText');
    expect(keys).toContain('versoText');
  });

  it('should return a new FormData instance each time', () => {
    const result1 = initializeCard();
    const result2 = initializeCard();
    expect(result1).not.toBe(result2);
  });
}); 